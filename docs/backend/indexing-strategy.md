# Indexing Strategy 草案

## 原則

Index 依實際 query path 建立，不為每個欄位建立 index。Public API 不需要、也不得透過 raw telemetry 查詢取得公開資料。

| Query path | Index 方向 | 用途 |
| --- | --- | --- |
| Public restaurant list | public profile `slug` unique、restaurant public status/category、location area/region、sponsored、online order | 公開列表與篩選；複合 index 須依實際 filter/selectivity 驗證 |
| Distance sort future | restaurant/location 的 approved geo strategy + cursor key | 需先決定地理模型與隱私策略；不可先盲目建立地理 index |
| Cursor pagination | stable sort key + restaurant public id | 穩定下一頁，不使用 offset 掃描大量資料 |
| Restaurant detail | `restaurant_public_profiles.slug` unique | 單筆公開詳情 lookup |
| Menu | `restaurant_menu_categories(restaurant_id, display_order)`、`restaurant_menu_items(category_id, display_order)` | 公開菜單依分類/順序讀取 |
| Live status | `restaurant_live_status_snapshots.restaurant_id` primary/current access、`freshness`、`observed_at`、`received_at` | batch lookup、stale 判斷與營運監控 |
| Daily metrics | unique `(restaurant_id, metric_date)` | 日報表與公開摘要 |
| Hourly metrics | unique `(restaurant_id, hour_bucket)` | 小時報表與趨勢 |
| Device internal | device public UID/internal id unique、`status`、`last_seen_at` | internal registry/health，不供 Public API |
| Admin / merchant | tenant/merchant/actor + `created_at` | internal audit path，不供 Public API |

## 實作注意

- 複合 index 欄位順序需以實際 `WHERE`、`ORDER BY`、資料分布與 `EXPLAIN` 驗證。
- partial index 可用於 active/public rows，但需在正式 migration review 決定。
- metrics table 的日期分區、snapshot history 與 request logs index 需先量測 retention 與寫入量。
## Phase 7.1 Index Alignment

| Query path | Index direction | Purpose |
| --- | --- | --- |
| Active door topology | `doors(restaurant_id, is_active)` | 依餐廳載入有效門口，不供 Public API 直接查詢 |
| Door assignment | `door_sensor_assignments(door_id, assignment_status, valid_from DESC)`、device 對應索引 | 解析當時有效配置與更換歷史 |
| Calibration | unique `(device_id, calibration_version)`；`(door_id, status, activated_at DESC)` | 取得事件引用版本及目前有效校正 |
| Count Window | `(device_id, window_start DESC)`、`(door_id, window_start DESC)` | 裝置時間序列、亂序檢查與短期診斷 |
| Crossing Event | `(restaurant_id, occurred_at DESC)`、`(door_id, occurred_at DESC)` | occupancy 聚合與門口事件稽核 |
| Occupancy Snapshot | `restaurant_id` primary/unique | 每餐廳權威目前值，O(1) projection lookup |
| Occupancy Adjustment | `(restaurant_id, occurred_at DESC)` | 重建人工修正 ledger |
| Quality Incident | `(device_id, severity, started_at DESC)`、restaurant time | 裝置健康與事件調查 |
| OTA Deployment | `(device_id, state, last_reported_at DESC)`、`(campaign_id, state)` | 裝置進度、campaign cohort 統計 |
| OTA Event | `(deployment_id, occurred_at DESC)` | 部署事件時序 |

唯一鍵 `(device_id, boot_id, sequence_number)` 用於 idempotency，不取代時間索引。高寫入表不得為每個 quality flag 建 index；僅在 production-like `EXPLAIN` 與實際 incident 查詢證明需要時評估 JSONB expression/GIN index。Public API 不得以任何上述 index 查 count windows、crossing events 或 device data。
