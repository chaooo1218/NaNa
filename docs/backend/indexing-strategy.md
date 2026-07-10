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
