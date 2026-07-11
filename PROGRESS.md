# NaNa Project Progress

目前 Phase：8.1 Contract Validation
狀態：ready_for_checkpoint（所有 Phase 8.1 closeout 驗證已通過，等待使用者人工 checkpoint）
日期：2026-07-12
分支：`feat/astro-migration`

## Phase 0 — Baseline
做了什麼：記錄 Next.js v0、active/legacy 範圍、資產與遷移風險。
關鍵決策與理由：保留 legacy source，避免遷移時破壞使用者既有成果。
對外介面：無；只建立基線文件。
改動的主要檔案：`docs/migration/phase-0-baseline.md`。
未解問題：Legacy Next 依賴與檔案仍待獨立清理。

## Phase 1 — Astro Migration
做了什麼：將 active public build 切換為 Astro static 與 React Islands。
關鍵決策與理由：公開網站優先靜態輸出，降低 runtime 與部署複雜度。
對外介面：Astro routes 與 `PublicLayout`。
改動的主要檔案：`astro.config.mjs`、`src/pages/`、`src/layouts/`。
未解問題：正式 hosting、domain、sitemap 尚未完成。

## Phase 2 — Public Data Boundary
做了什麼：建立 Public API interface、Mock Provider、types、mapper 與 runtime config。
關鍵決策與理由：UI 不知道資料來源，避免直接 fetch 或 import fixture。
對外介面：`PublicRestaurantApi`。
改動的主要檔案：`src/lib/api/`、`src/lib/mappers/`、`src/types/`。
未解問題：Production Provider 尚未實作。

## Phase 3A — Restaurant Explorer
做了什麼：完成搜尋、篩選、排序、URL state 與集中式 Live Status refresh。
關鍵決策與理由：單一 timer、batch、jitter、backoff 降低高併發壓力。
對外介面：URL Search Params、`getLiveStatuses()`。
改動的主要檔案：`useRestaurantExplorerState.ts`、`query-params.ts`、Explorer Island。
未解問題：缺 unit tests；ID 超限行為仍需與 contract 統一。

## Phase 3B — Public UI Foundation
做了什麼：整理 Hero、filters、cards、Footer、map placeholder 與 motion system。
關鍵決策與理由：採低調商業工具感，GSAP 僅作 micro interaction。
對外介面：公開首頁 UI 與 `motion.ts` tokens。
改動的主要檔案：首頁元件、RestaurantCard、Footer、motion system。
未解問題：尚無自動 visual regression 與 accessibility suite。

## Phase 3C — Public UI Acceptance
做了什麼：驗收手機/桌面、公開邊界、CTA、404、Footer 與 GSAP 使用。
關鍵決策與理由：只做必要小修，不重構 Phase 3A data flow。
對外介面：無新增介面。
改動的主要檔案：Phase 3 公開元件與樣式。
未解問題：驗收缺少可重跑的 Playwright artifact。

## Phase 4 — Restaurant Detail/Menu
做了什麼：建立店家詳情、菜單預覽與安全 Not Found routes。
關鍵決策與理由：Astro static paths 經 API boundary 取得 ViewModel。
對外介面：`getRestaurantBySlug()`、`getRestaurantMenu()`。
改動的主要檔案：`src/pages/restaurants/`、detail/menu mapper 與 types。
未解問題：Build catch 可能隱藏全部店家頁生成失敗，需 assertion。

## Phase 5 — Trust/SEO
做了什麼：建立商業信任頁、Footer links、metadata 與 robots。
關鍵決策與理由：明示測試資料與法律草案，不冒充正式服務。
對外介面：公開內容 routes、SEO metadata。
改動的主要檔案：`src/pages/*.astro`、`PublicLayout`、Footer。
未解問題：正式 domain、absolute sitemap、法務審核未完成。

## Phase 5.5 — Completion Audit
做了什麼：建立完成度矩陣、缺口與 Phase 6–15 初版 roadmap。
關鍵決策與理由：先盤點再進 Backend/Device contracts。
對外介面：無。
改動的主要檔案：`docs/roadmap/project-completion-matrix.md`。
未解問題：該矩陣已落後目前進度，改由本文件維護狀態。

## Phase 6 — Public API Contract
做了什麼：建立 Public OpenAPI、read model、cache 與 security baseline。
關鍵決策與理由：Public 只讀 restaurant-level aggregate snapshot。
對外介面：`contracts/openapi/public-api.yaml`。
改動的主要檔案：Public OpenAPI 與 `docs/api`、`docs/backend`、`docs/security`。
未解問題：API version path 與 cloud runtime 尚待 ADR。

## Phase 7 — PostgreSQL Draft
做了什麼：建立 schema、migration、index、retention、tenant isolation 草案。
關鍵決策與理由：先審查 Draft SQL，不建立或連接真實資料庫。
對外介面：Draft SQL schema。
改動的主要檔案：`contracts/sql/`、`docs/backend/`。
未解問題：尚無 executable migration 與 disposable DB tests。

## Phase 7.1 — Device/Occupancy/OTA Alignment
做了什麼：補強 door、calibration、count windows、occupancy、quality 與 OTA schema。
關鍵決策與理由：後端維護權威 occupancy，Public 不查 device events。
對外介面：內部 schema contract。
改動的主要檔案：Draft SQL、backend schema/retention/index/tenant 文件。
未解問題：Production retention、partition 與 migration 尚未驗證。

## Phase 8 — Device Protocol Contract
做了什麼：建立 Device Proto/OpenAPI、authentication、retry、calibration、OTA 與 events。
關鍵決策與理由：MVP 採 HTTPS/HMAC，企業方向保留 mTLS；contract transport-neutral。
對外介面：`nana.device.v1`、`/device/v1/*`。
改動的主要檔案：`contracts/proto/v1/`、Device OpenAPI、`docs/device/`。
未解問題：尚無 firmware、runtime、真實 credential 或 interoperability test。

## Current Phase Gate

Phase 8.1 已完成 instruction bootstrap normalization、契約語意修正及 Buf/Redocly/check/build/diff 驗證。`010bc3e` 是 Phase 8 validation baseline，不是 Phase 8.1 checkpoint；工作樹尚未由使用者建立 checkpoint。未經使用者確認與人工 checkpoint，不得開始 Phase 8.2。
