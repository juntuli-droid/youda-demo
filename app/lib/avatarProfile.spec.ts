import { describe, expect, it } from "vitest"
import {
  getDefaultAvatarProfile,
  resolveAvatarForCurrentRole
} from "./avatarProfile"

describe("avatarProfile role binding", () => {
  it("uses mapped avatar when cached avatar belongs to another personality", () => {
    const resolved = resolveAvatarForCurrentRole({
      profile: {
        src: "/images/avatars/game-characters/avatar/old.png",
        personalityCode: "ACP-F",
        character: "源氏",
        customized: true
      },
      personalityCode: "BTR-L",
      character: "阿米娅",
      mappedAvatar: "/images/avatars/game-characters/avatar/new.png"
    })
    expect(resolved).toBe("/images/avatars/game-characters/avatar/new.png")
  })

  it("keeps customized avatar when personality is the same", () => {
    const resolved = resolveAvatarForCurrentRole({
      profile: {
        src: "/images/avatars/game-characters/avatar/custom.png",
        personalityCode: "BTR-L",
        character: "阿米娅",
        customized: true
      },
      personalityCode: "BTR-L",
      character: "阿米娅",
      mappedAvatar: "/images/avatars/game-characters/avatar/default.png"
    })
    expect(resolved).toBe("/images/avatars/game-characters/avatar/custom.png")
  })

  it("returns modern default avatar path", () => {
    expect(getDefaultAvatarProfile().src).toBe("/images/avatars/default.png")
  })
})
