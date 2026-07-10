import { createApiError } from "@/lib/api/errors"
import {
  DEFAULT_RESTAURANTS_PER_REQUEST,
  MAX_LIVE_STATUS_IDS_PER_REQUEST,
  MAX_RESTAURANTS_PER_REQUEST,
  normalizeRestaurantIds,
  type PublicRestaurantApi,
} from "@/lib/api/restaurant-api"
import { mockRestaurantDetailFixtures, mockRestaurantFixtures } from "@/lib/api/mock/restaurant-fixtures"
import { toRestaurantLiveStatus } from "@/lib/mappers/live-status.mapper"
import { toRestaurantDetail } from "@/lib/mappers/restaurant-detail.mapper"
import { toRestaurantListItem } from "@/lib/mappers/restaurant.mapper"
import type { ApiResponse, PaginationMeta, RequestOptions } from "@/types/api"
import type { LiveStatusBatchRequest, LiveStatusBatchResponse } from "@/types/live-status"
import type { RestaurantMenu } from "@/types/menu"
import type { RestaurantDetail, RestaurantListItem } from "@/types/restaurant"
import type { RestaurantQueryParams } from "@/types/query"

const normalizeKeyword = (keyword: string | undefined) => keyword?.trim().toLowerCase() ?? ""

const createMeta = (requestId: string | undefined) => ({
  requestId: requestId ?? `mock-${crypto.randomUUID()}`,
  receivedAt: new Date().toISOString(),
  freshness: "fresh" as const,
})

const parseCursor = (cursor: string | null | undefined) => {
  if (cursor === null || cursor === undefined || cursor === "") return 0
  const parsed = Number(cursor)
  return Number.isInteger(parsed) && parsed >= 0 ? parsed : 0
}

const createPagination = (start: number, limit: number, total: number): PaginationMeta => {
  const nextOffset = start + limit
  const hasMore = nextOffset < total

  return {
    cursor: start === 0 ? null : String(start),
    nextCursor: hasMore ? String(nextOffset) : null,
    limit,
    hasMore,
  }
}

const getLimitedPage = (items: RestaurantListItem[], params: RestaurantQueryParams | undefined) => {
  const requestedLimit = params?.limit ?? DEFAULT_RESTAURANTS_PER_REQUEST
  const limit = Math.min(Math.max(1, requestedLimit), MAX_RESTAURANTS_PER_REQUEST)
  const start = parseCursor(params?.cursor)
  const data = items.slice(start, start + limit)

  return {
    data,
    pagination: createPagination(start, limit, items.length),
  }
}

const crowdScore = {
  empty: 0,
  low: 1,
  moderate: 2,
  busy: 3,
  peak: 4,
  closed: 5,
  unknown: 6,
} as const

const filterRestaurants = (params: RestaurantQueryParams | undefined) => {
  const keyword = normalizeKeyword(params?.keyword)

  return mockRestaurantFixtures
    .map((fixture: unknown) => toRestaurantListItem(fixture))
    .filter((restaurant) => {
      const matchesKeyword =
        keyword === "" ||
        restaurant.name.toLowerCase().includes(keyword) ||
        restaurant.categoryLabel.toLowerCase().includes(keyword) ||
        restaurant.tags.some((tag) => tag.toLowerCase().includes(keyword))
      const matchesCategory = params?.category === undefined || restaurant.category === params.category
      const matchesOpenNow =
        params?.openNow === undefined || params.openNow === null || (params.openNow ? restaurant.status === "open" : true)
      const matchesCrowd = params?.crowdLevel === undefined || restaurant.crowdLevel === params.crowdLevel
      const matchesOnlineOrder =
        params?.hasOnlineOrder === undefined || restaurant.hasOnlineOrder === params.hasOnlineOrder
      const matchesSponsored = params?.isSponsored === undefined || restaurant.isSponsored === params.isSponsored

      return (
        matchesKeyword &&
        matchesCategory &&
        matchesOpenNow &&
        matchesCrowd &&
        matchesOnlineOrder &&
        matchesSponsored
      )
    })
    .sort((a, b) => {
      if (params?.sort === "distance") {
        return (a.distanceMeters ?? Number.MAX_SAFE_INTEGER) - (b.distanceMeters ?? Number.MAX_SAFE_INTEGER)
      }
      if (params?.sort === "waitTime") {
        return (a.estimatedWaitMinutes ?? Number.MAX_SAFE_INTEGER) - (b.estimatedWaitMinutes ?? Number.MAX_SAFE_INTEGER)
      }
      if (params?.sort === "crowdLevel") {
        return crowdScore[a.crowdLevel] - crowdScore[b.crowdLevel]
      }
      if (a.isSponsored !== b.isSponsored) return a.isSponsored ? -1 : 1

      return 0
    })
}

export const mockRestaurantApi: PublicRestaurantApi = {
  async getRestaurants(
    params?: RestaurantQueryParams,
    options?: RequestOptions,
  ): Promise<ApiResponse<RestaurantListItem[]>> {
    const filtered = filterRestaurants(params)
    const page = getLimitedPage(filtered, params)

    return {
      data: page.data,
      meta: createMeta(options?.requestId),
      pagination: page.pagination,
    }
  },

  async getLiveStatuses(
    request: LiveStatusBatchRequest,
    options?: RequestOptions,
  ): Promise<ApiResponse<LiveStatusBatchResponse>> {
    if (request.restaurantIds.length > MAX_LIVE_STATUS_IDS_PER_REQUEST) {
      throw createApiError(
        "VALIDATION",
        `一次最多只能查詢 ${MAX_LIVE_STATUS_IDS_PER_REQUEST} 間店家的即時狀態。`,
        options?.requestId,
      )
    }

    const requestedIds = new Set(normalizeRestaurantIds(request.restaurantIds))
    const statuses = mockRestaurantFixtures
      .filter((fixture) => requestedIds.has(fixture.id))
      .map((fixture: unknown) => toRestaurantLiveStatus(fixture))

    return {
      data: { statuses },
      meta: createMeta(options?.requestId),
    }
  },

  async getRestaurantBySlug(slug: string, options?: RequestOptions): Promise<ApiResponse<RestaurantDetail>> {
    const fixture = mockRestaurantFixtures.find((item) => item.slug === slug)
    const content = mockRestaurantDetailFixtures.find((item) => item.slug === slug)

    if (fixture === undefined || content === undefined) {
      throw createApiError("NOT_FOUND", "找不到店家資料。", options?.requestId)
    }

    return {
      data: toRestaurantDetail(toRestaurantListItem(fixture), fixture.description, content),
      meta: createMeta(options?.requestId),
    }
  },

  async getRestaurantMenu(slug: string, options?: RequestOptions): Promise<ApiResponse<RestaurantMenu>> {
    const content = mockRestaurantDetailFixtures.find((item) => item.slug === slug)

    if (content === undefined || content.menu === null) {
      throw createApiError("NOT_FOUND", "找不到菜單資料。", options?.requestId)
    }

    return {
      data: {
        restaurantSlug: slug,
        categories: content.menu,
      },
      meta: createMeta(options?.requestId),
    }
  },
}
