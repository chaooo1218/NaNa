# NaNa 專案完成度盤點與 Roadmap

更新日期：2026-07-11
盤點範圍：目前 Astro 公開網站、Mock Provider、公開型別與文件。
重要說明：目前網站為測試資料與前端架構驗證階段，並非正式即時服務、正式商用部署或已完成法務/資安審核的產品。

## 一、目前已完成功能

### 1. Public Website

- 已建立 Astro 靜態公開網站與 `PublicLayout`。
- 已提供首頁、404、店家詳情、菜單預覽、商家合作、聯絡、FAQ、資料更新、隱私權草案與使用條款草案。
- 公開文案採繁體中文，維持輔大 514 巷測試場域與低飽和商業工具風格。

### 2. 首頁

- 支援關鍵字、分類、營業中、人流、線上點餐、贊助與排序篩選。
- 篩選狀態同步 URL Search Params，重新整理可恢復。
- 列表有 loading、ready、empty、error、stale 與 refreshing 狀態。
- 目前使用集中式 Live Status 批次更新，不使用 per-card polling。

### 3. 店家詳情頁

- 已建立靜態 `/restaurants/[slug]` 路由與指定 slug Not Found 狀態。
- 顯示店名、營業狀態、人流、等待時間、距離、分類、測試資料狀態、簡介、營業時間、注意事項與地圖預留區。
- 地圖區塊明確標示建置中，不假裝已接入地圖服務。

### 4. 菜單預覽頁

- 已建立靜態 `/restaurants/[slug]/menu` 路由與菜單 Not Found 狀態。
- 至少三間店有分類、品項、價格、推薦/熱門、暫停供應與測試菜單提示。
- 不含購物車、付款、送單、訂單、POS 或庫存功能。

### 5. 商業信任頁

- 已建立商家合作、聯絡、常見問題、資料更新說明、隱私權草案與使用條款草案。
- 頁面清楚揭露測試資料、功能建置中與草案狀態。
- 已提供公司名稱、電話與服務地區；未加入未確認的地址、統編、email 或社群連結。

### 6. Footer / 404 / SEO

- Footer 已連結公開網站、FAQ、商家合作、聯絡、資料更新、隱私權與條款頁。
- 已建立一致風格的 404 頁與店家/菜單 Not Found 狀態。
- `PublicLayout` 已提供 title、description、相對 canonical path、Open Graph title/description/type。
- 已建立 `robots.txt`；正式 domain 未確認前不輸出可能錯誤的 absolute sitemap。

### 7. API Boundary

- `PublicRestaurantApi` 已定義列表、批次 Live Status、店家詳情與菜單預覽方法。
- API factory 可依公開 runtime config 選擇 Mock Provider；正式 Provider 尚未啟用時回傳安全的 `CONFIGURATION` 錯誤。
- UI 元件不直接 `fetch`、不直接匯入 mock fixture、不中繼 raw provider data。

### 8. Mock Data

- Mock fixture 已統一為輔大 514 巷周邊生活圈。
- 已包含店家基本資料、狀態、資料新鮮度、詳情、營業時間、注意事項與菜單預覽。
- 測試資料文案已在首頁、詳情、菜單與信任頁明確標示。

### 9. 高併發前端契約

- Live Status 請求先正規化 restaurant IDs，單次最多 20 個 IDs。
- 使用單一頁面 timer、random jitter、hidden 降頻、offline 停止、unmount abort。
- 連續失敗使用 bounded exponential backoff；保留最後成功資料並標記 stale。
- Live Status 更新不自動重新排序列表，也不重播整張卡片動畫。

### 10. GSAP Motion System

- 已建立集中 motion token：140/180/220ms、easing、stagger、位移、scale 與 reduced-motion 判斷。
- 首頁僅使用低調進場、列表更新與卡片微互動。
- 未使用 ScrollTrigger、3D、粒子、Lottie、Framer Motion 或無限動畫。

### 11. TypeScript / Build 狀態

- 使用 Astro strict TypeScript 設定。
- 已建立公開 restaurant、menu、API、query、live status 型別與 ViewModel mapper。
- 最近驗證：`pnpm check` 與 `pnpm build` 可通過。

## 二、目前未完成功能

### 1. Public API Backend

尚未有可部署的 Public API、版本化 endpoint、輸入驗證、錯誤轉譯、ETag、Cache-Control、Rate Limit 或 Retry-After。

### 2. PostgreSQL / Database

尚未定義正式資料表、migration、索引、資料保留策略、tenant/merchant/restaurant 關聯或備份策略。

### 3. Redis / Cache

尚未有 Live Snapshot cache、cache TTL、失效策略、cache stampede 防護或 cache 監控。

### 4. Device Ingestion

尚未有裝置註冊、驗證、資料接收、去重、順序控制、重放保護或 restaurant-level aggregation。

### 5. ESP32-S3 Firmware

尚未有韌體、OTA、網路重連、裝置設定、憑證佈署或健康回報實作。

### 6. LD2450 Parsing

尚未有 UART protocol parser、狀態機、校正、異常處理或感測資料品質檢查。

### 7. Crowd Algorithm

尚未有以裝置事件產生 `trafficCount`、`waitingCount`、`crowdLevel`、`occupancyEstimate` 與 `freshness` 的後端演算法與驗證資料集。

### 8. Merchant Dashboard

尚未有商家登入、資料權限、店家設定、即時狀態、報表、菜單管理或通知功能。

### 9. Admin Dashboard

尚未有租戶、商家、店家、裝置、贊助、支援與稽核管理功能。

### 10. LINE Bot

尚未有 LINE channel 設定、Webhook、使用者綁定、權限、訊息模板或濫用防護。

### 11. Online Ordering

尚未有正式菜單、價格同步、庫存、購物車、付款、訂單、取餐、退款或 POS 整合。

### 12. Mapbox

尚未有 Map Provider Adapter、地圖 SDK、地理資料、pin、地圖權限或 Token 管理；目前僅有建置中預留區。

### 13. Authentication / Authorization

尚未有身份驗證、角色模型、session、token、password policy、merchant isolation 或 admin authorization。

### 14. Security

尚未完成 CSP、CSRF、XSS 防護驗證、SQL Injection 防護、依賴掃描、秘密管理、rate limit、audit log 或安全測試。

### 15. Deployment / Observability

尚未有 CI/CD、static hosting、backend runtime、監控、告警、追蹤、日誌、備份、復原或 load test。

### 16. Legal / Contract / Pricing

隱私權與條款仍為草案；尚未完成法務審核、商家合約、資料處理約定、服務等級與定價。

## 三、完成度估算

| 模組名稱 | 目前狀態 | 完成度 | 阻擋點 | 下一步 |
| --- | --- | ---: | --- | --- |
| Public Website | 靜態公開網站已成形 | 85% | 正式資料與 domain 未定 | 接入經核准 Public API |
| 首頁探索 | 搜尋、篩選、排序、URL 狀態完成 | 80% | 真實資料來源未完成 | 以 API contract 對接 read model |
| 店家詳情/菜單 | Mock 詳情與預覽完成 | 75% | 正式店家/菜單管理未完成 | 定義公開 read model 與 CMS/後台邊界 |
| 商業信任頁 | 基礎內容與草案完成 | 80% | 法務、定價、商業流程未確認 | 法務審核與商家合作流程 |
| SEO / robots | Metadata 與 robots 完成 | 65% | 正式 domain 未確認 | 設定 site 並產生 sitemap |
| Public API Boundary | Typed interface 與 Mock Provider 完成 | 35% | 無 backend / contract validation | OpenAPI、read model、adapter implementation |
| 高併發前端契約 | 批次 polling、防抖與 stale 處理完成 | 55% | 無 server capacity / cache / load test | API rate limit、cache、load test |
| Mock Data | 生活圈 fixture 與 mapper 完成 | 80% | 非正式、無治理流程 | 正式資料審核與管理流程 |
| GSAP Motion System | 微互動 token 與首頁使用完成 | 75% | 缺少跨裝置視覺驗收 | 補充可視化與 accessibility QA |
| PostgreSQL / Database | 未開始 | 0% | Schema、ownership、migration 未定 | Phase 7 schema/migration 草案 |
| Redis / Cache | 未開始 | 0% | Snapshot read model 未定 | 定義 cache key、TTL、失效策略 |
| Device Ingestion | 未開始 | 0% | Device contract、identity、ingestion runtime 未定 | Phase 8 contract/protobuf |
| ESP32-S3 / LD2450 | 未開始 | 0% | Firmware、parser、校正未定 | 裝置 PoC 與測試資料集 |
| Crowd Algorithm | 未開始 | 0% | 原始事件與評估方法未定 | 建立餐廳級聚合與品質指標 |
| Merchant Dashboard | 未開始 | 0% | Auth、資料模型與權限未定 | Phase 11 MVP scope |
| Admin Dashboard | 未開始 | 0% | Tenant model、roles、audit 未定 | Phase 12 MVP scope |
| LINE Bot | 未開始 | 0% | Channel、權限、訊息需求未定 | Phase 13 MVP contract |
| Online Ordering | 僅菜單預覽 | 10% | 商業流程、付款、POS、合約未定 | 另立 ordering domain 與風險審查 |
| Mapbox | 預留區完成 | 5% | Provider adapter、地理資料、成本/Token 未定 | Phase 14 架構與成本審查 |
| Authentication / Security | 未開始 | 5% | identity、threat model、controls 未定 | Phase 10 security baseline |
| Deployment / Observability | 未開始 | 0% | runtime、CI/CD、監控、成本模型未定 | Phase 15 load/deploy/monitoring |
| Legal / Contract / Pricing | 草案文字完成 | 15% | 法務、定價、商業責任未定 | 專業審核與商家合約 |

## 四、風險清單

| 風險 | 影響 | 現況與控制 | 建議處理 Phase |
| --- | --- | --- | --- |
| 測試資料被誤認為正式資料 | 使用者信任與商譽風險 | 已在 UI、資料頁與草案文案標示測試階段 | Phase 6 前持續檢查公開文案 |
| 假地圖信任問題 | 使用者誤以為可精準導航 | 已使用建置中預留區，不顯示假精準 pin | Phase 14 才接真實地圖 |
| 未完成後端卻過早宣傳 | 商業承諾與支援風險 | 信任頁揭露未正式上線 | 正式對外前完成 API 與營運審查 |
| Firebase 成本失控 | 高頻資料成本與架構鎖定 | 現階段未接 Firebase；禁止將 telemetry/public live data 放入 Firestore/RTDB | Phase 6–10 架構審查 |
| Public API 高併發 | 快取穿透、資料庫壓力、服務降級 | 前端已有 batch/jitter/backoff；後端尚未實作 | Phase 6、9、15 |
| ESP32 裝置安全 | 偽造上傳、憑證外洩、裝置接管 | 尚未有裝置實作 | Phase 8、10 |
| XSS / SQL Injection | 資料與帳號安全風險 | 未有 backend、輸入驗證或安全測試 | Phase 9、10 |
| 多租戶資料隔離 | 跨商家資料外洩 | Tenant/merchant model 尚未實作 | Phase 7、10–12 |
| LINE Bot 權限 | 未授權訊息與資料洩漏 | 尚未接 LINE Bot | Phase 13 |
| 店家資料正確性 | 錯誤營業時間、菜單、店家資訊 | 目前為 mock；無審核流程 | Phase 6、11 |
| 法務與隱私權草案 | 合規與責任界線不清 | 已標示草案，未經正式審核 | 正式商用前完成專業審核 |

## 五、建議 Phase 6～Phase 15

| Phase | 主題 | 主要交付物 | 前置條件 |
| --- | --- | --- | --- |
| Phase 6 | Public API Contract / OpenAPI / Backend Read Model | Public API v1 OpenAPI、錯誤模型、read model、快取與 rate limit 設計 | 公開欄位與資料新鮮度定義確認 |
| Phase 7 | Database Schema / PostgreSQL / Migration 草案 | tenant/merchant/restaurant/location schema、索引、migration 與 retention ADR | Phase 6 contract 定稿 |
| Phase 8 | Device Ingestion Contract / Protobuf / ESP32 上傳格式 | Protobuf、裝置身份、重送/去重、餐廳級聚合規則 | Phase 7 ownership schema |
| Phase 9 | Backend MVP Skeleton | Public API read endpoints、Mock/production adapter、健康檢查與安全錯誤模型 | Phase 6–8 approved contract |
| Phase 10 | Security Baseline / Auth / Rate Limit / Input Validation | threat model、Auth/RBAC 設計、validation、rate limit、audit baseline | Phase 7–9 architecture |
| Phase 11 | Merchant Dashboard MVP | 商家登入後店家資料、狀態、基本管理與審核流程 | Phase 7、9、10 |
| Phase 12 | Admin Dashboard MVP | tenant/merchant/restaurant/device 管理與稽核界面 | Phase 7、9、10 |
| Phase 13 | LINE Bot MVP | 授權流程、通知 use cases、Webhook 安全與權限邊界 | Phase 10、11 |
| Phase 14 | Mapbox Integration | Map Provider Adapter、地圖 UX、Token/成本/權限審查 | 地理資料品質與成本批准 |
| Phase 15 | Load Test / Deployment / Monitoring | load test、CI/CD、hosting、monitoring、alerts、runbook、rollback | Phase 6–14 核心功能穩定 |

## 六、執行原則

1. Phase 6 前，不宣稱正式即時資料、正式訂購、正式地圖或正式商用服務。
2. 先完成 Public API contract、資料模型與安全邊界，再建立 backend、dashboard 或 device runtime。
3. 任何雲端、資料庫、Mapbox、LINE、付款、認證或部署工作，先進行架構/成本審查並取得明確批准。
4. 正式 domain 確認後，再建立含 absolute URL 的 sitemap 與正式 SEO 設定。
