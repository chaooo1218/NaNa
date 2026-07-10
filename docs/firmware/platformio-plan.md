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
