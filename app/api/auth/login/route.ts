import { withApi } from "@/app/lib/server/http"
import { phoneAuthLoginSchema } from "@/app/lib/server/contracts"
import { loginByPhone } from "@/app/lib/server/services/authService"
import { assertRateLimit } from "@/app/lib/server/rateLimit"

export const POST = withApi(async ({ request }) => {
  const payload = phoneAuthLoginSchema.parse(await request.json())

  assertRateLimit({
    key: `auth_login_${payload.phone}`,
    limit: 10,
    windowMs: 60_000
  })

  return loginByPhone({
    phone: payload.phone,
    password: payload.password,
    captchaAnswer: payload.captchaAnswer,
    ipAddress:
      request.headers.get("x-forwarded-for") ||
      request.headers.get("x-real-ip") ||
      undefined
  })
})
