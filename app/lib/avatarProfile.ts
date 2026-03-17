"use client"

export type AvatarPreset = {
  id: string
  label: string
  src: string
}

export type AvatarProfile = {
  src: string
  personalityCode?: string
  character?: string
  customized?: boolean
}

const storageKey = "avatarProfileConfig"

export const avatarPresets: AvatarPreset[] = [
  { id: "a1", label: "角色 01", src: "/assets/gameImages/avatar/character-01.webp" },
  { id: "a2", label: "角色 02", src: "/assets/gameImages/avatar/character-02.webp" },
  { id: "a3", label: "角色 03", src: "/assets/gameImages/avatar/character-03.webp" },
  { id: "a4", label: "角色 04", src: "/assets/gameImages/avatar/character-04.webp" },
  { id: "a5", label: "角色 05", src: "/assets/gameImages/avatar/character-05.webp" }
]

export function getDefaultAvatarProfile(): AvatarProfile {
  return {
    src: "/images/avatars/default.png",
    customized: false
  }
}

export function loadAvatarProfile(): AvatarProfile {
  if (typeof window === "undefined") return getDefaultAvatarProfile()
  const raw = localStorage.getItem(storageKey)
  if (!raw) return getDefaultAvatarProfile()
  try {
    const parsed = JSON.parse(raw) as AvatarProfile
    if (!parsed.src) return getDefaultAvatarProfile()
    return {
      src: parsed.src,
      personalityCode: parsed.personalityCode,
      character: parsed.character,
      customized: Boolean(parsed.customized)
    }
  } catch {
    return getDefaultAvatarProfile()
  }
}

export function saveAvatarProfile(profile: AvatarProfile) {
  if (typeof window === "undefined") return
  localStorage.setItem(storageKey, JSON.stringify(profile))
}

export function resolveAvatarForCurrentRole(args: {
  profile: AvatarProfile
  personalityCode: string
  character: string
  mappedAvatar: string
}) {
  const profile = args.profile
  if (
    profile.customized &&
    profile.personalityCode === args.personalityCode &&
    profile.src
  ) {
    return profile.src
  }
  return args.mappedAvatar
}
