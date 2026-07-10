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
