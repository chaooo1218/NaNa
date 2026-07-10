const readBoolean = (value: string | undefined, fallback: boolean) => {
  if (value === undefined || value === "") return fallback
  return value === "true"
}

const readNumber = (value: string | undefined, fallback: number) => {
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback
}

export const runtimeConfig = {
  appEnv: import.meta.env.PUBLIC_APP_ENV || "development",
  enableMockApi: readBoolean(import.meta.env.PUBLIC_ENABLE_MOCK_API, true),
  apiBaseUrl: import.meta.env.PUBLIC_API_BASE_URL || "",
  mapProvider: import.meta.env.PUBLIC_MAP_PROVIDER || "mock",
  mapboxToken: import.meta.env.PUBLIC_MAPBOX_TOKEN || "",
  liveRefreshIntervalMs: readNumber(import.meta.env.PUBLIC_LIVE_REFRESH_INTERVAL_MS, 5000),
  enableAnalytics: readBoolean(import.meta.env.PUBLIC_ENABLE_ANALYTICS, false),
} as const
