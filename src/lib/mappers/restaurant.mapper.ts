import { getCrowdLabel } from "@/components/restaurant/CrowdBadge"
import type { RestaurantListItem, RestaurantPromotion, SponsorLevel } from "@/types/restaurant"

export interface RestaurantCardViewModel {
  id: string
  name: string
  categoryLabel: string
  tags: string[]
  coverImage: string
  distanceLabel: string
  openLabel: string
  isOpen: boolean
  crowdLevel: RestaurantListItem["crowdLevel"]
  waitTimeLabel: string
  primarySignalLabel: string
  freshnessLabel: string
  showStaleNotice: boolean
  isSponsored: boolean
  sponsorLevel: SponsorLevel
  sponsorLabel: string | null
  hasOnlineOrder: boolean
  onlineOrderUrl: string | null
}

type RawRestaurantRecord = RestaurantListItem & {
  description?: string
  locationSummary?: string
  promotionLabel: string | null
  promotionDescription: string | null
  promotionValidUntil: string | null
}

const isRawRestaurantRecord = (value: unknown): value is RawRestaurantRecord => {
  if (typeof value !== "object" || value === null) return false
  const candidate = value as Partial<RawRestaurantRecord>
  return typeof candidate.id === "string" && typeof candidate.name === "string"
}

const mapPromotion = (fixture: RawRestaurantRecord): RestaurantPromotion | null => {
  if (fixture.promotionLabel === null || fixture.promotionDescription === null) return null

  return {
    label: fixture.promotionLabel,
    description: fixture.promotionDescription,
    validUntil: fixture.promotionValidUntil,
  }
}

export function toRestaurantListItem(raw: unknown): RestaurantListItem {
  if (!isRawRestaurantRecord(raw)) {
    throw new Error("Invalid restaurant fixture")
  }

  return {
    id: raw.id,
    slug: raw.slug,
    name: raw.name,
    category: raw.category,
    categoryLabel: raw.categoryLabel,
    tags: raw.tags,
    coverImage: raw.coverImage,
    distanceMeters: raw.distanceMeters,
    walkingMinutes: raw.walkingMinutes,
    status: raw.status,
    crowdLevel: raw.crowdLevel,
    trafficCount: raw.trafficCount,
    waitingCount: raw.waitingCount,
    estimatedWaitMinutes: raw.estimatedWaitMinutes,
    occupancyEstimate: raw.occupancyEstimate,
    occupancyConfidence: raw.occupancyConfidence,
    freshness: raw.freshness,
    observedAt: raw.observedAt,
    receivedAt: raw.receivedAt,
    isSponsored: raw.isSponsored,
    sponsorLevel: raw.sponsorLevel,
    hasOnlineOrder: raw.hasOnlineOrder,
    onlineOrderUrl: raw.onlineOrderUrl,
    promotion: mapPromotion(raw),
  }
}

export function formatFreshnessLabel(restaurant: RestaurantListItem): string {
  if (restaurant.freshness === "unavailable" || restaurant.observedAt === null) return "暫無即時資料"
  if (restaurant.freshness === "stale") return "資料可能延遲・最後更新稍早"
  if (restaurant.freshness === "delayed") return "測試資料・更新稍有延遲"

  return "測試資料・剛剛更新"
}

export function formatWaitTimeLabel(estimatedWaitMinutes: number | null): string {
  if (estimatedWaitMinutes === null) return "暫無等待時間"
  if (estimatedWaitMinutes === 0) return "免等待"
  return `等待約 ${estimatedWaitMinutes} 分鐘`
}

const formatPrimarySignal = (restaurant: RestaurantListItem) => {
  if (restaurant.status === "closed") return "休息中"
  if (restaurant.freshness === "unavailable") return "暫無即時資料"

  const crowdLabel = getCrowdLabel(restaurant.crowdLevel)
  const waitLabel = formatWaitTimeLabel(restaurant.estimatedWaitMinutes)
  return `${crowdLabel}・${waitLabel}`
}

const formatSponsorLabel = (restaurant: RestaurantListItem) => {
  if (!restaurant.isSponsored) return null
  return restaurant.sponsorLevel === "premium" ? "贊助" : "推薦"
}

export function toRestaurantCardViewModel(restaurant: RestaurantListItem): RestaurantCardViewModel {
  return {
    id: restaurant.id,
    name: restaurant.name,
    categoryLabel: restaurant.categoryLabel,
    tags: restaurant.tags,
    coverImage: restaurant.coverImage,
    distanceLabel:
      restaurant.distanceMeters === null
        ? "距離尚未提供"
        : `${restaurant.distanceMeters}m・步行 ${restaurant.walkingMinutes ?? "-"} 分鐘`,
    openLabel: restaurant.status === "open" ? "營業中" : restaurant.status === "closed" ? "休息中" : "狀態未知",
    isOpen: restaurant.status === "open",
    crowdLevel: restaurant.crowdLevel,
    waitTimeLabel: formatWaitTimeLabel(restaurant.estimatedWaitMinutes),
    primarySignalLabel: formatPrimarySignal(restaurant),
    freshnessLabel: formatFreshnessLabel(restaurant),
    showStaleNotice: restaurant.freshness === "stale" || restaurant.freshness === "delayed",
    isSponsored: restaurant.isSponsored,
    sponsorLevel: restaurant.sponsorLevel,
    sponsorLabel: formatSponsorLabel(restaurant),
    hasOnlineOrder: restaurant.hasOnlineOrder,
    onlineOrderUrl: restaurant.onlineOrderUrl,
  }
}
