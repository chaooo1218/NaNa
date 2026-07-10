import type { ApiError, ApiErrorCode } from "@/types/api"

export class PublicApiError extends Error {
  readonly code: ApiErrorCode
  readonly requestId?: string

  constructor(error: ApiError) {
    super(error.message)
    this.name = "PublicApiError"
    this.code = error.code
    this.requestId = error.requestId
  }
}

export function createApiError(code: ApiErrorCode, message: string, requestId?: string) {
  return new PublicApiError({ code, message, requestId })
}

export function toSafeApiError(error: unknown): ApiError {
  if (error instanceof PublicApiError) {
    return {
      code: error.code,
      message: error.message,
      requestId: error.requestId,
    }
  }

  return {
    code: "UNKNOWN",
    message: "目前無法取得餐廳資料，請稍後再試。",
  }
}
