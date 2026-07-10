import { createApiError } from "@/lib/api/errors"
import { mockRestaurantApi } from "@/lib/api/mock/restaurant-provider"
import { runtimeConfig } from "@/lib/config/runtime-config"
import type { PublicRestaurantApi } from "@/lib/api/restaurant-api"

const productionProvider: PublicRestaurantApi = {
  async getRestaurants() {
    throw createApiError("CONFIGURATION", "正式 Public API Provider 尚未在 Phase 2 啟用。")
  },
  async getLiveStatuses() {
    throw createApiError("CONFIGURATION", "正式 Public API Provider 尚未在 Phase 2 啟用。")
  },
  async getRestaurantBySlug() {
    throw createApiError("CONFIGURATION", "正式 Public API Provider 尚未在目前階段啟用。")
  },
  async getRestaurantMenu() {
    throw createApiError("CONFIGURATION", "正式 Public API Provider 尚未在目前階段啟用。")
  },
}

export function createRestaurantApi(): PublicRestaurantApi {
  if (runtimeConfig.enableMockApi) {
    return mockRestaurantApi
  }

  return productionProvider
}
