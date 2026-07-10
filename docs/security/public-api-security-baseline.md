# Public API Security Baseline 草案

本文件是未來 Public API 安全需求，不代表目前已完成資安實作、測試或審核。

## XSS

- 前端輸出需 escape，不直接渲染未信任 HTML。
- 未來若支援商家自訂內容，需先使用經核准 sanitizer。

## SQL Injection

- 後端必須使用 parameterized query 或 ORM safe query。
- 不拼接 SQL、排序欄位、filter 值或 cursor。

## Rate Limit 與 Abuse Protection

- Public endpoint 需限制頻率。
- `live-status:batch` 正規化後最多 20 個 IDs。
- 限制 request size、query length、slug/cursor 長度與 pagination limit。
- 超限回傳 `429` 與 `Retry-After`。

## CORS 與 Headers

- 正式 CORS 僅允許確認後的公開 domain，不使用 wildcard credentials。
- 部署層需規劃 CSP、`X-Content-Type-Options`、`Referrer-Policy`、`Permissions-Policy`。
- CSP 需依正式資產來源審查，不先使用寬鬆 wildcard。

## Error Handling 與 Logging

- 不回傳 stack trace、DB error、internal path、cloud detail、raw exception 或 secret。
- Logging 不記錄 secret、完整 token、憑證或未遮罩敏感資料。
- 以 request ID 關聯安全 client error 與 server diagnostic。

## Privacy

- Public API 不暴露 `deviceId`、`tenantId`、`merchantId`、MAC、Wi-Fi RSSI、雷達 raw data、憑證或 internal diagnostic。
- 僅輸出 restaurant-level aggregate snapshot。
- `trafficCount` 不得描述為店內精確人數。

## 後續驗收

Phase 9/10 前補 threat model、依賴掃描、輸入驗證與 rate limit 測試、CORS/headers 驗證、log redaction 與 incident runbook。
