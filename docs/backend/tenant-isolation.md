# Tenant Isolation 草案

## 關係與 ownership

1. tenant 是最高商業隔離單位。
2. merchant 必須屬於一個 tenant。
3. merchant user 透過 merchant/tenant 綁定，未來只能操作所屬 merchant。
4. restaurant 屬於 merchant 與 tenant；寫入時需驗證兩者 tenant 一致。
5. device 先屬於 tenant，再以 assignment 連結 restaurant；歷史 assignment 不覆寫。

## API 邊界

- Public API 使用 restaurant slug/public id，不暴露 `tenantId`、`merchantId`、device id 或 assignment。
- 未來 Merchant API 每個 query 都必須帶入已授權 tenant/merchant scope，不能由 client 自選 merchant id。
- 未來 Admin API 需要角色權限與稽核；admin access 不等於可略過 audit。

## RLS 與 Application Authorization

- PostgreSQL Row-Level Security 可作為多層防護候選，需評估 connection pooling、service role、migration 操作與測試成本。
- 不論是否採 RLS，application-level authorization 仍必須驗證 actor、tenant、merchant、restaurant relation。
- 未決定 RLS 前，不可假設只靠前端 route 或 request parameter 就能隔離資料。

## Audit Direction

- merchant/admin 變更應寫入對應 audit log：actor reference、scope、action、target、timestamp、已遮罩 metadata。
- audit metadata 不記錄 password、token、secret、憑證或 raw telemetry。

## 非目標

本階段不實作 Auth、Firebase Auth、RBAC 程式碼、RLS policy 或 API middleware。
## Phase 7.1 Device 與 OTA 隔離

- `doors` 必須繼承 restaurant 的 tenant；`door_sensor_assignments` 的 door/device 必須同 tenant，以 composite FK 防止跨租戶配置。
- Calibration、count windows、crossing events、quality incidents 皆帶內部 tenant scope，寫入時由已驗證 assignment 推導，不接受裝置任意指定 tenant/restaurant。
- Occupancy snapshot 以 restaurant 為權威 scope；adjustment 必須同 tenant，operator internal id 與 audit reference 只供授權後台稽核。
- Firmware release/artifact 可作平台級資產；OTA deployment 經 campaign cohort 與 device tenant scope 授權。Merchant 不得建立平台 release 或跨 tenant campaign。
- Signing private key 不屬任何 tenant table，也不得存 DB。Artifact 只留 storage reference、hash 與 signature metadata。
- Public API 僅以 restaurant public id/slug 讀 restaurant-level projection；不暴露 tenant、merchant、device、door assignment、calibration、incident、adjustment 或 OTA internal id。

未來 Device Ingestion 必須先用裝置憑證解析 server-side device identity，再核對有效 door assignment 與 configuration/calibration version。Payload 中自報的 restaurant/tenant 不可作授權依據。Merchant API 僅能查看自身餐廳的摘要與授權診斷；Admin/OTA 操作需更高角色、雙人核准方向及 append-only audit。RLS 是否採用仍待 connection pool 與 service role 威脅模型驗證，本 Phase 不實作 Auth/RBAC/RLS。
