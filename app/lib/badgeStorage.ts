"use client"

import type { BadgeItem, OfficialBadgePreset } from "./badgeTypes"

const storageKey = "profileBadgeConfig"

type BadgeStore = {
  manualBadges: BadgeItem[]
  autogenBadges: BadgeItem[]
}

function toStore(value?: Partial<BadgeStore>): BadgeStore {
  return {
    manualBadges: value?.manualBadges || [],
    autogenBadges: value?.autogenBadges || []
  }
}

function getBadgeStorageKey() {
  if (typeof window === "undefined") return storageKey
  const rawProfile = localStorage.getItem("authUserProfile")
  const sessionId = localStorage.getItem("demoSessionId") || "guest"
  if (!rawProfile) return `${storageKey}:guest:${sessionId}`
  try {
    const parsed = JSON.parse(rawProfile) as {
      phone?: string
      nickname?: string
      provider?: string
    }
    const uid =
      parsed.phone?.trim() ||
      `${parsed.provider || "local"}:${parsed.nickname?.trim() || "unknown"}`
    return `${storageKey}:user:${uid}`
  } catch {
    return `${storageKey}:guest:${sessionId}`
  }
}

export function hasBadgeManagePermission() {
  if (typeof window === "undefined") return false
  const token = localStorage.getItem("authAccessToken")
  const profile = localStorage.getItem("authUserProfile")
  return Boolean(token || profile)
}

export function loadBadgeStore() {
  if (typeof window === "undefined") return toStore()
  const raw = localStorage.getItem(getBadgeStorageKey())
  if (!raw) return toStore()
  try {
    const parsed = JSON.parse(raw) as BadgeStore
    return toStore(parsed)
  } catch {
    return toStore()
  }
}

export function saveBadgeStore(store: BadgeStore) {
  if (typeof window === "undefined") return
  localStorage.setItem(getBadgeStorageKey(), JSON.stringify(store))
}

export function toDisplayBadges(store: BadgeStore) {
  const sortDesc = (a: BadgeItem, b: BadgeItem) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  return [...store.manualBadges].sort(sortDesc).concat([...store.autogenBadges].sort(sortDesc))
}

export function addManualBadge(input: {
  name: string
  description: string
  iconUrl: string
  blurDataURL?: string
}) {
  const store = loadBadgeStore()
  const badge: BadgeItem = {
    id: crypto.randomUUID(),
    name: input.name.trim(),
    description: input.description.trim(),
    iconUrl: input.iconUrl,
    blurDataURL: input.blurDataURL,
    type: "manual",
    createdAt: new Date().toISOString()
  }
  const next = {
    ...store,
    manualBadges: [badge, ...store.manualBadges]
  }
  saveBadgeStore(next)
  return badge
}

export function addManualBadgeFromPreset(preset: OfficialBadgePreset) {
  return addManualBadge({
    name: preset.name,
    description: preset.description,
    iconUrl: preset.iconUrl,
    blurDataURL: preset.blurDataURL
  })
}

export function removeBadgeById(id: string) {
  const store = loadBadgeStore()
  const next = {
    manualBadges: store.manualBadges.filter((item) => item.id !== id),
    autogenBadges: store.autogenBadges.filter((item) => item.id !== id)
  }
  saveBadgeStore(next)
  return next
}

export function replaceManualBadge(
  id: string,
  patch: Partial<Pick<BadgeItem, "name" | "description" | "iconUrl" | "blurDataURL">>
) {
  const store = loadBadgeStore()
  const next = {
    ...store,
    manualBadges: store.manualBadges.map((item) =>
      item.id === id
        ? {
            ...item,
            name: patch.name?.trim() || item.name,
            description: patch.description?.trim() || item.description,
            iconUrl: patch.iconUrl || item.iconUrl,
            blurDataURL: patch.blurDataURL || item.blurDataURL
          }
        : item
    )
  }
  saveBadgeStore(next)
  return next
}
