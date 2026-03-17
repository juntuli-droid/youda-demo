import { describe, expect, it } from "vitest"
import {
  buildRetryUrl,
  DEFAULT_AVATAR,
  getAvatarCacheKey,
  getAvatarFallbackChain,
  normalizeAvatarSource,
  PLACEHOLDER_AVATAR
} from "./avatarImageLoader"

describe("avatarImageLoader", () => {
  it("normalizes empty source to default avatar", () => {
    expect(normalizeAvatarSource("")).toBe(DEFAULT_AVATAR)
    expect(normalizeAvatarSource(undefined)).toBe(DEFAULT_AVATAR)
  })

  it("builds retry url with query suffix", () => {
    expect(buildRetryUrl("/a.png", 0)).toBe("/a.png")
    expect(buildRetryUrl("/a.png", 1)).toBe("/a.png?retry=1")
    expect(buildRetryUrl("/a.png?v=1", 2)).toBe("/a.png?v=1&retry=2")
  })

  it("provides fallback chain and stable cache key", () => {
    expect(getAvatarFallbackChain("/x.png")).toEqual([
      "/x.png",
      DEFAULT_AVATAR,
      PLACEHOLDER_AVATAR
    ])
    expect(getAvatarCacheKey("/x.png")).toBe("avatar-cache:/x.png")
  })
})
