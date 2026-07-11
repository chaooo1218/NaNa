# Device Contract Validation Record

## Validation Context

- Date: 2026-07-12
- Git branch: `feat/astro-migration`
- Validation baseline commit: `010bc3e` (Phase 8 baseline; not the Phase 8.1 checkpoint)
- Buf: preinstalled offline Buf CLI `1.71.0`
- OpenAPI: preinstalled offline Redocly CLI `2.38.0`
- Scope: Protobuf, Public OpenAPI, Device OpenAPI, ProtoJSON/HTTP mapping, HMAC and protocol documents only

本紀錄不包含本機帳號路徑、secret、key、token、certificate 或 private key。

## Results

| Validation | Result |
| --- | --- |
| `buf build contracts/proto` | Passed |
| `buf lint contracts/proto` | Passed |
| Public OpenAPI Redocly `recommended` | Passed, 0 errors, 0 warnings |
| Device OpenAPI Redocly `recommended` | Passed, 0 errors, 0 warnings |
| Public OpenAPI Redocly `spec` | Passed, 0 errors, 0 warnings |
| Device OpenAPI Redocly `spec` | Passed, 0 errors, 0 warnings |

Buf 使用 `STANDARD`。為保留已 checkpoint 的 `contracts/proto/v1` 路徑，僅排除 `PACKAGE_DIRECTORY_MATCH`；package 仍統一為 `nana.device.v1`。未停用其他 lint 規則，未加入 BSR、remote module 或 code generation。Well-known `Timestamp` 使用工具內建 descriptor。

## Proto Fixes

- 將三個 common imports 從 repo-relative path 改為 module-relative `v1/device_common.proto`。
- `entry_delta`、`exit_delta` 加入 proto3 optional presence，field numbers `8`、`9` 不變；0 明確表示有效窗口無 crossing，absent 可被驗證層拒絕。
- Enum 第一值均為具名 `*_UNSPECIFIED = 0`，enum values 保持型別前綴。
- 未重新編號、刪除或重用任何 field；未使用 19000–19999。
- 未新增 permanent person ID、raw trajectory、MAC identity 或 DB internal device ID。

Compatibility impact：import 修正不影響 wire。Scalar optional 使用相同 tag/wire type，binary wire 相容，但 generated API 會新增 presence accessor。未執行 source-level generated-code compatibility test，因本 Phase 不產生程式碼。

## OpenAPI Fixes

- 補相對 server `/`，只表示 deployment origin placeholder，不代表 endpoint 已部署。
- Public API 明確設 `security: []`；Device API 保持 per-device HMAC 或 mTLS，未使用 browser session。
- 補 draft proprietary license identifier，清除 Redocly strict warning。
- 修正三個 flow-style descriptions 的 YAML comma parsing error。
- Device enums 改用完整 ProtoJSON enum identifiers。
- Device optional fields以 omission 表達 absence，不使用 `null`；Public restaurant snapshot 繼續允許 nullable occupancy/confidence。
- 明確區分 omitted、explicit null、zero、unknown、unavailable 與 not applicable；Device optional 欄位只在 OpenAPI 明確允許時才可傳 `null`。
- `X-NaNa-Message-Id` 固定為 HTTP request identity；Telemetry 必須等於 `batchId`，但不取代每個 Count Window 的 `messageId` 或 `bootId + sequenceNumber`。
- `X-NaNa-Request-Id` 僅是 optional client correlation hint；response `requestId` 由 Gateway／Backend 產生並作為 server tracing 權威值。
- 所有 Proto `uint64` 在 HTTP JSON 使用 decimal string。
- UploadBatch 設 draft absolute ceiling 120 windows；runtime configuration 必須相同或更低，payload bytes 另以 413/設定限制。

Compatibility impact：Phase 8 draft 的短 enum JSON names 改為完整 Proto identifiers；HMAC headers 改為 `X-NaNa-*`；Device optional fields 從允許 `null` 收斂為省略。尚無 deployed runtime，但未來 consumer 必須依本版 contract 實作。

## HMAC Canonical Request

- 固定 UTF-8、LF separator、uppercase method、RFC 3986 path/query normalization。
- 簽入 device UID、key ID、UTC timestamp、nonce、message/batch ID 與 exact raw-body SHA-256。
- Content SHA-256 與 HMAC-SHA256 signature 均使用 lowercase hex。
- 要求 bounded timestamp window、nonce/message replay protection、constant-time comparison、current/next key overlap 與 immediate revoke。
- Clock-unsynced flow 必須使用獨立受限 bootstrap/challenge/recovery；一般 ingestion 不可省略 timestamp。
- HMAC 後端驗證需要受保護的對稱驗證材料，不以單向 verifier 冒充；裝置端與後端 custody、環境隔離、rotation、revocation 與 mTLS 遷移方向已分開定義。

## Batch ACK

- Accepted、accepted out-of-order、duplicate、rejected identities 必須 pairwise disjoint。
- Ordinary identical duplicate 使用 HTTP 200 ACK，不重建 crossing；相同 identity 不同內容才是 409 conflict。
- Item-level validation 使用 HTTP 200 partial ACK；batch-level authentication/JSON/size failure 使用 4xx/413。
- `highestContiguousSequence` 是單一 device+boot 的連續持久化水位，不是收到過的最大值。
- 413 可切小 batch但 window identity 不變；429 遵守 Retry-After；5xx bounded retry；non-retryable 4xx 不循環重試。

## Remaining Warnings And Tests

- Remaining Buf/OpenAPI warnings: none.
- Breaking-change test: not run。尚未建立前一版 image、tag、registry module 或 approved baseline；不可用目前 worktree 自比冒充 breaking validation。
- Runtime request validator: not implemented.
- Backend authentication/security review: not completed.
- Real ESP32 interoperability and ProtoJSON conformance test: not completed.
- OTA artifact/signature/Secure Boot/eFuse test: not performed.

本驗證只證明目前 IDL 可由 Buf build/lint，兩份 OpenAPI 可通過 Redocly `recommended` 與 `spec`。不代表 Backend、Firmware、Device Authentication、OTA、Security Review 或 Production 已完成。

`010bc3e` 只是本次驗證所依據的 Phase 8 baseline。Phase 8.1 checkpoint 尚未由使用者建立；所有 closeout 驗證通過後只能標記 `ready_for_checkpoint`，不可標記 committed 或 completed。
