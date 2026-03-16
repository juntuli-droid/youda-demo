import { withApi } from "@/app/lib/server/http"
import { requireUser } from "@/app/lib/server/auth"
import { personalitySubmitSchema } from "@/app/lib/server/contracts"
import { submitPersonalityAnswers } from "@/app/lib/server/services/personalityService"

export const POST = withApi(async ({ request }) => {
  const user = await requireUser(request)
  const body = await request.json()
  const payload = personalitySubmitSchema.parse(body)

  const result = await submitPersonalityAnswers({
    userId: user.id,
    answers: payload.answers
  })

  return {
    sessionId: payload.sessionId,
    ...result
  }
})
