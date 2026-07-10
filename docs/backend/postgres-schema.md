# PostgreSQL Schema 草案

## 狀態與邊界

本文件是未來 PostgreSQL 設計草案，不是已上線資料庫、migration 或 DB connection。Public API 只讀取經 mapper 篩選的 restaurant-level 公開資料；`tenant_id`、`merchant_id` 與 device 資料僅供內部隔離與營運使用。

## 關係方向

`tenant -> merchant -> restaurant -> location / public profile / menu / live snapshot`。Device 透過 assignment 指向 restaurant；雙門或多裝置事件須先在後端聚合，再寫入 restaurant-level snapshot。

## 核心商業資料

| Table | Purpose / key columns | PK / FK | Nullable | Public visibility | Retention / indexes / privacy |
| --- | --- | --- | --- | --- | --- |
| `tenants` | 商業隔離根；`id`, `slug`, `name`, `status` | PK `id` | `slug`、`name` 不可空 | 不公開 | 長期；unique slug；不可從 Public API 輸出 |
| `merchants` | 商家；`tenant_id`, `name`, `status` | PK `id`; FK tenant | `status` 可預設 | 不公開 | 長期；`tenant_id` index；商家名稱不直接作 Public API identity |
| `merchant_users` | 商家使用者綁定；`tenant_id`, `merchant_id`, `auth_subject` | PK `id`; FK tenant/merchant | `display_name` 可空 | 不公開 | 長期與稽核；unique merchant/user subject；不存 token |
| `restaurants` | 店家核心、內部 ownership；`tenant_id`, `merchant_id`, `public_id`, `status` | PK `id`; FK tenant/merchant | `closed_at` 可空 | 只公開 mapper 選定欄位 | 長期；unique public id、tenant/merchant/status index；tenant/merchant 不公開 |
| `restaurant_public_profiles` | 店名、slug、簡介、封面 | PK `restaurant_id`; FK restaurant | `description`, `cover_image` 可空 | 可公開 | 長期；unique slug；只保留公開內容 |
| `restaurant_locations` | 區域與公開位置摘要 | PK `id`; FK restaurant | `region_code`, distance metadata 可空 | 僅公開區域/摘要 | 長期；restaurant/area index；不存 device 位置或 Public API 精準裝置座標 |
| `restaurant_business_hours` | 每日營業時間 | PK `id`; FK restaurant | `open_time`, `close_time` 可空，公休日使用 | 可公開 | 長期；unique restaurant/day；每日 lookup index |
| `restaurant_tags` | 公開分類/標籤 | PK `id`; FK restaurant | 無必要 nullable | 可公開 | 長期；restaurant/tag/display order index |
| `restaurant_menu_categories` | 公開菜單分類 | PK `id`; FK restaurant | `is_public` 有預設 | 可公開的分類 | 長期；restaurant/display order index；不含訂單/付款欄位 |
| `restaurant_menu_items` | 菜單預覽品項與價格 | PK `id`; FK category | `description` 可空 | 可公開的品項 | 長期；category/display order、availability index；不含庫存、付款、POS |

## 裝置與人流資料

| Table | Purpose / key columns | PK / FK | Nullable | Public visibility | Retention / indexes / privacy |
| --- | --- | --- | --- | --- | --- |
| `devices` | 裝置 registry；`tenant_id`, `device_public_uid`, `status`, `last_seen_at` | PK `id`; FK tenant | `last_seen_at`, `retired_at` 可空 | 不公開 | 長期；unique internal/public UID、status/last seen index；Public API 不輸出 device id |
| `restaurant_device_assignments` | 裝置與店家期間關係；`device_id`, `restaurant_id`, `assignment_status` | PK `id`; FK device/restaurant | `ended_at`, `replacement_reason` 可空 | 不公開 | 保留 assignment history；active assignment unique/index；支援雙門聚合，不公開門店細節 |
| `device_heartbeats` | 裝置健康摘要 | PK `id`; FK device | health summary、observed time 依狀況可空 | 不公開 | 短至中期；device/observed time index；不記錄 secret 或 raw telemetry |
| `restaurant_live_status_snapshots` | 最新 restaurant-level aggregate status | PK/FK `restaurant_id` | traffic/wait/occupancy/confidence/time 可空 | 可經 Public API 輸出 | 短期 current snapshot；freshness/observed/received index；不存 raw event、雙門已聚合 |
| `restaurant_daily_public_metrics` | 每日 aggregate report/read model | PK `id`; FK restaurant | quality metrics 可空 | 僅公開摘要 mapper | 中長期；unique restaurant/date；禁止每 request 掃 raw event |
| `restaurant_hourly_metrics` | 每小時 aggregate report/read model | PK `id`; FK restaurant | quality metrics 可空 | 不直接公開 raw aggregate | 中期；unique restaurant/hour bucket；供報表/摘要 |

## 系統與稽核

| Table | Purpose / key columns | PK / FK | Nullable | Public visibility | Retention / indexes / privacy |
| --- | --- | --- | --- | --- | --- |
| `public_api_request_logs` | API 可靠性與 rate limit 摘要 | PK `id`; restaurant FK 非必要 | restaurant/request reference 可空 | 不公開 | 短期；request id、route/status/created index；不存 token、完整 IP 或 request body |
| `admin_audit_logs` | 管理操作稽核 | PK `id`; tenant/admin actor ref direction | target/metadata 可空 | 不公開 | 較長；tenant/actor/created index；metadata redact，無 secret |
| `merchant_audit_logs` | 商家操作稽核 | PK `id`; tenant/merchant/actor ref | target/metadata 可空 | 不公開 | 較長；merchant/actor/created index；隔離 tenant，無 secret |

## Enum / 狀態語意

| DB enum | Values | Public / TypeScript mapping |
| --- | --- | --- |
| `restaurant_status` | `open`, `closed`, `unknown` | 直接對應 `RestaurantStatus` |
| `crowd_level` | `empty`, `low`, `moderate`, `busy`, `peak`, `closed`, `unknown` | 直接對應 `CrowdLevel` |
| `data_freshness` | `fresh`, `delayed`, `stale`, `unavailable` | 直接對應 `DataFreshness` |
| `menu_availability_status` | `available`, `sold_out`, `hidden` | mapper 將 `sold_out` 轉為 Public API/TypeScript `soldOut` |
| `device_status` | `provisioned`, `active`, `offline`, `maintenance`, `retired`, `unknown` | internal only，不進 Public API |
| `assignment_status` | `active`, `inactive`, `replaced` | internal only，不進 Public API |

## Read Model 一致性

本草案延續 Phase 6：Public list 以公開 profile/location/tag/status 查詢；detail 以 slug unique lookup；menu 以 restaurant/category/display order 查詢；Live Status 只讀 `restaurant_live_status_snapshots`。raw telemetry、device events、tenant/merchant/device identifiers 不進 Public API read path。
