import { randomUUID } from "crypto"
import { NextRequest, NextResponse } from "next/server"
import { ZodError } from "zod"
import { ApiError } from "./errors"

type Handler<T> = (ctx: { request: NextRequest; traceId: string }) => Promise<T>

export function getTraceId(request: NextRequest) {
  return request.headers.get("x-trace-id") || randomUUID()
}

export function withApi<T>(handler: Handler<T>) {
  return async (request: NextRequest) => {
    const traceId = getTraceId(request)

    try {
      const data = await handler({ request, traceId })
      return NextResponse.json(
        {
          code: "OK",
          data,
          traceId
        },
        {
          headers: {
            "x-trace-id": traceId
          }
        }
      )
    } catch (error) {
      if (error instanceof ApiError) {
        return NextResponse.json(
          {
            code: error.code,
            message: error.message,
            details: error.details,
            traceId
          },
          {
            status: error.status,
            headers: {
              "x-trace-id": traceId
            }
          }
        )
      }

      if (error instanceof ZodError) {
        return NextResponse.json(
          {
            code: "VAL_400",
            message: "请求参数校验失败",
            details: error.flatten(),
            traceId
          },
          {
            status: 400,
            headers: {
              "x-trace-id": traceId
            }
          }
        )
      }

      console.error(`[${traceId}] unhandled_error`, error)

      return NextResponse.json(
        {
          code: "SYS_500",
          message: "系统繁忙，请稍后重试",
          traceId
        },
        {
          status: 500,
          headers: {
            "x-trace-id": traceId
          }
        }
      )
    }
  }
}
