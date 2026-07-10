# Public Read Path Contract

本 Phase 建立未來高併發讀取路徑的前端與 API Contract 基礎；正式承載能力須由後端部署、快取策略與壓測驗證。

## 目標情境

- 目標情境是 10,000 名學生在午餐／晚餐尖峰同時進站。
- 若 10,000 人每 5 秒刷新一次，理論上約為 2,000 次 Live Status Request / 秒。
- 本文件是前端與 Public API contract，不建立 CDN、後端、資料庫、快取、Queue、Worker 或任何雲端資源。

## 靜態資源路徑

- 首頁 HTML、JS、CSS、圖片必須由 CDN / Static Hosting 承擔。
- 靜態資源不可每次請求都打後端。
- Astro public site 應維持可靜態輸出，Public API 只負責資料讀取。

## 資料分離

- 餐廳基本資料與即時人流資料必須分離。
- 餐廳基本資料可使用較長快取。
- 即時人流資料只能讀取 Restaurant Level Live Snapshot。
- Public API 不可查詢 Raw Telemetry。
- Public API 不可暴露 deviceId、tenantId、merchantId、MAC、Wi-Fi RSSI、雷達原始資料、設備憑證、內部錯誤或雲端資訊。
- 雙門資料由後端聚合，前端不可聚合。

## Live Status Batch API

- Live Status 必須是 Batch API。
- 每個使用者只請求目前可見店家。
- 每次最多 20 間店家 ID。
- 超過 ID 上限必須回傳 validation error，不可默默回傳全部資料。
- 不可每張 Card 建立獨立 Request。
- 回傳內容只包含精簡人流狀態：`trafficCount`、`waitingCount`、`crowdLevel`、`occupancyEstimate`、`occupancyConfidence`、`freshness`、`observedAt`、`receivedAt`。
- `trafficCount`、`crossingCount`、雷達 target 數量不可視為可靠店內人數。
- `occupancyEstimate` 與 `occupancyConfidence` 必須允許 `null`。

## Phase 3 輪詢約束

- 未來 Phase 3 實作輪詢時必須加入 random jitter，避免所有學生在整點同時打 API。
- 頁面 hidden 時必須停止或降頻。
- offline 時必須停止。
- unmount 時必須 abort。
- 連續失敗必須使用 bounded exponential backoff。
- 失敗時保留最後成功資料並標記 stale。
- 不可建立每張 Card 的獨立 polling timer。

## Public API 必備能力

- ETag 或版本號。
- Cache-Control。
- Rate Limit。
- Retry-After。
- Request ID。
- Cursor Pagination。
- 最大 Query / ID 數限制。
- 安全錯誤模型，不回傳內部錯誤或 stack trace。

## 上線前壓測

正式上線前必須做 Load Test：

- 10,000 Virtual Users。
- 午餐尖峰情境。
- 70% 瀏覽列表。
- 25% 請求 Live Status。
- 5% 搜尋或切換篩選。
- 需記錄 p95、p99、錯誤率、Cache Hit、資料庫連線數、CPU、Memory、API Rate Limit Hit 與 Egress。

## 非目標

- 本 Phase 不實作真實 polling。
- 本 Phase 不呼叫遠端 API。
- 本 Phase 不建立 Firebase、DigitalOcean、AWS、Mapbox、資料庫、快取、Queue 或 Worker。
- 本 Phase 不宣稱目前系統已能承受 10,000 人同時使用。
