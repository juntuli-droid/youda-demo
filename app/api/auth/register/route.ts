import { withApi } from "@/app/lib/server/http"
import { phoneAuthRegisterSchema } from "@/app/lib/server/contracts"
import { registerByPhone } from "@/app/lib/server/services/authService"
import { assertRateLimit } from "@/app/lib/server/rateLimit"

export const POST = withApi(async ({ request }) => {
  const payload = phoneAuthRegisterSchema.parse(await request.json())

  assertRateLimit({
    key: `auth_register_${payload.phone}`,
    limit: 6,
    windowMs: 60_000
  })

  return registerByPhone({
    nickname: payload.nickname,
    phone: payload.phone,
    password: payload.password,
    confirmPassword: payload.confirmPassword
  })
})
