import { NextRequest, NextResponse } from "next/server"

export function middleware(request: NextRequest) {
  if (!request.nextUrl.pathname.startsWith("/api")) {
    return NextResponse.next()
  }

  const traceId = request.headers.get("x-trace-id") || crypto.randomUUID()
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set("x-trace-id", traceId)

  const response = NextResponse.next({
    request: { headers: requestHeaders }
  })
  response.headers.set("x-trace-id", traceId)
  return response
}

export const config = {
  matcher: ["/api/:path*"]
}
