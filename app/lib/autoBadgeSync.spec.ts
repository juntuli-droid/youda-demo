import { describe, expect, it } from "vitest"
import { createAutogenBadgesFromCareer, getRankIconMap } from "./autoBadgeSync"

describe("auto badge sync", () => {
  it("covers all configured rank enumerations", () => {
    const rankMap = getRankIconMap()
    const records = Object.keys(rankMap).map((key, index) => {
      const [game, rank] = key.split("-")
      return {
        id: `c${index}`,
        game,
        rank,
        duration: "",
        achievement: "",
        note: "",
        createdAt: new Date(Date.now() - index * 1000).toISOString()
      }
    })
    const badges = createAutogenBadgesFromCareer(records)
    expect(badges.length).toBe(Object.keys(rankMap).length)
    for (const badge of badges) {
      expect(badge.type).toBe("auto")
      expect(badge.iconUrl.endsWith(".webp") || badge.iconUrl.endsWith(".png")).toBe(true)
    }
  })
})
