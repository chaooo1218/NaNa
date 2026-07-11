# Device Contract HTTP JSON Mapping

> Phase 8 草案。Protobuf 與 JSON 描述同一語意，不代表任一格式已部署。

## 映射規則

| Protobuf | HTTP JSON | 規則 |
| --- | --- | --- |
| `snake_case` field | `lowerCamelCase` | 例如 `message_id` 對應 `messageId` |
| `uint64` / `int64` | 十進位字串 | 避免 JavaScript 整數精度損失 |
| `google.protobuf.Timestamp` | RFC 3339 UTC 字串 | Device API optional timestamp 不可用時省略，並以 `timeStatus` 說明；只有 OpenAPI 明確 nullable 的欄位才可傳 `null` |
| Enum | 完整 Proto enum 名稱字串 | 例如 `QUALITY_FLAG_CLOCK_UNSYNCED` 原樣輸出 |
| `repeated` | JSON array | Quality Flag 可同時多個；接收端去重 |
| `optional` scalar/message | 欄位省略 | Device ProtoJSON 不以 `null` 代表 absence；不得以空字串冒充未知值 |
| `map<string,string>` | JSON object | 僅允許安全白名單 metadata |

## Identity 層級

| Identity | 權威語意 | Retry / re-batch 規則 |
| --- | --- | --- |
| `X-NaNa-Message-Id` | 本次 HTTP request 的裝置產生穩定識別；納入 HMAC、replay protection 與 request tracing | 相同 request bytes 重試時不變；Telemetry request 必須等於 body `batchId` |
| `batchId` | 一次 `UploadBatch` 組合的識別 | 原 batch 原樣重送時不變；切小或重組 batch 時產生新值 |
| Count Window `envelope.messageId` | 單一 Count Window 的全域 item identity | 補送或重新分 batch 時永不改變 |
| response `requestId` | API Gateway／Backend 產生的伺服器追蹤識別 | 不取代 device message、batch 或 window identity |
| `bootId + sequenceNumber` | 同一次開機內的順序與額外去重依據 | 重送不變；不取代全域 Count Window `messageId` |

`X-NaNa-Request-Id` 若提供，只是非權威 client correlation hint；response `requestId` 由伺服器產生。`devicePublicUid` 只屬 Device API；MAC 與 DB internal device id 不參與映射。Header 去重不可取代 batch 內每個 Count Window 的 item-level idempotency。

## Envelope 與時間

- `MessageEnvelope.messageId` 識別該 payload item；Count Window 的值全域唯一且重送、重新分 batch 都不變，後端以它做第一層 item 去重。
- `bootId` 每次開機產生新隨機值；`sequenceNumber` 在同一 boot 內單調增加，不因重送或 batch 重切而改變。
- `monotonicUptimeMs` 不受 NTP/系統時間校正影響且不得倒退；`sentAt` 可能無效，必須搭配 `timeStatus`。
- `synced`、`estimated`、`unsynced`、`invalid` 明確區分。後端可用 received time 與 monotonic uptime 輔助排序，但不得把估算時間當精確 occurred time。
- Envelope 不含 MAC、DB internal device id、tenant id、merchant id；`devicePublicUid` 只用於 Device API registry lookup。

Heartbeat 的 RSSI、reset reason、partition、heap、radar/network health 僅供 Device/Admin，必要時只向 Merchant 顯示粗粒度狀態。`SafeDiagnostic` 不得包含 Wi-Fi 密碼、token、certificate、完整 URL/query、private key、memory dump、raw coordinate 或 provider/database error。

## Presence、Null 與零值

- **omitted / absent**：Proto optional 未出現，表示 sender 未提供該值；receiver 不得自行補成零值。
- **explicit `null`**：Device API 預設不接受；僅限 OpenAPI schema 明確宣告 nullable 的欄位。Public API 的 nullable projection 是不同 trust boundary。
- **zero value**：欄位確實出現且值為 `0`，必須保留其業務語意。
- **unknown**：sender 無法判定；使用明確 enum 狀態或省略 optional 欄位，不使用 magic value。
- **unavailable**：資料來源目前不可用；使用明確 health/freshness/status，不以 `0` 偽裝。
- **not applicable**：該情境不適用；省略 optional 欄位或使用契約明定狀態，不傳 `-1`、`999999`、空字串等替代值。

## 關鍵欄位矩陣

| Proto 欄位 | HTTP JSON | JSON 型別 | Required / nullable | 範例 | 相容性／零值語意 |
| --- | --- | --- | --- | --- | --- |
| `message_id` | `messageId` | string UUID | required / no | `"4f5f4a40-..."` | 重送不變 |
| `boot_id` | `bootId` | string | required / no | `"boot-random-id"` | 每次開機更新 |
| `sequence_number` | `sequenceNumber` | decimal string | required / no | `"123456789012345"` | uint64；同 boot 單調增加 |
| `sent_at` | `sentAt` | RFC 3339 string | optional / no | `"2026-07-11T04:00:00Z"` | absent 由 `timeStatus` 解釋 |
| `monotonic_uptime_ms` | `monotonicUptimeMs` | decimal string | required / no | `"9876543210"` | uint64；不得倒退 |
| `entry_delta` | `entryDelta` | integer | required / no | `0` | Proto optional 用 presence 驗證；0 表示有效計算且無 entry |
| `exit_delta` | `exitDelta` | integer | required / no | `0` | Proto optional 用 presence 驗證；不可為負 |
| `local_occupancy_candidate` | `localOccupancyCandidate` | integer | optional / no | `0` | 0 是候選零人；absent 表示未產生可信候選，後端不可補 0 |
| `waiting_count_candidate` | `waitingCountCandidate` | integer | optional / no | `0` | 0 與 absent 不同；不是權威等待數 |
| `quality_flags` | `qualityFlags` | string array | required / no | `["QUALITY_FLAG_OFFLINE_GAP"]` | 可多值；使用完整 Proto enum 名稱 |
| `oldest_buffered_at` | `oldestBufferedAt` | RFC 3339 string | optional / no | `"2026-07-11T03:00:00Z"` | 未離線補送時省略 |
| `highest_contiguous_sequence` | `highestContiguousSequence` | decimal string | optional / no | `"120"` | uint64；不是收到過的最大值 |
| `recommended_retry_after_ms` | `recommendedRetryAfterMs` | integer | optional / no | `5000` | uint32；absent 表示無額外建議 |
| confidence scalar | `*Confidence` | number | optional / no | `0` | 0 是契約允許的最低信心；omitted 是未產生／不可用，不可互換 |
| `last_valid_radar_frame_at` | `lastValidRadarFrameAt` | RFC 3339 string | optional / no | `"2026-07-11T04:00:00Z"` | 尚無有效 frame 時省略，不傳 `null` |
| `last_successful_upload_at` | `lastSuccessfulUploadAt` | RFC 3339 string | optional / no | `"2026-07-11T04:00:00Z"` | 尚無成功 upload 時省略，不傳 `null` |
| `pending_ota_deployment_id` | `pendingOtaDeploymentId` | string | optional / no | `"deployment-123"` | 無待處理部署時省略，不使用空字串 |
| `minimum_current_version` | `minimumCurrentVersion` | string | optional / no | `"1.2.0"` | 無下限時省略 |
| `maximum_current_version` | `maximumCurrentVersion` | string | optional / no | `"1.9.9"` | 無上限時省略 |
| `rollout_deadline` | `rolloutDeadline` | RFC 3339 string | optional / no | `"2026-07-31T00:00:00Z"` | 無 deadline 時省略 |
| `recovery_release_reference` | `recoveryReleaseReference` | string | optional / no | `"recovery-2"` | 無指定 recovery release 時省略 |
| `uptime_seconds` | `uptimeSeconds` | decimal string | required / no | `"86400"` | uint64 |
| `free_heap_bytes` | `freeHeapBytes` | decimal string | required / no | `"1048576"` | uint64；避免 JS 精度損失 |
| `artifact_size_bytes` | `artifact.artifactSizeBytes` | decimal string | required / no | `"16777216"` | uint64 |
| `bytes_downloaded` | `bytesDownloaded` | decimal string | required / no | `"8388608"` | uint64 |
| `error_code` | `errorCode` | enum string | optional / no | `"OTA_ERROR_CODE_TIMEOUT"` | absent 表示無錯誤；不使用 zero enum 當錯誤 |
| `safe_error_detail` | `safeErrorDetail` | string | optional / no | `"download timed out"` | 不含 URL、stack 或 signature detail |
| Public occupancy | `occupancyEstimate` | integer or null | public required / nullable | `null` | Public 特有 nullable；不可信時不可硬填 0 |

HTTP profile 對 required scalar 比 Proto binary 更嚴格：缺少 `entryDelta/exitDelta` 是 item validation rejection；提供 `0` 是有效值。Device optional 欄位以「省略」表示 absence，不接受 `null`。Public API 的 nullable snapshot 是另一個已去敏 read boundary。

## Count Window

- `windowDurationMs` 是實際窗口長度；後端不得從 nominal 5 秒反推時間。
- `windowStart/windowEnd` 在 `timeStatus=TIME_SYNC_STATE_UNSYNCED|TIME_SYNC_STATE_INVALID` 時可省略。後端產生 `receivedAt`，並使用 boot/sequence/monotonic uptime 排序，不宣稱精確 occurred time。
- `localOccupancyCandidate`、`waitingCountCandidate` 保留 candidate 語意，不能映射成權威 occupancy。
- `qualityFlags` 對應 DB JSONB array，不採 DB enum。
- 不存在 raw LD2450 coordinates、永久人物 ID 或完整軌跡欄位。

## Quality Flag 語意

- Quality Flag 是品質訊號，不等同 fatal error；同一窗口可同時有多個 flag。
- `QUALITY_FLAG_TARGET_CAPACITY_SATURATED` 與 `QUALITY_FLAG_COUNT_MAY_BE_UNDERESTIMATED` 在三個 target slots 持續有效約 500–1000ms、超過版本化 `saturationConfirmMs` 時共同出現。
- 後端依 flag、時間狀態、frame loss、offline gap 與 topology 調降 confidence/freshness，必要時停止公開 occupancy estimate。
- Public API 只輸出安全聚合後 freshness/confidence，不暴露完整 internal flags 或診斷。
- 新 flag 以版本化 Proto/JSON value 與 DB JSONB array 演進，不強迫危險 DB enum migration。Binary Proto 保留未知 enum 數值；HTTP 收到目前 schema 不認識的 enum 時只拒絕該 item，回安全、非 retryable version error，不得使整批 parser 崩潰。新值需提高 schema contract version。

## 批次與 ACK

- Batch 可重新切分，但 window `messageId`、`bootId`、`sequenceNumber` 不變。
- 原 batch 原樣重送時 `batchId` 與 `X-NaNa-Message-Id` 不變；重新切分或重組時使用新的 `batchId`，且 Header 必須等於新 `batchId`。
- 服務以 message id 與 `(device, boot, sequence)` 雙重檢查 idempotency。
- `acceptedMessageIds`、`acceptedOutOfOrderMessageIds`、`duplicateMessageIds`、`rejectedItems` 分開；單一重複、亂序或驗證錯誤不使整批失敗。
- 四組 message identity 必須 pairwise disjoint。普通 identical duplicate 使用 HTTP 200 並列入 duplicate；不得再次建立 crossing。相同 identity 但內容衝突才使用 409。
- `highestContiguousSequence` 是該 device + boot 從已知起點連續持久化且完成 idempotency 判定的最高 sequence；不是收到過的最大值，也不跨 boot。
- Batch-level 無法驗證 authentication、JSON envelope 或 payload size 時使用 4xx/413，不回 item success。可解析的 item validation 使用 HTTP 200 partial ACK；`retryable` 必須與 safe error code 一致。
- 413 後可切小 batch，但 window identity 不變。429 遵守 `Retry-After`；5xx 使用 bounded backoff；401/403 與非 retryable 4xx 不得高速或無限重試。
- OpenAPI 暫定每批絕對上限 120 windows；runtime config 只能設定相同或更低值。Payload bytes 與 offline age 另由版本化 config/413 控制；正式值待後端與裝置測試定案。

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
5. 本機健康成功後才進 `OTA_STATE_CONFIRMED`；失敗進 rollback，但目標版本 security version 不得低於 eFuse 或已撤銷基準。單獨 Wi-Fi/後端連線失敗不可觸發 firmware rollback。
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
