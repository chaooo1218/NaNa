# Migration Plan 草案

## 狀態

本文件與 `contracts/sql/001_initial_schema_draft.sql` 僅供架構審查與未來 migration planning。Phase 7 不執行 migration、不建立 database connection、不建立自動執行 migration 目錄。

## 命名規則

- 建議格式：`NNN_<domain>_<change>.sql`，例如 `001_initial_schema.sql`。
- 一個 migration 只處理一個可回滾的 domain change。
- 不修改已在環境執行的 migration；後續變更以新 migration 表達。

## 初始化順序

1. 建立必要 enum / lookup value：restaurant、crowd、freshness、menu、device、assignment status。
2. 建立 `tenants`、`merchants`、`merchant_users`。
3. 建立 `restaurants` 與 public profile/location/business hours/tags。
4. 建立 menu category / item tables。
5. 建立 devices、restaurant-device assignments、heartbeats。
6. 建立 live snapshots、hourly metrics、daily metrics。
7. 建立 public request logs 與 audit logs。
8. 建立 query-driven indexes。
9. 建立 foreign keys、unique constraints、check constraints。

## Rollback 原則

- production migration 必須先備份與驗證 rollback path。
- 避免直接 drop 有資料的 table/column；採 expand/migrate/contract。
- 大型 index 或資料回填須分批，避免長時間鎖表。
- 不以 rollback 刪除 audit、metrics 或商業資料；改用明確修正 migration。

## Seed Data 原則

- 僅在 local/dev 使用可重複、非敏感的 fixture。
- seed 不含真實 device key、token、MAC、個資或正式商家資料。
- menu/restaurant seed 需明確標示測試資料。

## 環境差異

| 環境 | 原則 |
| --- | --- |
| Dev | 可使用 disposable DB、測試 seed、完整 schema reset 流程 |
| Staging | 使用 production-like migration order、遮罩測試資料、驗證 rollback |
| Production | 需變更審查、備份、執行窗口、監控、rollback runbook；不可直接套用未審查草案 |
## Phase 7.1 Migration Alignment

本節只調整未來 migration 順序；本 Phase 不執行 SQL。

1. 建立 door topology、crossing direction、calibration status 等穩定 lookup/enum。
2. 在既有 restaurant/device 後建立 `doors`、`door_sensor_assignments`。
3. 建立 immutable `device_calibrations`，再建立 `device_count_windows`。
4. 建立 `door_crossing_events`、`device_quality_incidents`。
5. 建立 `restaurant_occupancy_snapshots`、append-only `occupancy_adjustments`。
6. 建立 firmware release/artifact，再建立 campaign/deployment/device event。
7. 最後建立 query-driven indexes、唯一鍵、時間與 JSON shape constraints。

校正與 audit ledger 採 expand/migrate/contract，已啟用版本不可原地覆寫。Count Window 的 `(device_id, boot_id, sequence_number)` 與 `message_id` 必須先驗證重複資料再加唯一約束。Occupancy backfill 要保留 underflow 並建立 incident，不可用 `GREATEST(value, 0)` 隱藏問題。

OTA migration 不包含 artifact binary、signing private key、Secure Boot 設定或 eFuse 操作。Security version 規則需在 Device Contract 與後端驗證完成後才可進 production migration review。

Rollback 不刪除 calibration、crossing、adjustment、OTA audit 歷史。若新 read path 需回退，停止寫入新表並切回舊 projection；涉及 security baseline 撤銷時不可藉 DB rollback 允許降級韌體。
