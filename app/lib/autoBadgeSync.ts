import type { CareerItem } from "./gameData"
import type { BadgeItem } from "./badgeTypes"

const rankIconMap: Record<string, string> = {
  "英雄联盟-青铜": "/budget/青铜.png",
  "英雄联盟-白银": "/budget/白银.png",
  "英雄联盟-黄金": "/budget/黄金.png",
  "英雄联盟-白金": "/budget/白金.png",
  "英雄联盟-钻石": "/budget/钻石.png",
  "英雄联盟-大师": "/budget/大师.png",
  "VALORANT-白银": "/budget/白银.png",
  "VALORANT-黄金": "/budget/黄金.png",
  "VALORANT-铂金": "/budget/铂金.png",
  "VALORANT-钻石": "/budget/钻石.png",
  "VALORANT-超凡": "/budget/超凡.png",
  "VALORANT-辐射": "/budget/辐射.png"
}

function keyOf(game: string, rank: string) {
  return `${game.trim()}-${rank.trim()}`
}

export function createAutogenBadgesFromCareer(records: CareerItem[]) {
  const seen = new Set<string>()
  const items: BadgeItem[] = []
  for (const item of records) {
    const rank = item.rank?.trim()
    const game = item.game?.trim()
    if (!rank || !game) continue
    const key = keyOf(game, rank)
    if (seen.has(key)) continue
    seen.add(key)
    items.push({
      id: `auto-${key}`,
      type: "auto",
      name: `${game}-${rank}`,
      description: `来自游戏生涯·${game}-${rank}`,
      game,
      rank,
      iconUrl: rankIconMap[key] || "/images/avatars/default.png",
      createdAt: item.createdAt
    })
  }
  return items.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )
}

export function getRankIconMap() {
  return rankIconMap
}
