import { withApi } from "@/app/lib/server/http"
import { requireUser } from "@/app/lib/server/auth"
import { getProfileByUserId } from "@/app/lib/server/repositories/coreRepository"
import { notFound } from "@/app/lib/server/errors"

export const GET = withApi(async ({ request }) => {
  const user = await requireUser(request)
  const profile = await getProfileByUserId(user.id)
  if (!profile) {
    throw notFound("用户不存在")
  }

  return {
    user: {
      id: profile.id,
      nickname: profile.nickname,
      avatarUrl: profile.avatarUrl
    },
    personalityProfile: profile.personality
      ? {
          fullCode: profile.personality.fullCode,
          summaryText: profile.personality.summaryText,
          character: profile.personality.character
        }
      : null
  }
})
