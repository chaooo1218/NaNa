# Offline Buffer 與 Retry Contract

## 儲存模型

- 儲存單位為完整 Count Window，不是 radar frame、raw coordinate 或人物軌跡。
- 即時處理先寫有界 RAM queue；網路失敗或 queue 水位達門檻後，以 journal/ring buffer 方向持久化。
- 每個 window 的 `messageId`、`bootId`、`sequenceNumber` 建立後永不改變。Batch 可重切，window identity 不變。
- 按 oldest-first 補送；新即時窗口仍獨立進入處理 queue，補送不得阻塞 UART/parser/crossing task。
- buffer 使用固定容量與最大 age；數值由 `UploadConfiguration` 下發，Phase 8 不定 production 值。

## Retry Matrix

| 結果 | 行為 |
| --- | --- |
| Timeout / connection failure | bounded exponential backoff + random jitter；保留原 identity |
| `429` | 遵守 `Retry-After`；不得提前高速重試 |
| `5xx` | 有上限重試；達上限後回 buffer，延後下一輪 |
| `400/422` validation | 依 `rejectedItems` 隔離不可重試項；設定更新後才可重新評估 |
| `401/403` | fail closed；停止一般重試，進 credential recovery/運維告警 |
| Duplicate | 視為已持久化成功，可移除該 window |
| Partial acceptance | 僅保留 retryable rejected items；accepted/duplicate 立即確認 |

HTTP connect/read/overall timeout 必須有界。Backoff 有最大值與總重試預算；reboot 後從持久化 metadata 恢復，不重設 window identity 或 sequence。

## Buffer 滿載降級

1. 先產生 `QUALITY_FLAG_LOCAL_BUFFER_NEAR_CAPACITY`。
2. 降低非必要 diagnostic/heartbeat 頻率，不降低 radar parser 優先級。
3. 到容量上限時依明確 policy 淘汰最舊且超過最大 age 的窗口，持久保存 `droppedWindowCount` 與時間範圍，並以 allowlisted `SafeDiagnostic` 或 internal quality incident 上報；不可靜默遺失、無限擴張或覆蓋未記錄。
4. 恢復連線後加入 `QUALITY_FLAG_OFFLINE_GAP`、`QUALITY_FLAG_NETWORK_UPLOAD_DELAYED`，讓後端降低 freshness/confidence。

Flash 採批次寫入、頁面輪替與寫入次數監控方向，避免每 frame 寫入。正式容量、wear leveling、掉電一致性與 NVS/partition 選擇需在 Phase 8.5/9 以硬體測試定案。

## 時鐘未同步

Clock-unsynced window 保留 monotonic uptime、boot/sequence、duration 與 `QUALITY_FLAG_CLOCK_UNSYNCED`。後端可用 `receivedAt` 和相鄰已同步點估算排序，但不得宣稱其 absolute occurred time 精確。
