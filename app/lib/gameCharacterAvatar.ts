import gameCharacterMap from "../data/gameCharacterMap.json"

export const gameCharacterAvatarMap = gameCharacterMap as Record<string, string>

export function getAvatarFileByCharacter(character: string) {
  return gameCharacterAvatarMap[character] || null
}

export function getAvatarPathByCharacter(character: string) {
  const file = getAvatarFileByCharacter(character)
  if (!file) return "/images/avatars/default.png"
  return `/images/avatars/game-characters/avatar/${file}`
}

export function getResultImagePathByCharacter(character: string) {
  const file = getAvatarFileByCharacter(character)
  if (!file) return "/images/avatars/placeholder.png"
  return `/images/avatars/game-characters/display/${file}`
}

export function getResultImageWindowSize() {
  return {
    desktop: { width: 400, height: 250 },
    tablet: { width: 344, height: 216 },
    mobile: { width: 288, height: 180 }
  }
}
