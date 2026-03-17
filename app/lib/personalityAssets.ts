export type PersonalityAsset = {
  codePrefix: string
  title: string
  portrait: string
  profileAvatar: string
  banner: string
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
  if (!catalogAsset) return base
  return {
    ...base,
    portrait: catalogAsset.portrait || base.portrait,
    profileAvatar: catalogAsset.avatar || base.profileAvatar,
    banner: catalogAsset.banner || base.banner
  }
}
