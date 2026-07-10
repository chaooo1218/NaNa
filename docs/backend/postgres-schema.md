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
## Phase 7.1：Device、Occupancy、Calibration 與 OTA Alignment

> 本節與 SQL 均為架構草案，不代表資料庫、裝置上線、Secure Boot 或 OTA 已啟用。

### Door 與多感測器拓撲

| Table | Purpose / key columns | PK / FK / nullable | Public visibility | Retention / index / security notes |
| --- | --- | --- | --- | --- |
| `doors` | 餐廳出入口模型；`restaurant_id`、`public_label`、`topology`、`direction_convention`、`is_active`、timestamps | PK `id`；FK restaurant；`public_label` 同餐廳唯一 | 僅可經 mapper 回傳無內部 ID 的門口描述 | `restaurant_id + is_active`；不得包含裝置識別 |
| `door_sensor_assignments` | 門口與感測器版本化配置；coverage segment、overlap policy、priority、configuration version、validity | PK `id`；FK door/device；`valid_to` nullable | 不公開 | 依 door/device + status 查詢；保留 assignment history |

`topology` 僅允許 `single`、`dual_non_overlap`、`dual_overlap`。新安裝優先使用 `dual_non_overlap`；雙模組不得預設直接相加。`dual_overlap` 必須經後端去重，無法確定時標記 `MULTI_SENSOR_OVERLAP_UNCERTAIN`，不得把結果包裝成高信心資料。

### Calibration

`device_calibrations` 保存 device/door 的不可變版本，包含 mount height、pitch/yaw/roll、sensor-to-door transform、門線座標、inside/outside/buffer zones、hysteresis、direction sign、checksum、狀態與 audit reference。PK 為 `id`，FK 指向 tenant/device/door；`activated_at`、`superseded_at` nullable；`(device_id, calibration_version)` 與 checksum 唯一。

正式校正不可原地覆寫。更正時新增版本，舊版本轉為 `superseded`，事件與窗口仍引用當時版本。狀態語意為 `draft`、`active`、`superseded`、`invalid`。

### 五秒 Count Window 與 Crossing Ledger

| Table | Purpose / key columns | Constraints | Public visibility | Retention direction |
| --- | --- | --- | --- | --- |
| `device_count_windows` | 每約 5 秒聚合；message/boot/sequence、schema/calibration version、window、entry/exit delta、候選 occupancy/waiting、frame/quality/firmware | `message_id` 唯一；`(device_id, boot_id, sequence_number)` 唯一；quality flags 為 JSONB array | 不公開 | 短期保存，彙總後刪除或歸檔 |
| `door_crossing_events` | 穿越事件 ledger；restaurant/door/source device、sequence、direction、confidence、dedup/aggregation decision | `event_id` PK；`(restaurant_id, dedup_key)` 唯一 | 不公開 | 長於 count window；彙總後依政策歸檔 |

Count Window 不保存 raw coordinate 或人物軌跡。唯一鍵提供重送 idempotency；boot/sequence 與時間索引讓後端辨識亂序。`local_occupancy_candidate` 只是裝置候選值，不能作為權威 occupancy。Quality flags 使用可擴充 JSONB 陣列，避免頻繁危險 enum migration。

Crossing Event 只記 entry/exit，不保存永久人物 ID 或可識別追蹤資料。重疊拓撲必須記錄 dedup status、decision summary 與 quality flag。

### Occupancy 權威模型

| Table | Purpose / key columns | PK / FK / nullable | Public visibility | Retention / security notes |
| --- | --- | --- | --- | --- |
| `restaurant_occupancy_snapshots` | 後端由可信 crossing events 與人工修正計算的目前值 | PK/FK `restaurant_id`；display/confidence/timestamps nullable | 只經 live snapshot mapper 回傳可公開欄位 | 每餐廳唯一目前值；版本化更新 |
| `occupancy_adjustments` | 人工或系統修正 ledger；delta 或 corrected value、reason、operator、before/after、audit | PK `id`；FK tenant/restaurant；operator id nullable；delta/corrected 二擇一 | 不公開 | 長期 audit retention；不可記錄 token/secret |

`raw_occupancy` 可呈現負值以保留計算事實；不得靜默截為 0。發生 underflow 時建立 `COUNT_UNDERFLOW` incident，並可令 `display_occupancy = null`。Public API 只取得可安全顯示的 restaurant-level estimate/confidence，不取得 adjustment 或 operator 細節。

### Quality Incident

`device_quality_incidents` 保存 device/door/restaurant scope、incident code、severity、起訖時間、受影響窗口數、安全診斷摘要及 ack/resolution。支援：`TARGET_CAPACITY_SATURATED`、`COUNT_MAY_BE_UNDERESTIMATED`、`RADAR_FRAME_LOSS`、`TRACK_ASSOCIATION_UNCERTAIN`、`CALIBRATION_INVALID`、`CLOCK_UNSYNCED`、`OFFLINE_GAP`、`COUNT_UNDERFLOW`、`MULTI_SENSOR_OVERLAP_UNCERTAIN`。不得保存 secret、完整雷達人物軌跡或永久人物識別。

### OTA Control Plane

| Table | Purpose | Key columns / constraints | Public visibility | Retention / privacy notes |
| --- | --- | --- | --- | --- |
| `firmware_releases` | 韌體發布與核准狀態 | semantic/security version、hardware compatibility、minimum bootloader、status、audit reference | 不公開 | 保留發布與撤銷歷史 |
| `firmware_artifacts` | Artifact 完整性 metadata | release、type、storage reference、SHA-256、signature metadata、size、signed | 不公開 | 僅 metadata；絕不保存 signing private key |
| `ota_campaigns` | 分批 rollout 控制 | release、strategy、cohort、percentage、status、pause/withdraw reason | 不公開 | 保留 campaign audit history |
| `ota_deployments` | 每裝置部署狀態 | campaign/device、前後版本與 security version、state/progress/error | 不公開 | device/campaign/state 索引；長期稽核方向 |
| `ota_device_events` | 部署事件 ledger | deployment、event、version、progress/error、safe metadata、time | 不公開 | metadata 白名單；不得記錄憑證 |

#### Anti-Rollback 語意

- Semantic version 與 security version 分離；一般功能更新不可任意增加 security version。
- Rollback 目標的 security version 必須大於或等於裝置 eFuse 記錄值。
- 已撤銷的安全基準不可恢復；需預先準備符合目前 security version 的 recovery firmware。
- 簽章私鑰不可進入 Repo、DB、Firmware、Artifact metadata 或 CI log。
- 本 Phase 不啟用 Secure Boot、不燒 eFuse、不建立真實 Artifact，也不執行 OTA。

### Public 邊界

Public API 仍只讀取 restaurant-level profile、menu、`restaurant_live_status_snapshots` 與安全的 occupancy projection。不得直接查詢 doors 的內部配置、assignment、calibration、count windows、crossing events、quality incident、OTA 或 device identifiers。
