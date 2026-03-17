import { describe, expect, it } from "vitest"
import { stat } from "node:fs/promises"
import path from "node:path"
import sharp from "sharp"
import gameCharacterMap from "../data/gameCharacterMap.json"
import { calculatePersonality, getPersonalityMeta } from "./personalityEngine"
import {
  getAvatarPathByCharacter,
  getResultImagePathByCharacter,
  getResultImageWindowSize
} from "./gameCharacterAvatar"

describe("gameCharacterMap integrity", () => {
  it("contains 27 character mappings with accessible images", async () => {
    const entries = Object.entries(gameCharacterMap)
    expect(entries.length).toBe(27)

    for (const [character, fileName] of entries) {
      expect(character.length).toBeGreaterThan(0)
      expect(fileName.endsWith(".png")).toBe(true)

      const displayPath = path.resolve(
        "public/images/avatars/game-characters/display",
        fileName
      )
      const avatarPath = path.resolve(
        "public/images/avatars/game-characters/avatar",
        fileName
      )
      const displayStat = await stat(displayPath)
      const avatarStat = await stat(avatarPath)
      expect(displayStat.size).toBeLessThanOrEqual(200 * 1024)
      expect(avatarStat.size).toBeLessThanOrEqual(200 * 1024)

      const displayMetadata = await sharp(displayPath).metadata()
      expect(displayMetadata.width || 0).toBeGreaterThanOrEqual(512)
      expect(displayMetadata.height || 0).toBeGreaterThanOrEqual(512)

      const avatarMetadata = await sharp(avatarPath).metadata()
      expect(avatarMetadata.width).toBe(512)
      expect(avatarMetadata.height).toBe(512)
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
    const resultImagePath = getResultImagePathByCharacter(meta.character)
    const windowSize = getResultImageWindowSize()

    expect(result.baseCode).toBe("ACP")
    expect(meta.character).toBe("源氏")
    expect(avatarPath).toContain("/images/avatars/game-characters/avatar/")
    expect(resultImagePath).toContain("/images/avatars/game-characters/display/")
    expect(avatarPath.endsWith(".png")).toBe(true)
    expect(windowSize.desktop).toEqual({ width: 400, height: 250 })
    expect(windowSize.tablet).toEqual({ width: 344, height: 216 })
    expect(windowSize.mobile).toEqual({ width: 288, height: 180 })
  })
})
