"use client"

export type AvatarMapItem = {
  personality: string
  character: string
  image: string
}

export type AvatarMapConfig = {
  version: string
  items: AvatarMapItem[]
}

const cacheKey = "avatarMapCache"

export async function loadAvatarMap() {
  if (typeof window === "undefined") return null
  const cached = localStorage.getItem(cacheKey)
  if (cached) {
    try {
      return JSON.parse(cached) as AvatarMapConfig
    } catch {
      localStorage.removeItem(cacheKey)
    }
  }
  const response = await fetch("/config/avatarMap.json", { cache: "force-cache" })
  if (!response.ok) return null
  const data = (await response.json()) as AvatarMapConfig
  localStorage.setItem(cacheKey, JSON.stringify(data))
  return data
}

export function pickAvatarByPersonality(
  map: AvatarMapConfig | null,
  code?: string
) {
  if (!map || map.items.length === 0) return null
  const base = code?.split("-")[0]
  if (base) {
    const found = map.items.find((item) => item.personality === base)
    if (found) return found
  }
  const index = Math.floor(Math.random() * map.items.length)
  return map.items[index]
}
