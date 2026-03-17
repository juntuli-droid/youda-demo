export type PersonalityAsset = {
  codePrefix: string
  title: string
  portrait: string
  profileAvatar: string
  banner: string
}

function normalizeAssetUrl(url: string) {
  const cdnBase = process.env.NEXT_PUBLIC_ASSET_CDN_BASE_URL
  if (!cdnBase) return url
  if (!url.startsWith("/")) return url
  return `${cdnBase.replace(/\/$/, "")}${url}`
}

export const personalityAssets: PersonalityAsset[] = [
  {
    codePrefix: "ACP",
    title: "先锋突击",
    portrait: "/assets/personality/ace-striker.svg",
    profileAvatar: "/assets/personality/default-avatar.svg",
    banner: "/assets/personality/default-banner.svg"
  },
  {
    codePrefix: "BCP",
    title: "战术指挥",
    portrait: "/assets/personality/tactic-commander.svg",
    profileAvatar: "/assets/personality/default-avatar.svg",
    banner: "/assets/personality/default-banner.svg"
  },
  {
    codePrefix: "SCP",
    title: "协作核心",
    portrait: "/assets/personality/sync-guardian.svg",
    profileAvatar: "/assets/personality/default-avatar.svg",
    banner: "/assets/personality/default-banner.svg"
  },
  {
    codePrefix: "ACT",
    title: "猎场统帅",
    portrait: "/assets/personality/field-hunter.svg",
    profileAvatar: "/assets/personality/default-avatar.svg",
    banner: "/assets/personality/default-banner.svg"
  },
  {
    codePrefix: "BTR",
    title: "节奏编排",
    portrait: "/assets/personality/rhythm-architect.svg",
    profileAvatar: "/assets/personality/default-avatar.svg",
    banner: "/assets/personality/default-banner.svg"
  }
]

const fallbackAsset: PersonalityAsset = {
  codePrefix: "DEFAULT",
  title: "默认人格",
  portrait: "/assets/personality/default-portrait.svg",
  profileAvatar: "/assets/personality/default-avatar.svg",
  banner: "/assets/personality/default-banner.svg"
}

export function getPersonalityAsset(code?: string) {
  if (!code) return fallbackAsset
  const prefix = code.split("-")[0]
  return (
    personalityAssets.find((item) => item.codePrefix === prefix) || fallbackAsset
  )
}

export function withCatalogAsset(
  code: string | undefined,
  catalogAsset?: { portrait: string; avatar: string; banner: string }
) {
  const base = getPersonalityAsset(code)
  if (!catalogAsset) {
    return {
      ...base,
      portrait: normalizeAssetUrl(base.portrait),
      profileAvatar: normalizeAssetUrl(base.profileAvatar),
      banner: normalizeAssetUrl(base.banner)
    }
  }
  return {
    ...base,
    portrait: normalizeAssetUrl(catalogAsset.portrait || base.portrait),
    profileAvatar: normalizeAssetUrl(catalogAsset.avatar || base.profileAvatar),
    banner: normalizeAssetUrl(catalogAsset.banner || base.banner)
  }
}
