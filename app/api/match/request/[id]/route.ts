import { withApi } from "@/app/lib/server/http"
import { requireUser } from "@/app/lib/server/auth"
import { getMatchStatus } from "@/app/lib/server/services/matchService"

export const GET = withApi(async ({ request }) => {
  const user = await requireUser(request)
  const url = new URL(request.url)
  const parts = url.pathname.split("/")
  const requestId = parts[parts.length - 1]

  return getMatchStatus({
    userId: user.id,
    requestId
  })
})
