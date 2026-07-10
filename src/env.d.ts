/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly PUBLIC_APP_ENV: "development" | "preview" | "production"
  readonly PUBLIC_ENABLE_MOCK_API: string
  readonly PUBLIC_API_BASE_URL: string
  readonly PUBLIC_MAP_PROVIDER: "mock" | "mapbox"
  readonly PUBLIC_MAPBOX_TOKEN: string
  readonly PUBLIC_LIVE_REFRESH_INTERVAL_MS: string
  readonly PUBLIC_ENABLE_ANALYTICS: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
