# Public API Read Model 草案

## 範圍

本文件是 PostgreSQL 未來 read model 的 schema 方向，不是 migration、DDL 或已建立資料庫。Public API 只讀取已去識別、restaurant-level 的公開資料。

## 讀取原則

- Public API 不查 Raw Telemetry。
- `restaurant_live_status_snapshots` 只存 restaurant-level snapshot；雙門資料已在 ingestion/aggregation 層完成聚合。
- device raw events、裝置憑證與診斷資訊屬 internal Device Ingestion storage，不存在本 read model。
- `tenantId`、`merchantId` 可作內部 ownership relation，但不可直接映射為 Public API response 欄位。
- 日指標用於報表與公開摘要；不得每次 request 都掃描 raw events。

| Table | Purpose | Key columns | Public visibility | Retention direction | Index direction |
| --- | --- | --- | --- | --- | --- |
| `restaurants` | 餐廳核心識別與內部 ownership relation | `id`, internal ownership refs, `status`, `created_at` | 僅經 mapper 輸出公開欄位 | 長期，保留歷史狀態 | public slug lookup、status、ownership internal lookup |
| `restaurant_public_profiles` | 公開店名、簡介、封面、公開 slug | `restaurant_id`, `slug`, `name`, `description`, `cover_image` | 可公開 | 長期，保留版本/更新紀錄 | unique `slug`、公開狀態 |
| `restaurant_locations` | 公開區域、距離摘要與地址顯示策略 | `restaurant_id`, `area_label`, public location summary | 可公開，但非精準 device position | 長期，依店家更新 | `restaurant_id`、公開區域篩選 |
| `restaurant_business_hours` | 每日營業時間與公休 | `restaurant_id`, `day_of_week`, `open_time`, `close_time`, `is_closed` | 可公開 | 長期，需變更歷程方向 | `restaurant_id`, day lookup |
| `restaurant_tags` | 公開分類與標籤 | `restaurant_id`, `tag`, `display_order` | 可公開 | 長期，依店家更新 | `restaurant_id`, normalized tag |
| `restaurant_menu_categories` | 菜單分類 | `id`, `restaurant_id`, `name`, `display_order`, `is_public` | 僅公開分類 | 長期，需 soft disable 方向 | `restaurant_id`, public display order |
| `restaurant_menu_items` | 菜單預覽品項 | `id`, `category_id`, `name`, `price`, `availability`, flags | 可公開的品項欄位 | 長期，品項停用保留歷程 | `category_id`, public availability, display order |
| `restaurant_live_status_snapshots` | 最新餐廳級 Live Status | `restaurant_id`, `observed_at`, `received_at`, crowd/wait/freshness fields | 可公開的 snapshot 欄位 | 短期熱資料；依 SLA/成本決定保留期 | unique/current `restaurant_id`、freshness、observed time |
| `restaurant_daily_public_metrics` | 每日公開摘要與報表 read model | `restaurant_id`, `metric_date`, aggregate metrics, quality flags | 僅經公開摘要 mapper | 中長期 aggregate；不保存 raw events | unique `(restaurant_id, metric_date)`、日期範圍 |

## Snapshot 欄位方向

`restaurant_live_status_snapshots` 可包含 `traffic_count`、`traffic_window_seconds`、`waiting_count`、`estimated_wait_minutes`、`wait_time_confidence`、`crowd_level`、`occupancy_estimate`、`occupancy_confidence`、`freshness`、`observed_at`、`received_at`。

`traffic_count` 是流量指標，不可視為 occupancy。`occupancy_estimate` 和各 confidence 欄位可以是 `null`，以反映資料不足或未通過品質門檻。

## 後續資料流

Device Ingestion 先驗證裝置、去重與處理順序，再將有效事件聚合為 restaurant-level snapshot。Public read model 只消費聚合結果；Public API 再使用 mapper 過濾非公開欄位。
## Phase 7.1 Projection Alignment

Device Ingestion 的內部資料流方向為：

`device_count_windows -> door_crossing_events -> restaurant_occupancy_snapshots -> restaurant_live_status_snapshots -> Public API`

- `device_count_windows` 是約 5 秒裝置聚合，不是 raw coordinate storage，也不是 Public Read Model。
- `door_crossing_events` 由後端依 calibration、door topology 與 dedup policy 建立；雙模組資料不可由前端直接相加。
- `restaurant_occupancy_snapshots` 是後端事件與人工 adjustment 的權威計算結果。若 underflow、overlap 或資料品質不足，`display_occupancy` 可為 null。
- `restaurant_live_status_snapshots.occupancy_estimate/confidence` 僅投影可安全公開的 occupancy；`traffic_count` 仍是時間窗流量，不等於店內人數。
- Public API 不得查詢或回傳 door assignment、device/calibration id、count windows、crossing events、quality incidents、occupancy adjustments 或 OTA tables。
- Public response 不包含永久人物 ID、人物軌跡、raw coordinates、device key、tenant/merchant id 或內部 dedup decision。

此 alignment 不建立 ingestion worker、聚合作業或 API；正式 freshness、cache 與承載能力仍需後端實作及 load test 驗證。
