# Device Transport Strategy

## 決策

Phase 9 先採 HTTPS POST telemetry/heartbeat/progress，加 HTTPS GET polling config/command/manifest。Contract 保持 transport-neutral；Phase 8 不建立 MQTT Broker。只有 fleet 規模、下行延遲或連線成本證明需求後，才以 ADR 引入 MQTT over TLS。

## 比較

| 面向 | HTTPS POST / polling | MQTT over TLS |
| --- | --- | --- |
| 自建成本 | 既有 HTTP gateway 可承擔，MVP 較低 | broker cluster、session、ACL、憑證與監控成本較高 |
| 連線維護 | 短連線/keep-alive，行為直觀 | 長連線、keepalive、session expiry、reconnect storm |
| 大量裝置 | Batch 可降低 request；高規模需 gateway/load test | 高連線密度較佳，但 broker sizing 必須驗證 |
| 下行 command | polling 延遲可控，成本與間隔相關 | push 較自然 |
| NAT / firewall | 443 通常最容易通過 | 8883/443 MQTT 仍需企業網路確認 |
| Certificate operation | MVP 可 HMAC；企業版 mTLS | 通常每裝置 certificate，維運要求高 |
| Observability | HTTP request id/status/log 成熟 | 需 topic/session/QoS/broker metrics |
| Retry / ordering | App 明確 ACK、partial acceptance、boot/sequence | QoS 不取代 business idempotency 或跨 reconnect ordering |
| Offline buffer | 裝置 ring buffer + batch resend | 仍需本機 buffer；broker session 不能取代裝置持久化 |
| Japan production | 容易先通過企業 proxy/firewall 評估 | 大 fleet/低延遲時可能有利，但需 PKI/SLA/資料區域 ADR |

## HTTPS MVP 規則

- HTTPS/TLS；Device API 無 browser CORS。
- Telemetry 批次有 window count、payload bytes、offline age 與 rate limit。
- Command polling 使用 jitter、ETag/version 與最小間隔；不可高速輪詢。
- 429 遵守 Retry-After，5xx bounded backoff，authentication fail closed。
- OTA artifact URL 短效且受控；URL 不進 log。

## MQTT 保留條件

Proto package/message identity、idempotency key、sequence、ACK、config checksum、OTA state 與 quality flag 不綁 HTTP。未來 ADR 必須比較自建 broker、受管服務、mTLS fleet operation、baseline/10x/reconnect storm 成本、kill switch 與回退 HTTPS 的路徑；未經核准不引入 AWS IoT Core 或其他付費 broker。
