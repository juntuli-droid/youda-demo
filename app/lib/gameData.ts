export type CareerItem = {
  id: string
  game: string
  rank: string
  duration: string
  achievement: string
  note: string
  createdAt: string
}

export type MatchDraft = {
  game: string
  playStyle: string
  targetStyle: string
  teamMode: string
  createdAt: string
}

export type VlogPrefill = {
  date: string
  game: string
  partnersCount: string
  duration: string
  summary: string
}

export function getTopGamesFromCareer(records: CareerItem[], limit = 3) {
  const counter = new Map<string, number>()

  records.forEach((item) => {
    const game = item.game?.trim()
    if (!game) return
    counter.set(game, (counter.get(game) || 0) + 1)
  })

  return [...counter.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([game]) => game)
}

export function mapTeamModeToCount(teamMode: string) {
  if (teamMode.includes("双排")) return "2 个"
  if (teamMode.includes("三排")) return "3 个"
  if (teamMode.includes("四排")) return "4 个"
  if (teamMode.includes("五排")) return "5 个"
  return "2 个"
}

export function mapTeamModeToRoomTitle(game: string, teamMode: string) {
  return `${game} · ${teamMode}房`
}