# Device Authentication 草案

> 不建立 CA、憑證、key、token 或真實驗證服務。

## 方案比較

| 方案 | 優點 | 風險／維運 | 成本方向 | 適用 |
| --- | --- | --- | --- | --- |
| A：每裝置 mTLS client certificate | 強裝置身分、標準化撤銷與企業治理 | CA、簽發、輪替、過期、CRL/OCSP 與 TLS gateway 維運較高 | 中至高固定營運成本 | 日本企業正式環境 |
| B：每裝置 HMAC key over HTTPS | ESP32 與後端 MVP 較簡單；request 可防竄改/重播 | key provisioning、clock skew、canonicalization、輪替需嚴格 | 低至中 | Phase 9 開發/MVP |
| C：provisioning credential 換短效 token | runtime secret 壽命短、易集中 revoke | token service、refresh failure、初始 credential 仍需保護 | 中 | HMAC 到 mTLS 的輔助遷移，不作唯一根信任 |

禁止 fleet-wide 共用 API key、MAC authentication、browser session authentication、前端網站長效 device secret。Device Authentication 與 Firebase Authentication 完全分離。

## 建議

- Phase 9 本地開發：每個模擬裝置使用獨立、短期、非 production HMAC 測試 credential；由本機 provisioning script/runtime 注入，放在 repo 外且不記錄。驗證 canonical method/path/timestamp/nonce/body hash。不可退化成全產品共用 key。
- MVP：每裝置 HMAC over HTTPS，server-side registry 保存不可回推或受 KMS/HSM 保護方向的 verifier/key material；具 credential version、有效期與 revoke 狀態。
- 日本企業版：每裝置 mTLS certificate，配合企業 CA/受管 PKI、短期 artifact URL 與可稽核輪替。HMAC 可在遷移期作第二驗證路徑，不應永久降低 mTLS 裝置安全基準。

## Request 驗證

簽章輸入至少包含 HTTP method、normalized path、request timestamp、request/message id、device public UID、body SHA-256、credential version。驗證後再由 registry 推導 internal device/tenant/assignment；不信任 payload 自報 ownership。

服務檢查允許時間窗、nonce/message replay、key/certificate status、endpoint scope、body size 與 rate limit。時鐘未同步裝置需使用受限 provisioning/recovery flow，不可直接停用 anti-replay。

## Provisioning、輪替、撤銷

1. Factory provisioning 使用每裝置唯一 credential；Dev/Staging/Production 使用不同 trust roots 與 registry。
2. 輪替採雙版本短暫重疊：先下發新 credential reference、確認啟用，再撤銷舊版本。
3. 遺失裝置立即標記 revoked、拒絕 ingestion/config/OTA、終止有效部署、保留 audit，必要時重新配置 replacement device。
4. Certificate/key 不進 Repo、DB 明文、log、Public API、LINE message、crash dump。文件與 fixture 僅用不可用 placeholder。

## 成本與控制

HMAC 實作與 gateway 成本較低，但 key custody 與輪替容易形成營運風險。mTLS 提高 CA、gateway、證書生命週期與支援成本，換取較強 fleet identity。正式選型需裝置量、憑證失效率、Japan 客戶稽核要求與 gateway 報價後 ADR 核准。

Kill switch：按 device、credential version、tenant cohort、endpoint 或 OTA campaign 停止流量；不得以關閉驗證作故障繞過。

## API Trust Boundaries

- Public API：只讀 restaurant-level public profile/live snapshot；禁止 device UID、boot/sequence、RSSI、calibration transform、firmware deployment、internal quality incident。
- Merchant API：登入及 tenant authorization 後讀店家資料、報表、通知設定與粗粒度 device health；不取得 credential 或 raw payload。
- Admin API：角色授權後管理 device registry、calibration、incident、OTA、audit；敏感操作需更強驗證與稽核方向。
- Device API：每裝置 authentication，用於 telemetry、heartbeat、configuration、command、OTA；不使用 browser session authentication，也不接受裝置自報 tenant authority。

LINE Bot 不位於 Device trust boundary，不直接接收或信任 device payload；只能消費後端驗證、聚合、授權後的 internal notification event。
