export type BadgeType = "manual" | "auto"

export type BadgeItem = {
  id: string
  name: string
  description: string
  iconUrl: string
  blurDataURL?: string
  type: BadgeType
  game?: string
  rank?: string
  createdAt: string
}

export type OfficialBadgePreset = {
  id: string
  name: string
  description: string
  iconUrl: string
  blurDataURL?: string
}
