import { describe, expect, it } from "vitest"
import { access } from "node:fs/promises"
import path from "node:path"
import gameCharacterMap from "../data/gameCharacterMap.json"
import { resolvePersonalityAvatarFromScores } from "./personalityAvatarResolver"

describe("personality avatar resolver", () => {
  it("resolves same character/avatar for one personality deterministically", () => {
    const resolved = resolvePersonalityAvatarFromScores({
      B: 8,
      T: 9,
      R: 11,
      L: 7
    })

    expect(resolved.personality.baseCode).toBe("BTR")
    expect(resolved.character).toBe("阿米娅")
    expect(resolved.avatarPath).toContain("/images/avatars/game-characters/avatar/")
    expect(resolved.resultImagePath).toContain("/images/avatars/game-characters/display/")
    expect(resolved.avatarPath.endsWith(".png")).toBe(true)
  })

  it("ensures mapping characters exist in source game_chars_png folder", async () => {
    const entries = Object.keys(gameCharacterMap)
    expect(entries.length).toBe(27)
    for (const character of entries) {
      const sourceFile = path.resolve("game_chars_png", `${character}.png`)
      await access(sourceFile)
    }
  })
})
