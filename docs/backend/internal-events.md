# Backend Internal Events 草案

> 只定義事件邊界。不建立 Queue、Kafka、RabbitMQ、SQS、Redis Streams、Worker 或 LINE 資源。

## Envelope

所有事件包含 `eventId`、`eventVersion`、`eventType`、`occurredAt`、`producedAt`、`correlationId`、內部 tenant/restaurant scope、`safeMetadata`。Payload 不含 secret、credential、private key、raw radar、永久人物 ID 或完整 device payload。

| Event | 最小 payload | Consumers |
| --- | --- | --- |
| `CountWindowAccepted` | internal device/door refs、message/boot/sequence、window time、quality summary | ingestion audit、aggregation |
| `CrossingEventCreated` | crossing event/restaurant/door refs、direction、confidence、dedup status | occupancy aggregator、quality analysis |
| `OccupancySnapshotUpdated` | restaurant ref、version、nullable display occupancy/confidence、freshness | Merchant Dashboard、Public projection |
| `QualityIncidentOpened` | incident/scope/code/severity、startedAt、safe summary | Admin 異常中心、通知 policy |
| `QualityIncidentResolved` | incident ref、resolvedAt、safe resolution | Admin、audit |
| `DeviceOfflineDetected` | device/restaurant refs、lastSeenAt、safe severity | Admin、Merchant coarse health、LINE policy |
| `DeviceRecovered` | device/restaurant refs、recoveredAt、gap summary | Admin、Merchant notification |
| `DailyMetricsFinalized` | restaurant/date、metric version、quality summary | Report Worker、Merchant Dashboard |
| `MonthlyReportReady` | tenant/restaurant internal refs、report period、storage reference、generatedAt、quality summary、safe status | Report Worker、authorized LINE notification |
| `OtaDeploymentFailed` | deployment/device/release refs、safe error code、failedAt | OTA operations、Admin alert |
| `OtaCampaignPaused` | campaign/release refs、reason code、pausedAt、affected count | OTA operations、audit |

## 邊界

- LINE Bot 只接收後端驗證、授權、去敏與聚合後的 notification command；不直接信任 device payload。
- Report Worker 查 hourly/daily aggregate，不掃描全部 Count Window 或 crossing event。
- Merchant consumer 必須再次套 tenant/restaurant authorization；Admin consumer 需角色與 audit。
- Public Website 不訂閱 internal events，只讀 Public API restaurant-level snapshot。
- `reportStorageReference` 是受控內部 reference，不是永久公開 URL；LINE event 不放 token、簽名 query 或 device credential。

Delivery semantics、outbox、partition key、queue 技術與 retry/dead-letter policy 留待後端 ADR。本文件不承諾 exactly-once；consumers 必須以 `eventId` idempotent。
