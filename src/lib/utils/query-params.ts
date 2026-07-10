import type { CrowdLevel } from "@/types/live-status"
import type { RestaurantCategory, RestaurantSortOption } from "@/types/restaurant"

export interface RestaurantExplorerUrlState {
  keyword: string
  category: RestaurantCategory | null
  openNow: boolean | null
  crowdLevel: CrowdLevel | null
  hasOnlineOrder: boolean | null
  isSponsored: boolean | null
  sort: RestaurantSortOption
}

const categories: readonly RestaurantCategory[] = ["ramen", "breakfast", "bento", "drinks", "izakaya", "pizza", "other"]
const crowdLevels: readonly CrowdLevel[] = ["empty", "low", "moderate", "busy", "peak", "closed", "unknown"]
const sortOptions: readonly RestaurantSortOption[] = ["recommended", "distance", "waitTime", "crowdLevel"]

const readEnum = <T extends string>(value: string | null, allowed: readonly T[]): T | null =>
  value !== null && allowed.includes(value as T) ? (value as T) : null

const readBoolean = (value: string | null): boolean | null => {
  if (value === "true") return true
  if (value === "false") return false
  return null
}

export const defaultRestaurantExplorerUrlState: RestaurantExplorerUrlState = {
  keyword: "",
  category: null,
  openNow: null,
  crowdLevel: null,
  hasOnlineOrder: null,
  isSponsored: null,
  sort: "recommended",
}

export function parseRestaurantExplorerSearchParams(search: string): RestaurantExplorerUrlState {
  const params = new URLSearchParams(search)

  return {
    keyword: params.get("q")?.trim() ?? "",
    category: readEnum(params.get("category"), categories),
    openNow: readBoolean(params.get("openNow")),
    crowdLevel: readEnum(params.get("crowdLevel"), crowdLevels),
    hasOnlineOrder: readBoolean(params.get("hasOnlineOrder")),
    isSponsored: readBoolean(params.get("isSponsored")),
    sort: readEnum(params.get("sort"), sortOptions) ?? "recommended",
  }
}

export function toRestaurantExplorerSearchParams(state: RestaurantExplorerUrlState): URLSearchParams {
  const params = new URLSearchParams()

  if (state.keyword.trim() !== "") params.set("q", state.keyword.trim())
  if (state.category !== null) params.set("category", state.category)
  if (state.openNow !== null) params.set("openNow", String(state.openNow))
  if (state.crowdLevel !== null) params.set("crowdLevel", state.crowdLevel)
  if (state.hasOnlineOrder !== null) params.set("hasOnlineOrder", String(state.hasOnlineOrder))
  if (state.isSponsored !== null) params.set("isSponsored", String(state.isSponsored))
  if (state.sort !== "recommended") params.set("sort", state.sort)

  return params
}
