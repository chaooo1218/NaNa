import type { RestaurantLiveStatus } from "@/types/live-status"

type RawLiveStatusRecord = RestaurantLiveStatus & {
  id: string
}

const isRawLiveStatusRecord = (value: unknown): value is RawLiveStatusRecord => {
  if (typeof value !== "object" || value === null) return false
  const candidate = value as Partial<RawLiveStatusRecord>
  return typeof candidate.id === "string" && typeof candidate.crowdLevel === "string"
}

export function toRestaurantLiveStatus(raw: unknown): RestaurantLiveStatus {
  if (!isRawLiveStatusRecord(raw)) {
    throw new Error("Invalid live status fixture")
  }

  return {
    restaurantId: raw.id,
    trafficCount: raw.trafficCount,
    waitingCount: raw.waitingCount,
    crowdLevel: raw.crowdLevel,
    estimatedWaitMinutes: raw.estimatedWaitMinutes,
    occupancyEstimate: raw.occupancyEstimate,
    occupancyConfidence: raw.occupancyConfidence,
    freshness: raw.freshness,
    observedAt: raw.observedAt,
    receivedAt: raw.receivedAt,
  }
}
