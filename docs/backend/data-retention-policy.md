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
## Phase 7.1 Retention Alignment

以下皆為成本與法務審查前的建議區間，不是已上線政策。

| Data level | Purpose | Suggested retention | Public | Aggregation / deletion direction | Cost risk |
| --- | --- | --- | --- | --- | --- |
| Device Count Window | 約 5 秒聚合、重送與品質診斷 | hot 7–30 天 | 否 | 先彙總 hourly/daily，再刪除或低成本歸檔 | 極高寫入量；禁止永久保存 |
| Door Crossing Event | occupancy 計算與 dedup audit | 30–90 天，再依事件/法務需求歸檔 | 否 | 長於 count window；完成 metrics 後分區刪除/歸檔 | 高；重疊門口事件量增加 |
| Occupancy Snapshot | 每餐廳目前權威狀態 | 僅目前值；必要時短歷史 | 只公開安全 projection | upsert/current projection | 低 |
| Occupancy Adjustment | 人工/系統修正稽核 | 建議 1–3 年，待法務確認 | 否 | append-only、到期封存/刪除 | 中；含內部 operator reference |
| Device Calibration | 重現歷史事件所需配置版本 | 裝置生命週期加稽核期 | 否 | immutable；superseded 不立即刪除 | 低 |
| Quality Incident | 品質追蹤與 SLA 分析 | 90–365 天，依 severity 分級 | 否 | 摘要長留，診斷細節較早刪除 | 中；摘要需去敏 |
| OTA Release/Campaign/Deployment Audit | 發布、撤銷、裝置升級稽核 | 建議 1–3 年或更長，待合約/法務確認 | 否 | append/event archive；不得保存 key | 中 |
| OTA Device Event | OTA 問題診斷 | hot 90 天，摘要與關鍵失敗長留 | 否 | 事件壓縮/歸檔 | 高頻 rollout 時中至高 |
| Raw Coordinate | 預設不進正式 schema | 不保存 | 否 | 若未來例外啟用，需獨立核准與極短 TTL | 最高隱私與儲存風險 |
| Debug Data | 短期故障診斷 | 1–14 天 | 否 | 自動 TTL/delete | 高，且可能誤收敏感資料 |

刪除工作、partition、archive storage 與法務 retention 尚未實作。Public request/OTA metadata 不得包含 token、device key、簽章私鑰、完整 request body 或雷達人物軌跡。
