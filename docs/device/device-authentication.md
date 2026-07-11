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
- MVP：每裝置 HMAC over HTTPS。HMAC 驗證需要可用的對稱驗證材料，不能以單向 password verifier 取代；後端使用 cloud-neutral 的加密儲存、Secret Manager、HSM 或 KMS 類型能力保護，並具 key version、有效期與 revoke 狀態。
- 日本企業版：每裝置 mTLS certificate，配合企業 CA/受管 PKI、短期 artifact URL 與可稽核輪替。HMAC 可在遷移期作第二驗證路徑，不應永久降低 mTLS 裝置安全基準。

## Request 驗證

### HMAC Canonical Request v1

建議 headers：`X-NaNa-Device-Id`、`X-NaNa-Key-Id`、`X-NaNa-Timestamp`、`X-NaNa-Nonce`、`X-NaNa-Message-Id`、`X-NaNa-Content-SHA256`、`X-NaNa-Signature`。`X-NaNa-Message-Id` 是本次 HTTP request 的裝置產生穩定識別，納入 HMAC、replay protection 與 request tracing；`X-NaNa-Request-Id` 若提供只作 client correlation hint，response `requestId` 由 API Gateway／Backend 產生，不作裝置身分或業務訊息識別。

Canonical request 固定為下列 UTF-8 bytes，各欄以單一 LF (`0x0A`) 分隔，不使用 CRLF，最後一行後不加 LF：

```text
NANA-HMAC-V1
{UPPERCASE_METHOD}
{NORMALIZED_PATH}
{NORMALIZED_QUERY}
{DEVICE_PUBLIC_UID}
{KEY_ID}
{RFC3339_UTC_TIMESTAMP}
{NONCE}
{MESSAGE_OR_BATCH_ID}
{LOWERCASE_BODY_SHA256}
```

- Method 使用 ASCII uppercase。
- Path 必須以 `/` 開頭，依 RFC 3986 移除 dot segments；UTF-8 bytes 僅保留 unreserved characters，其餘使用 uppercase percent-encoding。不得將 `%2F` 當路徑分隔符，也不任意增刪 trailing slash。
- Query 先解析完整 key/value pairs，以 RFC 3986 percent-encoding（空白為 `%20`，不用 `+`），按 encoded key、再按 encoded value 排序；保留重複 pairs，以 `&` 連接。無 query 時該行為空字串。
- Timestamp 使用 UTC `YYYY-MM-DDTHH:mm:ssZ`。接受窗口必須 bounded，實際秒數留待 threat model/營運設定，不可無上限。
- Nonce 使用每 request 唯一的高熵值；同 device/key 在接受窗口內不可重用。
- Telemetry batch 的 `X-NaNa-Message-Id` 必須等於 body `batchId`；相同 request bytes 重試時兩者不變。若切小或重組 batch，產生新的 `batchId` 與相同值的 Header，但每個 Count Window 的 `envelope.messageId`、`bootId`、`sequenceNumber` 不變。其他 endpoint 使用該次 request 的 message identity；Mismatch 直接安全拒絕。
- Content hash 是收到的 exact raw body bytes 之 SHA-256 lowercase hex；無 body 的 GET 使用空 byte sequence hash。Proxy 不得在驗證前重新序列化、解壓後改寫或正規化 JSON body。
- Signature 使用 `HMAC-SHA256(per-device-key, canonical-request-bytes)`，輸出 lowercase hex。伺服器先驗 body hash，再以 constant-time comparison 驗 signature。

驗證後再由 registry 推導 internal device/tenant/assignment；不信任 payload 自報 ownership。Ordinary signature mismatch 僅回一般 `AUTHENTICATION` safe error，不透露 hash、canonical line、key 狀態或比對位置。

服務檢查允許時間窗、nonce/message replay、key/certificate status、endpoint scope、body size 與 rate limit。時鐘未同步裝置需使用受限 provisioning/recovery flow，不可直接停用 anti-replay。

Clock-unsynced 裝置不得省略 timestamp 後呼叫一般 ingestion。方向為 factory provisioning credential、bounded bootstrap endpoint、server challenge 與一次性 nonce，或已註冊裝置的受限 recovery flow；Phase 8.1 不建立此服務。

## Key Custody

### 裝置端

- 每台裝置使用獨立 HMAC Secret，不使用 fleet-wide shared secret，也不從 MAC Address 推導。
- Secret 由 factory provisioning 或受限 replacement flow 注入受保護持久儲存；不寫入 Git、Firmware source、log、crash、API response 或 diagnostic。
- Secure Boot、Flash Encryption 與 eFuse 未啟用前，不宣稱已達 production key protection。本 Phase 不建立 Secret、不燒錄 eFuse。

### 後端端

- Application DB 不保存可直接由一般應用查詢讀取的明文 Secret。
- 驗證材料由 cloud-neutral 的加密儲存、Secret Manager、HSM 或 KMS 類型能力保護；只有最小權限驗證服務可在需要時使用。
- Secret 不進 query log、audit payload、error log、cache key 或 observability attribute；signature 使用 constant-time comparison。

## Provisioning、輪替、撤銷與環境隔離

1. Factory provisioning 使用每裝置唯一 credential；Development、Staging、Production 使用不同 key hierarchy、trust roots 與 registry，禁止跨環境共用或把測試 key 帶入 Production。
2. 輪替採 current/next key 有限重疊，以 `X-NaNa-Key-Id` 識別版本；先確認 next 啟用，重疊期結束後撤銷 current。每台裝置 key 獨立。
3. 遺失或 revoked 裝置立即拒絕 ingestion/config/OTA、終止有效部署、保留 audit，必要時重新配置 replacement device。
4. Certificate/key 不進 Repo、DB 明文、log、Public API、LINE message、crash dump。文件與 fixture 僅用不可用 placeholder。

## 成本與控制

HMAC 實作與 gateway 成本較低，但 key custody 與輪替容易形成營運風險。mTLS 提高 CA、gateway、證書生命週期與支援成本，換取較強 fleet identity。正式選型需裝置量、憑證失效率、Japan 客戶稽核要求與 gateway 報價後 ADR 核准。

日本企業正式版方向是每裝置獨立 client certificate、mTLS、certificate inventory、rotation、revocation 與 audit。HMAC MVP 必須保留可稽核遷移路徑；目前尚未建立 PKI、CA、正式燒錄、Secure Boot、Flash Encryption 或 eFuse security baseline。

Kill switch：按 device、credential version、tenant cohort、endpoint 或 OTA campaign 停止流量；不得以關閉驗證作故障繞過。

## API Trust Boundaries

- Public API：只讀 restaurant-level public profile/live snapshot；禁止 device UID、boot/sequence、RSSI、calibration transform、firmware deployment、internal quality incident。
- Merchant API：登入及 tenant authorization 後讀店家資料、報表、通知設定與粗粒度 device health；不取得 credential 或 raw payload。
- Admin API：角色授權後管理 device registry、calibration、incident、OTA、audit；敏感操作需更強驗證與稽核方向。
- Device API：每裝置 authentication，用於 telemetry、heartbeat、configuration、command、OTA；不使用 browser session authentication，也不接受裝置自報 tenant authority。

LINE Bot 不位於 Device trust boundary，不直接接收或信任 device payload；只能消費後端驗證、聚合、授權後的 internal notification event。
