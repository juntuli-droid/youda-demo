"use client"

type ApiEnvelope<T> = {
  code: string
  message?: string
  details?: unknown
  data?: T
}

export class ApiRequestError extends Error {
  code: string
  details?: unknown
  status: number

  constructor(args: {
    message: string
    code: string
    details?: unknown
    status: number
  }) {
    super(args.message)
    this.code = args.code
    this.details = args.details
    this.status = args.status
  }
}

export async function apiRequest<T>(
  path: string,
  init?: RequestInit
): Promise<T> {
  const headers = new Headers(init?.headers || {})
  headers.set("Content-Type", "application/json")

  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("authAccessToken")
      : null

  if (token) {
    headers.set("Authorization", `Bearer ${token}`)
  }

  const response = await fetch(path, {
    ...init,
    headers
  })

  const payload = (await response.json()) as ApiEnvelope<T>
  if (!response.ok || payload.code !== "OK" || payload.data === undefined) {
    throw new ApiRequestError({
      message: payload.message || "请求失败，请稍后重试",
      code: payload.code || "UNKNOWN",
      details: payload.details,
      status: response.status
    })
  }

  return payload.data
}
