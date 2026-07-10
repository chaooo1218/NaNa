# Public API Contract 草案

## 目的與狀態

本文件定義 NaNa 未來公開網站使用的 Public API 邊界，對應 `contracts/openapi/public-api.yaml`。本文件不是正式後端實作、不是已部署 endpoint，也不代表目前公開資料已正式上線。

## API 邊界

| API 類型 | 使用者 | 可處理資料 | 禁止混入 |
| --- | --- | --- | --- |
| Public API | 一般公開網站 | 餐廳公開資料、餐廳級 Live Snapshot、菜單預覽 | device、tenant、merchant、admin、raw telemetry |
| Merchant API | 已授權店家人員 | 自有店家管理與報表資料 | 其他商家資料、裝置密鑰 |
| Admin API | 已授權管理人員 | 管理與支援資料 | 公開 endpoint 直接存取 |
| Device API | 已註冊裝置 | 裝置驗證與 ingestion payload | 公開網站讀取 |

Public API 可回傳店名、分類、標籤、公開店家資料、距離摘要、營業狀態、人流狀態、等待時間、資料新鮮度、菜單預覽與贊助標示。

Public API 禁止回傳 `deviceId`、`tenantId`、`merchantId`、MAC、Wi-Fi RSSI、雷達 raw data、設備憑證、雲端內部資訊、DB error、stack trace、完整 exception 或 secret。

## Restaurant Basic Data 與 Live Status 分離

- `GET /public/restaurants`、`GET /public/restaurants/{slug}` 與菜單 endpoint 屬於較低變動的基本公開資料。
- `POST /public/live-status:batch` 僅回傳目前可見店家的 restaurant-level Live Snapshot。
- `trafficCount` 是流量/通行相關統計，不等於店內精確人數；只有已驗證的 `occupancyEstimate` 才可表示 occupancy，且可為 `null`。
- Device raw telemetry 不進入 Public API read model，也不由前端聚合雙門資料。

## Live Status Batch API

Request body：

```json
{ "restaurantIds": ["green-tea", "ramen-ichi"] }
```

Server 正規化規則：

1. trim 每個 ID。
2. 移除空字串與重複值。
3. 以固定且可預測的排序產生 normalized IDs。
4. 正規化後最多 20 個；超過時回傳 `VALIDATION`。
5. 同一頁面以單一 batch request 更新可見店家；禁止每張卡片獨立請求。

Response 只包含 `restaurantId`、`trafficCount`、`trafficWindowSeconds`、`waitingCount`、`estimatedWaitMinutes`、`waitTimeConfidence`、`crowdLevel`、`occupancyEstimate`、`occupancyConfidence`、`freshness`、`observedAt`、`receivedAt`。

## Pagination / Cursor

- 列表預設 `limit=20`，最大 `limit=50`。
- 不回傳所有店家。
- cursor 為 opaque value；客戶端不得解析其內容。
- response 回傳 `cursor`、`nextCursor`、`limit`、`hasMore`。

## 錯誤模型

所有失敗 response 使用 `ApiError`：

| 欄位 | 說明 |
| --- | --- |
| `code` | `NETWORK`、`TIMEOUT`、`VALIDATION`、`NOT_FOUND`、`RATE_LIMITED`、`SERVER`、`CONFIGURATION`、`UNKNOWN` |
| `message` | 使用者安全的簡短訊息 |
| `requestId` | 用於支援與追蹤的 request reference |
| `retryAfterSeconds` | 限流或可重試狀況的可選等待秒數 |
| `details` | 僅限安全欄位、reason、limit 等資料 |

不得回傳 stack trace、DB error、internal path、cloud provider detail、裝置識別資訊或 raw exception。

## Rate Limit、Cache 與 Request ID

- 正式 Public API 應依 endpoint、IP、風險與快取狀態設定 rate limit；超限使用 `429` 與 `Retry-After`。
- Restaurant basic data 使用較長的 `Cache-Control`，並提供 ETag 或 version。
- Live Status 使用短快取與 `stale-while-revalidate`，避免大量使用者同時打穿後端。
- Client 可傳 `X-Request-Id`；後端缺少時產生 request ID 並在 response meta 回傳。
- CORS 僅允許確認後的正式公開 domain；不使用 wildcard credentials。

## 雙門與 Raw Telemetry

雙門店家的裝置事件由後端依 restaurant 聚合。Public API 只讀取 restaurant-level snapshot，公開前端不得合併裝置事件、門店拓樸或 raw telemetry。

## 實作邊界

本文件與 OpenAPI 只定義未來 contract。Phase 6 不建立 server runtime、資料庫、cache、雲端資源或真實 endpoint。
