# NaNa Phase Roadmap

本文件是唯一 phase 規劃來源。完成狀態只記錄於 `PROGRESS.md`。

| Phase | 名稱 | 一句話目標 | 機器可驗證完成條件 | 人工 Gate |
| --- | --- | --- | --- | --- |
| 0 | Baseline | 固定遷移前技術棧、風險與 active/legacy 邊界。 | baseline 文件存在；branch、active entry、legacy exclusions 可由腳本檢查。 | 否 |
| 1 | Astro Migration | 將公開網站 active build 切換為 Astro static。 | `pnpm check`、`pnpm build` 通過；輸出為 static；active source 不依賴 Next runtime。 | 否 |
| 2 | Public Data Boundary | 建立型別、API adapter、Mock Provider 與 mapper。 | UI 無直接 `fetch`/mock imports；TypeScript check 與 boundary scan 通過。 | 否 |
| 3A | Restaurant Explorer | 完成搜尋、篩選、排序、URL state 與集中式 Live Status。 | query round-trip、filter/sort、batch/stale/backoff tests 通過。 | 否 |
| 3B | Public UI Foundation | 降低 Demo 感並建立 GSAP micro-motion system。 | 375/768/1440 visual、a11y、reduced-motion checks 通過。 | 否 |
| 3C | Public UI Acceptance | 驗收首頁、404、Footer、地圖預留與公開資料邊界。 | screenshot、overflow、CTA、secret/boundary scan 通過。 | 否 |
| 4 | Restaurant Detail/Menu | 建立詳情、菜單預覽與 Not Found 路由。 | existing/not-exist routes build；ViewModel boundary tests 通過。 | 否 |
| 5 | Trust/SEO Pages | 建立商業信任頁、metadata、robots 與 Footer links。 | 所有公開 route build；metadata/link/a11y checks 通過。 | 否 |
| 5.5 | Completion Audit | 盤點完成度、缺口與初版 roadmap。 | completion matrix 存在且與 Git checkpoint 對得上。 | 否 |
| 6 | Public API Contract | 定義 Public OpenAPI、read model、cache 與安全邊界。 | Redocly `recommended`/`spec` lint 通過；Public schema 無 device/internal 欄位。 | 否 |
| 7 | PostgreSQL Draft | 定義 schema、migration、index、retention 與 tenant isolation 草案。 | Draft SQL parser/schema review checks 通過；未連接真實 DB。 | 否 |
| 7.1 | Device/Occupancy/OTA Alignment | 對齊 door、calibration、occupancy、quality 與 OTA schema。 | Draft SQL 結構檢查與文件一致性 scan 通過。 | 否 |
| 8 | Device Protocol Contract | 建立 Proto、Device OpenAPI、HMAC、retry、calibration 與 OTA contract。 | 必要 messages/endpoints/quality flags 靜態檢查通過。 | 否 |
| 8.1 | Contract Validation | 使用固定 Buf/Redocly 工具驗證並修正所有 contracts。 | Buf build/lint、Redocly recommended/spec、check/build/diff 全通過並完成 checkpoint。 | 否 |
| 8.2 | State System/ADR Freeze | 建立狀態系統並凍結 cloud、API version、repo boundary 決策。 | `AGENTS.md`、`CODEX.md`、`ROADMAP.md`、`PROGRESS.md` 與 ADR 結構存在；文件衝突 scan 為零。 | Cloud ADR 是 |
| 8.3 | Test/CI Foundation | 建立 unit、contract、E2E、a11y、visual 與 CI 基礎。 | `lint`、`test`、`test:e2e`、`check`、`build` scripts 與 CI 全綠。 | 否 |
| 8.4 | Hardware Interface Spec | 固定 ESP32/LD2450 power、UART、pin、calibration 與測試 fixture。 | schema validator 與 hardware checklist tests 通過；不含 secret/endpoint。 | 實體確認是 |
| 8.5 | PlatformIO Skeleton | 建立不含正式 endpoint/secret 的 firmware build/test 骨架。 | `pio run` 與 host tests 通過；secret scan 通過。 | 否 |
| 8.6 | ESP32 Bring-up | 完成 Wi-Fi、NTP、UART、storage 與 health 基礎。 | hardware-in-loop smoke 與 reconnect/reboot tests 通過。 | 是 |
| 8.7 | LD2450/Crossing | 完成 parser、短期 track、門線狀態機與 saturation handling。 | synthetic/recorded fixture、state-machine、golden count tests 通過。 | 校正是 |
| 8.8 | Device Transport/OTA | 完成 buffer、HTTPS client、heartbeat、config 與 OTA client。 | local mock server、retry/recovery、hash/signature/state tests 通過。 | OTA/eFuse 是 |
| 9.0 | Backend Runtime Skeleton | 建立本機 backend 模組、health、errors 與 observability hooks。 | unit/integration tests、health/readiness、structured error checks 通過。 | 否 |
| 9.1 | Executable DB Migrations | 將 Draft SQL 轉為可測 migration 與 rollback。 | disposable PostgreSQL apply/rollback/index/constraint tests 通過。 | Production 是 |
| 9.2 | Device Auth/Ingestion | 實作 registry、HMAC/mTLS boundary、config 與 telemetry ingestion。 | replay、revoke、duplicate、out-of-order、partial ACK integration tests 通過。 | CA/Key 是 |
| 9.3 | Aggregation/Occupancy | 實作 crossing dedup、雙感測器聚合、occupancy 與 quality pipeline。 | dual topology、underflow、adjustment、golden dataset tests 通過。 | 現場驗證是 |
| 9.4 | Public API/Cache | 實作 Public API、read model、ETag、cache、rate limit 與 stale fallback。 | OpenAPI conformance、cache、429、stale、load-smoke tests 通過。 | 否 |
| 9.5 | Reports/Internal Events | 實作 hourly/daily/monthly metrics、outbox 與 notification events。 | deterministic report、idempotent consumer、retention tests 通過。 | 否 |
| 10A | Threat/Secret/Logging | 建立 threat model、secret lifecycle、log redaction 與 incident baseline。 | secret scan、redaction tests、threat checklist 全通過。 | 是 |
| 10B | Auth/RBAC/Tenant | 實作 Merchant/Admin identity、roles 與 tenant isolation。 | role matrix、cross-tenant negative、session/revoke tests 通過。 | Auth provider 是 |
| 10C | Security Controls | 完成 validation、CORS、headers、rate limit 與 security tests。 | SAST/dependency/input/abuse/security-header tests 通過。 | 否 |
| 11A | Merchant API | 定義並實作商家專用 API 與 reporting boundary。 | OpenAPI lint、authorization、tenant isolation integration tests 通過。 | 否 |
| 11B | Merchant Dashboard | 建立店家狀態、設定、報表與通知管理 UI。 | 核心 E2E、a11y、375/1440 visual tests 通過。 | 否 |
| 12A | Admin API | 定義並實作 tenant、merchant、device、incident、OTA、audit API。 | OpenAPI lint、RBAC、audit integration tests 通過。 | 否 |
| 12B | Admin Dashboard | 建立營運、支援、裝置與 OTA 管理 UI。 | role E2E、audit、dangerous-action confirmation tests 通過。 | 危險操作是 |
| 13 | LINE Bot | 建立安全 webhook、綁定、授權與聚合通知流程。 | signature、idempotency、binding、template tests 通過。 | 建資源是 |
| 14 | Map Provider/Mapbox | 建立 provider adapter、地理資料治理與正式地圖。 | adapter、viewport、a11y、token restriction tests 通過。 | Token/帳務是 |
| 15A | Staging/IaC/Observability | 建立 staging、CI/CD、logs、metrics、traces 與 alerts。 | staging smoke、alert、rollback dry-run 通過。 | 是 |
| 15B | Load/Backup/Resilience | 驗證尖峰負載、備份還原、故障與成本模型。 | p95/p99/error/cache thresholds、restore、chaos tests 通過。 | 是 |
| 15C | Pilot/Production Gate | 完成現場 pilot、runbook、kill switch 與 launch gate。 | pilot acceptance、rollback drill、人工批准 artifact 齊全。 | 是 |
| 16 | Legal/Commercial Governance | 完成隱私、條款、DPA、合約、SLA、定價與資料治理。 | 必要批准 artifact 存在；法務/商務正確性由人簽核。 | 是 |
| 17 | Online Ordering Program | 將正式菜單、訂單、付款、退款與 POS 作獨立計畫。 | Ordering ADR、OpenAPI、threat model 與 sandbox E2E 通過後才能實作正式整合。 | 是 |

任何標示人工 Gate 的 phase，不得由自動化代理單獨執行外部或不可逆操作。
