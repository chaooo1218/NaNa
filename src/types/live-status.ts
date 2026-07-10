export type CrowdLevel =
  | "empty"
  | "low"
  | "moderate"
  | "busy"
  | "peak"
  | "closed"
  | "unknown"

export type DataFreshness = "fresh" | "delayed" | "stale" | "unavailable"

export type CrowdMetricType =
  | "trafficCount"
  | "waitingCount"
  | "crowdLevel"
  | "occupancyEstimate"
  | "occupancyConfidence"
  | "freshness"

export interface RestaurantLiveStatus {
  restaurantId: string
  trafficCount: number | null
  waitingCount: number | null
  crowdLevel: CrowdLevel
  estimatedWaitMinutes: number | null
  occupancyEstimate: number | null
  occupancyConfidence: number | null
  freshness: DataFreshness
  observedAt: string | null
  receivedAt: string | null
}

export interface LiveStatusBatchRequest {
  restaurantIds: string[]
}

export interface LiveStatusBatchResponse {
  statuses: RestaurantLiveStatus[]
}
