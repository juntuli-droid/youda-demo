import { withApi } from "@/app/lib/server/http"
import { requireUser } from "@/app/lib/server/auth"
import { matchRequestCreateSchema } from "@/app/lib/server/contracts"
import { createMatchRequest } from "@/app/lib/server/services/matchService"
import { assertRateLimit } from "@/app/lib/server/rateLimit"

export const POST = withApi(async ({ request }) => {
  const user = await requireUser(request)
  assertRateLimit({
    key: `match_request_${user.id}`,
    limit: 10,
    windowMs: 60_000
  })

  const payload = matchRequestCreateSchema.parse(await request.json())

  return createMatchRequest({
    userId: user.id,
    gameName: payload.game,
    gameId: payload.gameId,
    ownStyle: payload.ownStyle,
    targetStyle: payload.targetStyle,
    teamSize: payload.teamSize
  })
})
