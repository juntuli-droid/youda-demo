"use client"

export type AvatarGalleryItem = {
  id: string
  character: string
  image: string
}

export type AvatarGalleryConfig = {
  version: string
  items: AvatarGalleryItem[]
}

const cacheKey = "avatarGalleryCache"

export async function loadAvatarGallery() {
  if (typeof window === "undefined") return null
  const cached = localStorage.getItem(cacheKey)
  if (cached) {
    try {
      return JSON.parse(cached) as AvatarGalleryConfig
    } catch {
      localStorage.removeItem(cacheKey)
    }
  }
  const response = await fetch("/config/avatarGallery.json", { cache: "force-cache" })
  if (!response.ok) return null
  const data = (await response.json()) as AvatarGalleryConfig
  localStorage.setItem(cacheKey, JSON.stringify(data))
  return data
}
