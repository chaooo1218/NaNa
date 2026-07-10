import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { createRestaurantApi } from "@/lib/api/api-factory"
import { normalizeRestaurantIds } from "@/lib/api/restaurant-api"
import { toSafeApiError } from "@/lib/api/errors"
import { runtimeConfig } from "@/lib/config/runtime-config"
import {
  defaultRestaurantExplorerUrlState,
  parseRestaurantExplorerSearchParams,
  toRestaurantExplorerSearchParams,
  type RestaurantExplorerUrlState,
} from "@/lib/utils/query-params"
import type { ApiError } from "@/types/api"
import type { RestaurantLiveStatus } from "@/types/live-status"
import type { RestaurantListItem } from "@/types/restaurant"

type ExplorerPhase = "loading" | "ready" | "empty" | "error"

export interface RestaurantExplorerState extends RestaurantExplorerUrlState {
  phase: ExplorerPhase
  restaurants: RestaurantListItem[]
  hasStaleData: boolean
  lastSuccessfulAt: string | null
  lastError: ApiError | null
  isRefreshing: boolean
  setKeyword: (keyword: string) => void
  setCategory: (category: RestaurantExplorerUrlState["category"]) => void
  setOpenNow: (openNow: RestaurantExplorerUrlState["openNow"]) => void
  setCrowdLevel: (crowdLevel: RestaurantExplorerUrlState["crowdLevel"]) => void
  setHasOnlineOrder: (hasOnlineOrder: RestaurantExplorerUrlState["hasOnlineOrder"]) => void
  setIsSponsored: (isSponsored: RestaurantExplorerUrlState["isSponsored"]) => void
  setSort: (sort: RestaurantExplorerUrlState["sort"]) => void
  resetFilters: () => void
}

const MAX_BACKOFF_MS = 30000
const HIDDEN_REFRESH_MULTIPLIER = 6

const mergeLiveStatuses = (restaurants: RestaurantListItem[], statuses: RestaurantLiveStatus[]) => {
  const statusByRestaurantId = new Map(statuses.map((status) => [status.restaurantId, status]))

  return restaurants.map((restaurant) => {
    const status = statusByRestaurantId.get(restaurant.id)
    if (status === undefined) return restaurant

    return {
      ...restaurant,
      trafficCount: status.trafficCount,
      waitingCount: status.waitingCount,
      crowdLevel: status.crowdLevel,
      estimatedWaitMinutes: status.estimatedWaitMinutes,
      occupancyEstimate: status.occupancyEstimate,
      occupancyConfidence: status.occupancyConfidence,
      freshness: status.freshness,
      observedAt: status.observedAt,
      receivedAt: status.receivedAt,
    }
  })
}

const readInitialUrlState = () => {
  if (typeof window === "undefined") return defaultRestaurantExplorerUrlState
  return parseRestaurantExplorerSearchParams(window.location.search)
}

const hasStaleRestaurants = (restaurants: RestaurantListItem[]) =>
  restaurants.some((restaurant) => restaurant.freshness === "stale" || restaurant.freshness === "delayed")

const getJitterMs = (intervalMs: number) => Math.round(intervalMs * (0.85 + Math.random() * 0.3))

export function useRestaurantExplorerState(): RestaurantExplorerState {
  const api = useMemo(() => createRestaurantApi(), [])
  const [urlState, setUrlState] = useState<RestaurantExplorerUrlState>(readInitialUrlState)
  const [phase, setPhase] = useState<ExplorerPhase>("loading")
  const [restaurants, setRestaurants] = useState<RestaurantListItem[]>([])
  const [hasStaleData, setHasStaleData] = useState(false)
  const [lastSuccessfulAt, setLastSuccessfulAt] = useState<string | null>(null)
  const [lastError, setLastError] = useState<ApiError | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const restaurantsRef = useRef<RestaurantListItem[]>([])
  const failureCountRef = useRef(0)

  useEffect(() => {
    restaurantsRef.current = restaurants
  }, [restaurants])

  useEffect(() => {
    if (typeof window === "undefined") return

    const nextParams = toRestaurantExplorerSearchParams(urlState)
    const nextSearch = nextParams.toString()
    const nextUrl = nextSearch === "" ? window.location.pathname : `${window.location.pathname}?${nextSearch}`
    const currentUrl = `${window.location.pathname}${window.location.search}`

    if (nextUrl !== currentUrl) {
      window.history.replaceState(null, "", nextUrl)
    }
  }, [urlState])

  useEffect(() => {
    const controller = new AbortController()
    const requestId = `restaurant-list-${Date.now()}`

    setPhase("loading")
    setIsRefreshing(false)

    api
      .getRestaurants(
        {
          keyword: urlState.keyword,
          category: urlState.category ?? undefined,
          openNow: urlState.openNow ?? undefined,
          crowdLevel: urlState.crowdLevel ?? undefined,
          hasOnlineOrder: urlState.hasOnlineOrder ?? undefined,
          isSponsored: urlState.isSponsored ?? undefined,
          sort: urlState.sort,
          limit: 20,
        },
        { requestId, signal: controller.signal },
      )
      .then((response) => {
        if (controller.signal.aborted) return

        setRestaurants(response.data)
        setHasStaleData(hasStaleRestaurants(response.data))
        setLastSuccessfulAt(response.meta.receivedAt)
        setLastError(null)
        setPhase(response.data.length === 0 ? "empty" : "ready")
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return

        setLastError(toSafeApiError(error))
        setPhase(restaurantsRef.current.length > 0 ? "ready" : "error")
        if (restaurantsRef.current.length > 0) setHasStaleData(true)
      })

    return () => {
      controller.abort()
    }
  }, [api, urlState])

  useEffect(() => {
    let timeoutId: number | null = null
    let controller: AbortController | null = null
    let disposed = false
    const baseIntervalMs = runtimeConfig.liveRefreshIntervalMs

    const clearPending = () => {
      if (timeoutId !== null) {
        window.clearTimeout(timeoutId)
        timeoutId = null
      }
      controller?.abort()
      controller = null
    }

    const schedule = (delayMs: number) => {
      if (disposed) return
      if (timeoutId !== null) window.clearTimeout(timeoutId)
      timeoutId = window.setTimeout(refresh, delayMs)
    }

    const refresh = () => {
      const ids = normalizeRestaurantIds(restaurantsRef.current.map((restaurant) => restaurant.id))
      if (disposed || ids.length === 0) return
      if (typeof navigator !== "undefined" && !navigator.onLine) {
        setIsRefreshing(false)
        return
      }

      const isHidden = typeof document !== "undefined" && document.hidden
      const intervalMs = isHidden ? baseIntervalMs * HIDDEN_REFRESH_MULTIPLIER : baseIntervalMs
      controller?.abort()
      controller = new AbortController()
      setIsRefreshing(true)

      api
        .getLiveStatuses({ restaurantIds: ids }, { requestId: `live-status-${Date.now()}`, signal: controller.signal })
        .then((response) => {
          if (controller?.signal.aborted || disposed) return

          failureCountRef.current = 0
          setRestaurants((current) => mergeLiveStatuses(current, response.data.statuses))
          setHasStaleData(false)
          setLastSuccessfulAt(response.meta.receivedAt)
          setLastError(null)
          setIsRefreshing(false)
          schedule(getJitterMs(intervalMs))
        })
        .catch((error: unknown) => {
          if (controller?.signal.aborted || disposed) return

          failureCountRef.current = Math.min(failureCountRef.current + 1, 5)
          setHasStaleData(restaurantsRef.current.length > 0)
          setLastError(toSafeApiError(error))
          setIsRefreshing(false)
          schedule(Math.min(getJitterMs(baseIntervalMs) * 2 ** failureCountRef.current, MAX_BACKOFF_MS))
        })
    }

    const handleVisibilityChange = () => {
      clearPending()
      if (document.hidden) {
        schedule(getJitterMs(baseIntervalMs * HIDDEN_REFRESH_MULTIPLIER))
        return
      }
      schedule(getJitterMs(baseIntervalMs))
    }

    const handleOnline = () => schedule(getJitterMs(baseIntervalMs))
    const handleOffline = () => {
      clearPending()
      setIsRefreshing(false)
    }

    if (typeof window !== "undefined") {
      window.addEventListener("online", handleOnline)
      window.addEventListener("offline", handleOffline)
      document.addEventListener("visibilitychange", handleVisibilityChange)
      schedule(getJitterMs(baseIntervalMs))
    }

    return () => {
      disposed = true
      clearPending()
      if (typeof window !== "undefined") {
        window.removeEventListener("online", handleOnline)
        window.removeEventListener("offline", handleOffline)
        document.removeEventListener("visibilitychange", handleVisibilityChange)
      }
    }
  }, [api])

  const updateUrlState = useCallback((next: Partial<RestaurantExplorerUrlState>) => {
    setUrlState((current) => ({ ...current, ...next }))
  }, [])

  return {
    ...urlState,
    phase,
    restaurants,
    hasStaleData,
    lastSuccessfulAt,
    lastError,
    isRefreshing,
    setKeyword: (keyword) => updateUrlState({ keyword }),
    setCategory: (category) => updateUrlState({ category }),
    setOpenNow: (openNow) => updateUrlState({ openNow }),
    setCrowdLevel: (crowdLevel) => updateUrlState({ crowdLevel }),
    setHasOnlineOrder: (hasOnlineOrder) => updateUrlState({ hasOnlineOrder }),
    setIsSponsored: (isSponsored) => updateUrlState({ isSponsored }),
    setSort: (sort) => updateUrlState({ sort }),
    resetFilters: () => setUrlState(defaultRestaurantExplorerUrlState),
  }
}
