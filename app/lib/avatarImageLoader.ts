export const DEFAULT_AVATAR = "/images/avatars/default.png"
export const PLACEHOLDER_AVATAR = "/images/avatars/placeholder.png"

export function normalizeAvatarSource(src?: string) {
  if (!src) return DEFAULT_AVATAR
  return src.trim() || DEFAULT_AVATAR
}

export function buildRetryUrl(src: string, attempt: number) {
  if (attempt <= 0) return src
  const divider = src.includes("?") ? "&" : "?"
  return `${src}${divider}retry=${attempt}`
}

export function getAvatarCacheKey(src: string) {
  return `avatar-cache:${src}`
}

export function getAvatarFallbackChain(src?: string) {
  const normalized = normalizeAvatarSource(src)
  return [normalized, DEFAULT_AVATAR, PLACEHOLDER_AVATAR]
}
