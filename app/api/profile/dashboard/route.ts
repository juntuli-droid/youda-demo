import { withApi } from "@/app/lib/server/http"
import { requireUser } from "@/app/lib/server/auth"
import { getDashboardByUserId } from "@/app/lib/server/repositories/coreRepository"
import { getTopGamesFromCareer } from "@/app/lib/gameData"

export const GET = withApi(async ({ request }) => {
  const user = await requireUser(request)
  const dashboard = await getDashboardByUserId(user.id)
  const careerLogs = dashboard.careerLogs as Array<{
    id: string
    game: { name: string }
    createdAt: Date
  }>

  const topGames = getTopGamesFromCareer(
    careerLogs.map((item) => ({
      id: item.id,
      game: item.game.name,
      rank: "",
      duration: "",
      achievement: "",
      note: "",
      createdAt: item.createdAt.toISOString()
    }))
  )

  return {
    profile: dashboard.user
      ? {
          id: dashboard.user.id,
          nickname: dashboard.user.nickname,
          personality: dashboard.user.personality
        }
      : null,
    stats: {
      careerLogCount: careerLogs.length,
      latestMessageCount: dashboard.latestMessages.length
    },
    topGames,
    latestCareer: careerLogs[0] || null
  }
})
