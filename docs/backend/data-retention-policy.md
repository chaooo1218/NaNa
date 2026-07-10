# Data Retention Policy 草案

| 資料層級 | Purpose | Suggested retention | Public | Aggregation / deletion direction | Cost risk |
| --- | --- | --- | --- | --- | --- |
| Live Snapshot | 目前 restaurant-level status | 僅最新狀態或短歷史；正式期程待 SLA 決定 | 可經 mapper 公開 | 以最新 snapshot upsert；過期歷史清理 | 高頻寫入與 cache miss |
| Hourly Metrics | 小時趨勢/報表 | 中期保留 | 不直接公開 | 由 aggregate 產生；到期 archive/delete | 累積量與 index 成本 |
| Daily Metrics | 日報表/公開摘要 | 中長期保留 | 僅摘要 mapper | 從 hourly/aggregate 產生；較適合長期 archive | 低於 raw data |
| Device Heartbeat | 健康摘要 | 短至中期 | 不公開 | 彙總後清理舊 heartbeat | 裝置數成長 |
| Raw Telemetry future internal storage | Device debugging/algorithm validation | 必須有限期，依用途明定 | 不公開 | internal ingestion storage；先 aggregate 再刪除/archive | 最高，禁止無限保存 |
| Debug Data | 問題排查 | 最短必要期間 | 不公開 | 自動過期、人工延長需稽核 | 容易失控與含敏感風險 |
| Audit Logs | 安全與責任追蹤 | 較長，依法務/合約確認 | 不公開 | append-only direction；過期 archive/delete | 長期 storage，需 redact |
| Public API Request Logs | 可靠性、rate limit、濫用分析 | 短期或 aggregate 後保留 | 不公開 | 只留必要摘要；不存 token、完整敏感資料 | 高 QPS 寫入成本 |

## 原則

- raw telemetry 與 debug data 不可無限保存。
- Public API request logs 不存完整 request body、token、secret 或可避免的個資。
- retention、archive、deletion job 需在正式 backend/infra phase 建立並可觀測；本文件不建立 job。
