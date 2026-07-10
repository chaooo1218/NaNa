# Device Contract HTTP JSON Mapping

> Phase 8 草案。Protobuf 與 JSON 描述同一語意，不代表任一格式已部署。

## 映射規則

| Protobuf | HTTP JSON | 規則 |
| --- | --- | --- |
| `snake_case` field | `lowerCamelCase` | 例如 `message_id` 對應 `messageId` |
| `uint64` / `int64` | 十進位字串 | 避免 JavaScript 整數精度損失 |
| `google.protobuf.Timestamp` | RFC 3339 UTC 字串 | 時鐘無效時省略或 `null`，並以 `timeStatus` 說明 |
| Enum | 無型別前綴的字串 | 例如 `QUALITY_FLAG_CLOCK_UNSYNCED` 對應 `CLOCK_UNSYNCED` |
| `repeated` | JSON array | Quality Flag 可同時多個；接收端去重 |
| `optional` scalar/message | 省略或 `null` | 不得以空字串冒充未知值 |
| `map<string,string>` | JSON object | 僅允許安全白名單 metadata |

HTTP header `X-Message-Id` 識別 request；payload 內每個 Count Window 的 `envelope.messageId` 識別資料項。兩者用途不同。`devicePublicUid` 只屬 Device API；MAC 與 DB internal device id 不參與映射。

## Envelope 與時間

- `messageId` 使用全域唯一、重送不變的識別；後端以它做第一層去重。
- `bootId` 每次開機產生新隨機值；`sequenceNumber` 在同一 boot 內單調增加，不因重送或 batch 重切而改變。
- `monotonicUptimeMs` 不受 NTP/系統時間校正影響且不得倒退；`sentAt` 可能無效，必須搭配 `timeStatus`。
- `synced`、`estimated`、`unsynced`、`invalid` 明確區分。後端可用 received time 與 monotonic uptime 輔助排序，但不得把估算時間當精確 occurred time。
- Envelope 不含 MAC、DB internal device id、tenant id、merchant id；`devicePublicUid` 只用於 Device API registry lookup。

Heartbeat 的 RSSI、reset reason、partition、heap、radar/network health 僅供 Device/Admin，必要時只向 Merchant 顯示粗粒度狀態。`SafeDiagnostic` 不得包含 Wi-Fi 密碼、token、certificate、完整 URL/query、private key、memory dump、raw coordinate 或 provider/database error。

## Count Window

- `windowDurationMs` 是實際窗口長度；後端不得從 nominal 5 秒反推時間。
- `windowStart/windowEnd` 在 `timeStatus=unsynced|invalid` 時可為 null。後端保留 `receivedAt`，並使用 boot/sequence/monotonic uptime 排序，不宣稱精確 occurred time。
- `localOccupancyCandidate`、`waitingCountCandidate` 保留 candidate 語意，不能映射成權威 occupancy。
- `qualityFlags` 對應 DB JSONB array，不採 DB enum。
- 不存在 raw LD2450 coordinates、永久人物 ID 或完整軌跡欄位。

## Quality Flag 語意

- Quality Flag 是品質訊號，不等同 fatal error；同一窗口可同時有多個 flag。
- `TARGET_CAPACITY_SATURATED` 與 `COUNT_MAY_BE_UNDERESTIMATED` 在 target peak 達硬體容量且持續超過設定門檻時共同出現。
- 後端依 flag、時間狀態、frame loss、offline gap 與 topology 調降 confidence/freshness，必要時停止公開 occupancy estimate。
- Public API 只輸出安全聚合後 freshness/confidence，不暴露完整 internal flags 或診斷。
- 新 flag 以版本化 Proto/JSON value 與 DB JSONB array 演進，不強迫危險 DB enum migration；未知 flag 需安全保留或忽略並記錄版本不相容。

## 批次與 ACK

- Batch 可重新切分，但 window `messageId`、`bootId`、`sequenceNumber` 不變。
- 服務以 message id 與 `(device, boot, sequence)` 雙重檢查 idempotency。
- `acceptedMessageIds`、`acceptedOutOfOrderMessageIds`、`duplicateMessageIds`、`rejectedItems` 分開；單一重複、亂序或驗證錯誤不使整批失敗。
- `highestContiguousSequence` 只表示連續接收水位，不表示較高亂序資料不存在。
- 最大 windows、payload bytes、offline age 由版本化 config 下發；Phase 8 不定 production 數值。

## Transport Neutrality

未來 MQTT payload 可使用同一 Protobuf message 或相同 JSON mapping。Topic、QoS、broker identity 不得改變 message identity、ACK 語意、版本、quality flag 或 anti-replay 規則。

## Configuration 套用

`DeviceConfiguration` 是完整 bundle，包含 assignment-scoped door reference、topology、coverage/overlap、DoorCalibration、AlgorithmConfiguration、UploadConfiguration、版本、checksum 與 validFrom。裝置不可自行猜 restaurant/door assignment。

裝置先下載暫存、驗證 schema/version/checksum、幾何完整性、direction sign、參數界限與硬體相容性，再於窗口邊界原子切換。任何驗證失敗均保留上一完整版本並回傳 safe ACK；不可混用新舊欄位或套用半份設定。`single`、`dualNonOverlap`、`dualOverlap` 皆可配置；overlap 最終 dedup 仍由後端負責。Phase 8 不定演算法參數 production 值。

## OTA Protocol

1. 裝置只接受經 Device API authentication 取得、來源與完整性可驗證的 manifest；artifact URL 必須短效或受控，且不得寫入 log。
2. 下載走 HTTPS/TLS，先驗 hardware、bootloader、current version 與 security version 相容，再下載至 inactive partition。
3. 寫入前後驗 SHA-256，並驗韌體簽章；message 永不包含 signing private key。
4. 候選版本開機後執行 NVS、核心 task、watchdog、UART、configuration、crash-loop 等本機健康檢查；不得只依賴 Wi-Fi 或後端連線。
5. 本機健康成功後才進 `confirmed`；失敗進 rollback，但目標版本 security version 不得低於 eFuse 或已撤銷基準。
6. 每個 security baseline 必須預留相容 recovery firmware。Campaign 可分批、暫停、撤回；一般功能更新不可任意增加 security version。
7. Phase 8 不啟用 Secure Boot/Flash Encryption、不燒 eFuse、不建立 artifact 或 signing key。

## Database Alignment

| Contract | Draft table |
| --- | --- |
| Device identity / heartbeat | `devices`、`device_heartbeats` |
| Door/config assignment | `doors`、`door_sensor_assignments` |
| DoorCalibration | `device_calibrations` |
| CountWindowTelemetry | `device_count_windows` |
| Backend crossing output | `door_crossing_events` |
| Backend occupancy projection | `restaurant_occupancy_snapshots` |
| Quality flags/incidents | JSONB flags、`device_quality_incidents` |
| Manifest/artifact | `firmware_releases`、`firmware_artifacts` |
| Deployment/progress | `ota_campaigns`、`ota_deployments`、`ota_device_events` |

Device payload 不直接寫 DB，也不提供 tenant/merchant/internal IDs；後端 authentication、assignment、validation、dedup 與 transaction 才能完成映射。本 Phase 不執行 SQL。

## 邊界

Public API 不回傳 `devicePublicUid`、boot/sequence、RSSI、reset reason、partition、calibration transform、OTA deployment 或完整 quality flags。Public 僅取得後端聚合後的 freshness/confidence 與 restaurant-level snapshot。
