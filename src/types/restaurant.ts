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
