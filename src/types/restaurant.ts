import type { CrowdLevel, DataFreshness } from "@/types/live-status"

export type RestaurantCategory =
  | "ramen"
  | "breakfast"
  | "bento"
  | "drinks"
  | "izakaya"
  | "pizza"
  | "other"

export type RestaurantTag = string

export type RestaurantStatus = "open" | "closed" | "unknown"

export type RestaurantSortOption = "recommended" | "distance" | "waitTime" | "crowdLevel"

export type SponsorLevel = "none" | "standard" | "premium"

export interface RestaurantPromotion {
  label: string
  description: string
  validUntil: string | null
}

export interface RestaurantDetailPreview {
  id: string
  slug: string
  name: string
  category: RestaurantCategory
  categoryLabel: string
  description: string
  tags: RestaurantTag[]
  coverImage: string
  locationSummary: string
  status: RestaurantStatus
  promotions: RestaurantPromotion[]
}

export interface RestaurantListItem {
  id: string
  slug: string
  name: string
  category: RestaurantCategory
  categoryLabel: string
  tags: RestaurantTag[]
  coverImage: string
  distanceMeters: number | null
  walkingMinutes: number | null
  status: RestaurantStatus
  crowdLevel: CrowdLevel
  trafficCount: number | null
  waitingCount: number | null
  estimatedWaitMinutes: number | null
  occupancyEstimate: number | null
  occupancyConfidence: number | null
  freshness: DataFreshness
  observedAt: string | null
  receivedAt: string | null
  isSponsored: boolean
  sponsorLevel: SponsorLevel
  hasOnlineOrder: boolean
  onlineOrderUrl: string | null
  promotion: RestaurantPromotion | null
}

export interface RestaurantBusinessHour {
  dayLabel: string
  openTime: string | null
  closeTime: string | null
  isClosed: boolean
}

export interface RestaurantNotice {
  title: string
  content: string
}

export interface RestaurantLocationPreview {
  areaLabel: string
  summary: string
}

export interface RestaurantDetailContent {
  businessHours: RestaurantBusinessHour[]
  notices: RestaurantNotice[]
  location: RestaurantLocationPreview
}

export interface RestaurantDetail extends RestaurantListItem, RestaurantDetailContent {
  description: string
}

export interface RestaurantDetailViewModel {
  slug: string
  name: string
  coverImage: string
  openLabel: string
  isOpen: boolean
  crowdLevel: CrowdLevel
  crowdLabel: string
  primarySignalLabel: string
  waitTimeLabel: string
  distanceLabel: string
  categoryLabel: string
  tags: string[]
  freshnessLabel: string
  description: string
  businessHours: Array<{ dayLabel: string; hoursLabel: string }>
  notices: RestaurantNotice[]
  location: RestaurantLocationPreview
  menuHref: string
  detailHref: string
  onlineOrderLabel: string
  sponsorLabel: string | null
}

export interface RestaurantFilterState {
  keyword: string
  category: RestaurantCategory | null
  tags: RestaurantTag[]
  openNow: boolean | null
  crowdLevel: CrowdLevel | null
  hasOnlineOrder: boolean | null
  isSponsored: boolean | null
}

export interface RestaurantSearchParams extends RestaurantFilterState {
  sort: RestaurantSortOption
  cursor: string | null
  limit: number
}
