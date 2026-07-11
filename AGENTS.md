# AGENTS.md

## Required Context

1. 每次任務先讀 `PROGRESS.md`。
2. 只讀 `ROADMAP.md` 中目前 Phase 的段落。
3. 多檔案、架構、API、Device、Security、Database、Deployment 或 Contract 任務才讀 `CODEX.md`。
4. `ROADMAP.md` 是唯一 Phase 規劃來源。
5. `PROGRESS.md` 是唯一目前進度來源。
6. accepted ADR 是架構決策來源。
7. 不建立競爭狀態、Roadmap 或 Progress 文件。

## Mandatory Safety

- 保留使用者未提交修改；修改前先執行 `git status`。
- 不執行 `git reset --hard`、`git clean -fd`、`git checkout -- .` 或 `git push --force`。
- 不自動 commit、push、deploy、切 branch 或建立雲端／付費資源。
- 不讀取、複製或輸出 Secret、`.env`、token、password、key、certificate 或 credential。
- 不使用 `git add .`、`git add -A` 或 `git commit -a`。
- Staging 必須使用明確檔案白名單，並先檢查 staged diff。

## Phase Discipline

- 只執行 `PROGRESS.md` 的目前 Phase，不順手開始下一 Phase。
- 人工 Gate 必須停止並等待使用者。
- 每個失敗修復最多三次；三次失敗後標記 `blocked` 並停止。
- 不把未驗證、未 checkpoint 或未部署的工作宣稱為完成。

## Core Boundaries

- Public frontend 不直接連 ESP32、LD2450、MQTT、DB、cache、queue 或 Private API。
- Public、Merchant、Admin、Device API 與資料模型必須分離。
- UI 不直接 `fetch`、不 import mock fixture、不 hard-code API URL。
- `trafficCount` 不等於 occupancy；不可信的 `occupancyEstimate` 必須允許 `null`。
- Device payload 是不可信輸入；不得信任其自報 ownership。
- Secret 不得進 Public variables、source、fixture、docs、log、URL 或 commit。

## Minimum Validation

- 執行 `pnpm check`、`pnpm build`、`git diff --check`。
- Proto 使用任務指定的固定 Buf 執行 build/lint。
- OpenAPI 使用任務指定的固定 Redocly 驗證。
- 不停用規則、排除 active source、刪除測試或忽略錯誤換取通過。

## Completion

- 回報修改檔案、實際驗證命令與結果、已知限制。
- 停在下一個人工 Gate。
- 不宣稱未驗證的 Production Readiness。

`AGENTS.md` 只作 Codex Bootstrap；完整穩定操作規範見 `CODEX.md`。
