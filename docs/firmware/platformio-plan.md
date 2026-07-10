# PlatformIO 後續規劃

## 時程

- 未來韌體預計使用 PlatformIO。
- 目標硬體：ESP32-S3 N16R8、LD2450、UART。
- Phase 8.5 才建立 PlatformIO 專案骨架。
- Phase 9 才開始 LD2450 driver 與 crossing detection MVP。
- 本 Phase 不建立 firmware、PlatformIO 專案、`.env`、device key 或憑證。

## 前置條件

Device Ingestion Contract 完成前，韌體不得硬寫正式 endpoint、憑證格式、ownership mapping 或 Public API 路徑。

## 初期規劃範圍

1. Wi-Fi 連線。
2. NTP 時間同步。
3. LD2450 UART 讀取。
4. target parser。
5. heartbeat。
6. crossing count delta。
7. waiting count candidate。
8. batch upload stub。

## 公開邊界

裝置資料只進入未來 Device Ingestion boundary。Public API 不暴露裝置識別、MAC、Wi-Fi RSSI、raw target 或憑證；公開網站只讀取 restaurant-level aggregate snapshot。
## Phase 7.1 Schema Alignment

未來 Phase 8 Device Ingestion Contract 應與下列欄位對齊，但本 Phase 不建立 endpoint 或 PlatformIO 專案：

- 每約 5 秒 batch window 提供 `messageId`、`bootId`、`sequenceNumber`、schema/calibration version、window start/end、entry/exit delta、候選 waiting/occupancy、frame counters、capacity saturated、quality flags 與 firmware version。
- 重送沿用相同 message/boot/sequence，讓後端以 `(device_id, boot_id, sequence_number)` idempotent 處理；裝置不自行宣告可信 tenant/restaurant ownership。
- Firmware 只上傳候選 aggregate，不上傳永久人物 ID、完整人物軌跡或 raw coordinates。Local occupancy candidate 不是後端權威人數。
- Door topology、overlap dedup 與 occupancy adjustment 由後端控制；`dual_non_overlap` 是優先安裝方向，`dual_overlap` 必須標示不確定性。

### OTA Anti-Rollback 規劃

- Semantic version 與 security version 分離；一般功能發布不可任意提高 security version。
- 未來 rollback 只允許目標 security version 大於或等於裝置 eFuse 值，且該安全基準未被撤銷。
- 發布流程必須準備符合裝置目前 security version 的 recovery firmware，不能假設任意舊版可回復。
- Artifact 驗證使用 SHA-256 與簽章 metadata；signing private key 不可存 Repo、DB、Firmware、Artifact 或 CI log。
- Phase 7.1 不啟用 Secure Boot、不燒 eFuse、不產生 key、不建立 Artifact，也不執行 OTA。

Phase 8 應先定義 ingestion/OTA contract、時鐘偏差、亂序、重送、錯誤碼與版本相容規則；Phase 8.5 才建立骨架，後續 Phase 才實作 parser/crossing/OTA client。
