import type { CrowdLevel } from "@/types/live-status"
import type { RestaurantCategory, RestaurantSortOption } from "@/types/restaurant"

export interface RestaurantQueryParams {
  keyword?: string
  category?: RestaurantCategory
  openNow?: boolean
  crowdLevel?: CrowdLevel
  hasOnlineOrder?: boolean
  isSponsored?: boolean
  sort?: RestaurantSortOption
  cursor?: string | null
  limit?: number
}
