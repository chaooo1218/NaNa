# Phase 0 Baseline

日期：2026-07-07
分支：`feat/astro-migration`
專案路徑：`C:\Users\dream\Desktop\餐廳一站式整合\NaNa`

## 1. Current Branch

已確認目前 Git branch：

```text
feat/astro-migration
```

Phase 0 掃描時 `git status --short` 顯示既有未追蹤產物：

```text
?? .next/
?? next-env.d.ts
?? node_modules/
?? tsconfig.tsbuildinfo
```

這些檔案未被刪除、未被回復、未被提交。

## 2. Baseline 技術棧

目前 v0 匯出專案原始狀態為：

- Next.js 16
- React 19
- Tailwind CSS 4
- TypeScript strict mode
- pnpm
- lucide-react icons
- shadcn / Base UI 相關設定

Phase 1 目標是將 active build path 切換為 Astro static website。舊 Next.js 原始碼保留作 legacy reference，不作為 active runtime。

## 3. 原本入口

原始 Next.js 入口：

- `app/layout.tsx`
- `app/page.tsx`

Phase 1 active Astro 入口：

- `src/layouts/PublicLayout.astro`
- `src/pages/index.astro`

## 4. 既有 UI 範圍

原 v0 UI 包含：

- NaNa / 公司品牌橫幅
- Header
- 搜尋欄
- 篩選 chips
- 排序入口
- 餐廳卡片列表
- Crowd meter / crowd badge
- Mock map / map placeholder
- Footer
- 線上點餐入口
- 查看詳情 placeholder

Phase 1 僅保留公開首頁視覺與互動骨架，不建立正式 API、地圖 SDK、店家詳情頁、登入或付款流程。

## 5. 既有資產

保留資產：

- `public/restaurants/ramen.png`
- `public/restaurants/breakfast.png`
- `public/restaurants/bento.png`
- `public/restaurants/drinks.png`
- `public/restaurants/izakaya.png`
- `public/restaurants/pizza.png`
- `public/cai-xu-logo.png`

## 6. 既有主要風險

1. `lib/restaurants.ts` 同時包含 mock data、UI 顯示欄位、map position 與商業狀態，資料邊界混雜。
2. 舊資料欄位 `currentPeople` / `capacity` 容易被誤用為可靠店內人數。Phase 1 active model 改以 `occupancyEstimate: null` 表示目前不提供可靠店內人數估算。
3. 舊 `components/store-map.tsx` 直接 import mock data，且 map pin presentation 與餐廳資料來源耦合。
4. 原本不存在 API Adapter Layer。
5. 原本不存在 Loading / Empty / Error / Stale data 的正式狀態模型。
6. `next.config.mjs` 設定 `ignoreBuildErrors: true`，不得帶入 Astro active build。
7. 原本沒有 active Astro build path。
8. 原本 `lint` script 指向 `eslint .`，但專案沒有可用 ESLint 設定與依賴。

## 7. Phase 1 邊界

Phase 1 可以做：

- Astro static build skeleton
- React Island for homepage exploration
- Mock API provider
- Public API adapter interface placeholder
- Runtime config boundary
- TypeScript domain type foundation
- Loading / Empty / Error / Stale state foundation

Phase 1 不做：

- OpenAPI contracts
- Protobuf contracts
- AWS infrastructure
- Device ingestion
- ESP32-S3 firmware
- LD2450 driver
- MQTT
- AWS IoT Core
- Redis / database client
- Mapbox SDK
- Authentication
- Payment
- Merchant / Admin backend
- Reporting / Line Bot

## 8. Frontend Data Boundary

Active UI 不應直接 import raw mock dataset。

Phase 1 建立的方向：

```text
React Island
→ createRestaurantApi()
→ RestaurantApi interface
→ Mock Restaurant Provider
→ typed RestaurantListItem[]
```

Public frontend 不直接連線至 ESP32-S3、LD2450、MQTT、AWS IoT Core、Redis、資料庫或任何 private backend。

## 9. Phase 1 驗收標準

- Active build script 使用 Astro，而不是 Next.js。
- Active Astro UI 不 import `lib/restaurants.ts`。
- Active Astro UI 不直接呼叫 `fetch`。
- Active Astro UI 不 hard-code API base URL。
- Active production code 不 import `@vercel/analytics`。
- `ignoreBuildErrors: true` 不屬於 Astro active build path。
- `occupancyEstimate` 預設為 `null`，不宣稱可靠店內人數。
- Mock map 只作 placeholder，不導入 Mapbox SDK。
- 不建立任何真實 API、AWS、設備、資料庫、登入或付款資源。
