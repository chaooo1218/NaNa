import type { ApiResponse, RequestOptions } from "@/types/api"
import type { LiveStatusBatchRequest, LiveStatusBatchResponse } from "@/types/live-status"
import type { RestaurantMenu } from "@/types/menu"
import type { RestaurantDetail, RestaurantListItem } from "@/types/restaurant"
import type { RestaurantQueryParams } from "@/types/query"

export const MAX_RESTAURANTS_PER_REQUEST = 50
export const DEFAULT_RESTAURANTS_PER_REQUEST = 20
export const MAX_LIVE_STATUS_IDS_PER_REQUEST = 20

export function normalizeRestaurantIds(restaurantIds: string[]) {
  return [...new Set(restaurantIds.map((id) => id.trim()).filter((id) => id !== ""))].slice(
    0,
    MAX_LIVE_STATUS_IDS_PER_REQUEST,
  )
}

export interface PublicRestaurantApi {
  getRestaurants(
    params?: RestaurantQueryParams,
    options?: RequestOptions,
  ): Promise<ApiResponse<RestaurantListItem[]>>

  getLiveStatuses(
    request: LiveStatusBatchRequest,
    options?: RequestOptions,
  ): Promise<ApiResponse<LiveStatusBatchResponse>>

  getRestaurantBySlug(slug: string, options?: RequestOptions): Promise<ApiResponse<RestaurantDetail>>

  getRestaurantMenu(slug: string, options?: RequestOptions): Promise<ApiResponse<RestaurantMenu>>
}
