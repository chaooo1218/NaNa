# NaNa Codex Operating Guide

## Source of Truth

- Phase 規劃只看 `ROADMAP.md`。
- 目前進度、checkpoint 與阻斷只看 `PROGRESS.md`。
- 架構決策只看 accepted ADR；未接受的草案不構成決策。
- 本文件只定義穩定操作規範，不記錄目前 Phase、完成率或 checkpoint hash。

## Session Protocol

1. 每個 session 先讀 `PROGRESS.md`，再讀 `ROADMAP.md` 中目前 Phase。
2. 多檔案、架構、API、Device、Security、Database、Deployment 或 Contract 任務再讀本文件。
3. 執行前檢查 branch 與 `git status`，保留所有使用者未提交修改。
4. 只處理目前 Phase；未經使用者確認不得開始下一 Phase。
5. 完成 Phase 後立即更新 `PROGRESS.md`，並停在下一個人工 Gate。
6. 每個修復嘗試最多三次；三次失敗後標記 `blocked`、記錄錯誤並詢問使用者。
7. 不自動 commit、push、deploy、切 branch 或建立付費／雲端資源。

## Active Stack

- Public site：Astro static output。
- Interactivity：React Islands，只在需要互動時使用。
- Language：TypeScript strict；禁止 `any`、`@ts-ignore`、`@ts-nocheck`。
- Styling：既有 Tailwind/CSS 與低飽和商業工具風格。
- Motion：GSAP core、`@gsap/react`；尊重 reduced motion，不使用大型動畫。
- Package manager：pnpm。
- Legacy Next source 不是 active build；未經獨立 Phase 不刪除。

## Architecture Boundaries

```text
Astro Page/Component
-> React Island (必要時)
-> Hook/Controller
-> API Adapter
-> Mock 或未來 Production Provider
```

- UI 不直接 `fetch`、不 import mock fixture、不 hard-code API URL。
- Mapper 在資料進 UI 前完成；Public、Merchant、Admin、Device models 分離。
- Public frontend 不連 ESP32、LD2450、MQTT、DB、cache、queue 或 private API。
- 多門／多感測器由後端去重聚合，前端只讀 restaurant-level snapshot。
- `trafficCount` 不等於 occupancy；不可信時 `occupancyEstimate` 必須可為 `null`。
- 測試資料、贊助、stale 與 unavailable 必須明確標示。

## Security and Secret Rules

- `.env`、`.env.local`、`.env.*.local` 及所有含密鑰檔案不得讀取、複製、輸出、stage 或 commit。
- 不處理 token、password、private key、certificate、device key 或 service account。
- `.env.example` 只能包含不可用 placeholder。
- Secret 不得進 Public variables、source、fixture、docs、log、error、URL 或 commit。
- Device payload 是不可信輸入；不得信任其自報 tenant、merchant 或 restaurant ownership。
- Public API 不暴露 device UID、tenant/merchant ID、MAC、RSSI、calibration、OTA 或 internal diagnostics。

## Human Gates

以下操作必須先停下並取得使用者明確批准：

- Cloud/IaC、DNS、deployment、付費服務、Map provider、LINE、付款/POS。
- Production DB migration、資料刪除、retention job、backup restore。
- CA/credential provisioning、production OTA、Secure Boot、Flash Encryption、eFuse。
- 現場安裝、校正、pilot、法務、合約、定價、production launch。

## Editing and Validation

- 修改前列出預計檔案；只改目前 Phase 必需檔案。
- 不做無關 refactor、格式化、dependency upgrade 或 legacy cleanup。
- 新行為需依 Phase gate 提供 unit、contract、integration 或 E2E 驗證。
- 最低驗證：`pnpm check`、`pnpm build`、`git diff --check`。
- Proto 使用固定 Buf build/lint；OpenAPI 使用固定 Redocly recommended/spec。
- 不以停用規則、排除 active source、刪除測試或忽略錯誤換取通過。

## Completion Report

- 回報修改檔案與實際變更。
- 回報實際執行的驗證命令、結果與 warnings。
- 回報架構／契約影響、已知限制及下一個人工 Gate。
- 不宣稱未經驗證、未 checkpoint 或未部署的 Production Readiness。
