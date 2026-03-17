export type MemoryUser = {
  id: string
  authUserId: string
  nickname: string
  authProvider: string
}

export type MemoryGame = {
  id: string
  name: string
  slug: string
}

export type MemoryMatchRequest = {
  id: string
  userId: string
  gameId: string
  ownStyle: string
  targetStyle: string
  teamSize: string
  status: string
  createdAt: Date
  updatedAt: Date
}

export type MemoryMatchResult = {
  id: string
  requestId: string
  matchedUserId: string
  score: number
  status: string
  createdAt: Date
}

export type MemoryRoom = {
  id: string
  gameId: string
  roomType: string
  status: "open" | "closed"
  createdAt: Date
  updatedAt: Date
}

export type MemoryRoomMember = {
  id: string
  roomId: string
  userId: string
  readyStatus: boolean
  voiceStatus: string
  joinedAt: Date
}

export type MemoryMessage = {
  id: string
  roomId: string
  senderId: string
  content: string
  messageType: string
  createdAt: Date
}

type MemoryStore = {
  users: Map<string, MemoryUser>
  games: Map<string, MemoryGame>
  matchRequests: Map<string, MemoryMatchRequest>
  matchResults: Map<string, MemoryMatchResult>
  rooms: Map<string, MemoryRoom>
  roomMembers: Map<string, MemoryRoomMember>
  messages: Map<string, MemoryMessage>
}

const holder = globalThis as unknown as {
  syncupMemoryStore?: MemoryStore
}

export function getMemoryStore() {
  if (!holder.syncupMemoryStore) {
    holder.syncupMemoryStore = {
      users: new Map(),
      games: new Map(),
      matchRequests: new Map(),
      matchResults: new Map(),
      rooms: new Map(),
      roomMembers: new Map(),
      messages: new Map()
    }
  }
  return holder.syncupMemoryStore
}
