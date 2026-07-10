export type ApiErrorCode =
  | "NETWORK"
  | "TIMEOUT"
  | "VALIDATION"
  | "NOT_FOUND"
  | "RATE_LIMITED"
  | "SERVER"
  | "CONFIGURATION"
  | "NOT_IMPLEMENTED"
  | "UNKNOWN"

export interface ApiMeta {
  requestId: string
  receivedAt: string
  freshness?: "fresh" | "delayed" | "stale" | "unavailable"
}

export interface PaginationMeta {
  cursor: string | null
  nextCursor: string | null
  limit: number
  hasMore: boolean
}

export interface ApiError {
  code: ApiErrorCode
  message: string
  requestId?: string
}

export interface ApiResponse<T> {
  data: T
  meta: ApiMeta
  pagination?: PaginationMeta
}

export interface RequestOptions {
  signal?: AbortSignal
  timeoutMs?: number
  requestId?: string
}

export type AsyncData<T> =
  | { status: "loading"; previousData?: T }
  | { status: "ready"; data: T; stale: false }
  | { status: "empty"; data: T }
  | { status: "error"; error: ApiError; previousData?: T }
  | { status: "stale"; data: T; error?: ApiError }
