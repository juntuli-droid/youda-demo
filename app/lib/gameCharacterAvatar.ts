import gameCharacterMap from "../data/gameCharacterMap.json"

export const gameCharacterAvatarMap = gameCharacterMap as Record<string, string>

export function getAvatarFileByCharacter(character: string) {
  return gameCharacterAvatarMap[character] || null
}

export function getAvatarPathByCharacter(character: string) {
  const file = getAvatarFileByCharacter(character)
  if (!file) return "/images/avatars/default.png"
  return `/images/avatars/game-characters/${file}`
}
