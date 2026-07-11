# Crossing State Machine Contract

> 狀態機描述短期追蹤語意；不建立 driver 或演算法實作。

## 狀態

`UNKNOWN`、`OUTSIDE_CANDIDATE`、`OUTSIDE_CONFIRMED`、`BUFFER_FROM_OUTSIDE`、`INSIDE_CANDIDATE`、`INSIDE_CONFIRMED`、`BUFFER_FROM_INSIDE`、`ENTRY_COUNTED`、`EXIT_COUNTED`、`LOST`、`EXPIRED`。

## ENTRY

`OUTSIDE_CANDIDATE -> OUTSIDE_CONFIRMED -> BUFFER_FROM_OUTSIDE -> INSIDE_CANDIDATE -> INSIDE_CONFIRMED -> ENTRY_COUNTED`

簡化必要流程：`OUTSIDE_CONFIRMED -> BUFFER_FROM_OUTSIDE -> INSIDE_CONFIRMED -> ENTRY_COUNTED`。每一步仍需通過時間、位置、速度、最小位移、hysteresis 與 calibration 檢查。

折返：`OUTSIDE_CONFIRMED -> BUFFER_FROM_OUTSIDE -> OUTSIDE_CONFIRMED`，不計數。Buffer timeout 或不合理跳點進入 `LOST`/`EXPIRED`，不補造 crossing。

## EXIT

`INSIDE_CANDIDATE -> INSIDE_CONFIRMED -> BUFFER_FROM_INSIDE -> OUTSIDE_CANDIDATE -> OUTSIDE_CONFIRMED -> EXIT_COUNTED`

折返：`INSIDE_CONFIRMED -> BUFFER_FROM_INSIDE -> INSIDE_CONFIRMED`，不計數。ENTRY/EXIT 使用同一套 confirmation、timeout、cooldown 與 grace 原則。

## Track 規則

- LD2450 Target 1/2/3 index 只屬 frame slot，不是永久人物 ID。
- Firmware 可依時間、位置、速度連續性建立短期 internal track；track 僅存於有界記憶體，過期即移除。
- 不保存永久人物 ID，不上傳完整軌跡或 raw coordinates。
- Hysteresis zone 與 duplicate cooldown 防止門線附近抖動重複計數。
- `LOST` 可在 `lostTrackGraceMs` 內依連續性重接；超時進 `EXPIRED`，不可跨長時間重用 identity。
- 三個 target slots 持續有效約 500–1000ms 且超過 `saturationConfirmMs` 時標記 saturated；期間降低 crossing confidence，並加入 `QUALITY_FLAG_TARGET_CAPACITY_SATURATED`、`QUALITY_FLAG_COUNT_MAY_BE_UNDERESTIMATED`。
- `dualNonOverlap` 依 coverage segment 匯總；`dualOverlap` 的最終跨裝置 dedup 由後端執行，Firmware 不宣稱全門口唯一事件。

所有 threshold 由完整、版本化、checksum 驗證後的 configuration 下發。驗證失敗保留上一版本，不得套用半份設定。
