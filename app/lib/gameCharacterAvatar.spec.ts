import { describe, expect, it } from "vitest"
import { stat } from "node:fs/promises"
import path from "node:path"
import sharp from "sharp"
import gameCharacterMap from "../data/gameCharacterMap.json"
import { calculatePersonality, getPersonalityMeta } from "./personalityEngine"
import { getAvatarPathByCharacter } from "./gameCharacterAvatar"

describe("gameCharacterMap integrity", () => {
  it("contains 27 character mappings with accessible images", async () => {
    const entries = Object.entries(gameCharacterMap)
    expect(entries.length).toBe(27)

    for (const [character, fileName] of entries) {
      expect(character.length).toBeGreaterThan(0)
      expect(fileName.endsWith(".png")).toBe(true)

      const filePath = path.resolve(
        "public/images/avatars/game-characters",
        fileName
      )
      const fileStat = await stat(filePath)
      expect(fileStat.size).toBeLessThanOrEqual(200 * 1024)

      const metadata = await sharp(filePath).metadata()
      expect(metadata.width || 0).toBeGreaterThanOrEqual(512)
      expect(metadata.height || 0).toBeGreaterThanOrEqual(512)
    }
  })
})

describe("personality result avatar flow", () => {
  it("resolves character avatar path after test result", () => {
    const result = calculatePersonality({
      A: 10,
      C: 10,
      P: 10,
      F: 10
    })
    const meta = getPersonalityMeta(result.code)
    const avatarPath = getAvatarPathByCharacter(meta.character)

    expect(result.baseCode).toBe("ACP")
    expect(meta.character).toBe("源氏")
    expect(avatarPath).toContain("/images/avatars/game-characters/")
    expect(avatarPath.endsWith(".png")).toBe(true)
  })
})
