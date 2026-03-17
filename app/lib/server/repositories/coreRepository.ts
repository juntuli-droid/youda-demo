import { Prisma } from "@prisma/client"
import { prisma } from "../prisma"
import { getMemoryStore } from "../memoryStore"
import { getAvatarPathByCharacter } from "../../gameCharacterAvatar"

function shouldUseMemoryStore() {
  return !process.env.DATABASE_URL
}

function canFallback(error: unknown) {
  const code =
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof (error as { code?: unknown }).code === "string"
      ? (error as { code: string }).code
      : ""
  return ["P2021", "P1001", "P1017", "P1008", "P1000"].includes(code)
}

async function withFallback<T, U>(dbFn: () => Promise<T>, memoryFn: () => U) {
  if (shouldUseMemoryStore()) return memoryFn()
  try {
    return await dbFn()
  } catch (error) {
    if (!canFallback(error)) throw error
    return memoryFn()
  }
}

export async function getProfileByUserId(userId: string) {
  return withFallback(
    () =>
      prisma.user.findUnique({
        where: { id: userId },
        include: { personality: true }
      }),
    () => {
      const store = getMemoryStore()
      const user = store.users.get(userId)
      if (!user) return null
      return {
        id: user.id,
        nickname: user.nickname,
        avatarUrl: user.avatarUrl || "/images/avatars/default.png",
        personality: null
      }
    }
  )
}

export async function getDashboardByUserId(userId: string) {
  return withFallback(
    async () => {
      const [user, careerLogs, latestMessages] = await Promise.all([
        prisma.user.findUnique({
          where: { id: userId },
          include: { personality: true }
        }),
        prisma.gameLog.findMany({
          where: { userId },
          orderBy: { createdAt: "desc" },
          take: 10,
          include: { game: true }
        }),
        prisma.message.findMany({
          where: { senderId: userId },
          orderBy: { createdAt: "desc" },
          take: 5,
          include: { room: true }
        })
      ])
      return { user, careerLogs, latestMessages }
    },
    () => {
      const store = getMemoryStore()
      const user = store.users.get(userId)
      return {
        user: user
          ? {
              id: user.id,
              nickname: user.nickname,
              personality: null
            }
          : null,
        careerLogs: [],
        latestMessages: []
      }
    }
  )
}

export async function replacePersonalityAnswers(args: {
  userId: string
  answers: Array<{ questionId: number; answerValue: string }>
}) {
  await withFallback(
    () =>
      prisma.$transaction([
        prisma.personalityAnswer.deleteMany({ where: { userId: args.userId } }),
        prisma.personalityAnswer.createMany({
          data: args.answers.map((item) => ({ ...item, userId: args.userId }))
        })
      ]),
    () => []
  )
}

export async function upsertPersonalityProfile(args: {
  userId: string
  styleCode: string
  personalityCode: string
  preferenceCode: string
  activityTag: string
  fullCode: string
  summaryText: string
  character: string
}) {
  return withFallback(
    () =>
      prisma.gamePersonalityProfile.upsert({
        where: { userId: args.userId },
        update: {
          styleCode: args.styleCode,
          personalityCode: args.personalityCode,
          preferenceCode: args.preferenceCode,
          activityTag: args.activityTag,
          fullCode: args.fullCode,
          summaryText: args.summaryText,
          character: args.character
        },
        create: args
      }),
    () => ({
      id: crypto.randomUUID(),
      ...args,
      createdAt: new Date(),
      updatedAt: new Date()
    })
  )
}

export async function ensureGameByName(name: string) {
  const slug = name.toLowerCase().replace(/\s+/g, "-")
  return withFallback(
    () =>
      prisma.game.upsert({
        where: { slug },
        update: { name },
        create: { name, slug }
      }),
    () => {
      const store = getMemoryStore()
      const found = [...store.games.values()].find((item) => item.slug === slug)
      if (found) return found
      const game = { id: crypto.randomUUID(), name, slug }
      store.games.set(game.id, game)
      return game
    }
  )
}

export async function createMatchAndRoom(args: {
  userId: string
  gameId: string
  ownStyle: string
  targetStyle: string
  teamSize: string
  score: number
}) {
  return withFallback(
    () =>
      prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        const request = await tx.matchRequest.create({
          data: {
            userId: args.userId,
            gameId: args.gameId,
            ownStyle: args.ownStyle,
            targetStyle: args.targetStyle,
            teamSize: args.teamSize,
            status: "matched"
          }
        })
        const room = await tx.room.create({
          data: {
            gameId: args.gameId,
            roomType: args.teamSize,
            status: "open"
          }
        })
        await tx.roomMember.create({
          data: {
            roomId: room.id,
            userId: args.userId,
            readyStatus: false,
            voiceStatus: "connected"
          }
        })
        await tx.matchResult.create({
          data: {
            requestId: request.id,
            matchedUserId: args.userId,
            score: args.score,
            status: "selected"
          }
        })
        return { request, room }
      }),
    () => {
      const store = getMemoryStore()
      const now = new Date()
      const request = {
        id: crypto.randomUUID(),
        userId: args.userId,
        gameId: args.gameId,
        ownStyle: args.ownStyle,
        targetStyle: args.targetStyle,
        teamSize: args.teamSize,
        status: "matched" as const,
        createdAt: now,
        updatedAt: now
      }
      const room = {
        id: crypto.randomUUID(),
        gameId: args.gameId,
        roomType: args.teamSize,
        status: "open" as const,
        createdAt: now,
        updatedAt: now
      }
      const roomMember = {
        id: crypto.randomUUID(),
        roomId: room.id,
        userId: args.userId,
        readyStatus: false,
        voiceStatus: "connected",
        joinedAt: now
      }
      const result = {
        id: crypto.randomUUID(),
        requestId: request.id,
        matchedUserId: args.userId,
        score: args.score,
        status: "selected",
        createdAt: now
      }
      store.matchRequests.set(request.id, request)
      store.rooms.set(room.id, room)
      store.roomMembers.set(roomMember.id, roomMember)
      store.matchResults.set(result.id, result)
      return { request, room }
    }
  )
}

export async function getMatchRequestForUser(requestId: string, userId: string) {
  return withFallback(
    () =>
      prisma.matchRequest.findFirst({
        where: { id: requestId, userId },
        include: {
          results: {
            orderBy: { score: "desc" },
            take: 5,
            include: { matchedUser: true }
          }
        }
      }),
    () => {
      const store = getMemoryStore()
      const request = store.matchRequests.get(requestId)
      if (!request || request.userId !== userId) return null
      const results = [...store.matchResults.values()]
        .filter((item) => item.requestId === request.id)
        .sort((a, b) => b.score - a.score)
        .slice(0, 5)
        .map((item) => ({
          id: item.id,
          score: item.score,
          status: item.status,
          matchedUser: {
            id: item.matchedUserId,
            nickname: store.users.get(item.matchedUserId)?.nickname || "玩家"
          }
        }))
      return { ...request, results }
    }
  )
}

export async function getRoomById(roomId: string) {
  return withFallback(
    () =>
      prisma.room.findUnique({
        where: { id: roomId },
        include: {
          game: true,
          members: {
            include: { user: true },
            orderBy: { joinedAt: "asc" }
          }
        }
      }),
    () => {
      const store = getMemoryStore()
      const room = store.rooms.get(roomId)
      if (!room) return null
      const game = store.games.get(room.gameId) || {
        id: room.gameId,
        name: "未知游戏",
        slug: "unknown"
      }
      const members = [...store.roomMembers.values()]
        .filter((item) => item.roomId === room.id)
        .sort((a, b) => a.joinedAt.getTime() - b.joinedAt.getTime())
        .map((item) => ({
          ...item,
          user:
            store.users.get(item.userId) || {
              id: item.userId,
              nickname: "玩家",
              authUserId: item.userId,
              authProvider: "local"
            }
        }))
      return { ...room, game, members }
    }
  )
}

export async function getRoomMessages(roomId: string, limit: number, cursor?: string) {
  return withFallback(
    async () => {
      const query: {
        where: { roomId: string }
        include: { sender: boolean }
        orderBy: { createdAt: "desc" }
        take: number
        cursor?: { id: string }
        skip?: number
      } = {
        where: { roomId },
        include: { sender: true },
        orderBy: { createdAt: "desc" },
        take: limit + 1
      }
      if (cursor) {
        query.cursor = { id: cursor }
        query.skip = 1
      }
      const items = await prisma.message.findMany(query)
      const hasMore = items.length > limit
      const sliced = hasMore ? items.slice(0, limit) : items
      const nextCursor = hasMore ? sliced[sliced.length - 1]?.id : null
      return {
        items: sliced.reverse(),
        nextCursor
      }
    },
    () => {
      const store = getMemoryStore()
      const all = [...store.messages.values()]
        .filter((item) => item.roomId === roomId)
        .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
      let startIndex = 0
      if (cursor) {
        const idx = all.findIndex((item) => item.id === cursor)
        startIndex = idx >= 0 ? idx + 1 : 0
      }
      const sliced = all.slice(startIndex, startIndex + limit)
      const nextCursor =
        startIndex + limit < all.length ? sliced[sliced.length - 1]?.id || null : null
      return {
        items: sliced.map((item) => ({
          ...item,
          sender:
            store.users.get(item.senderId) || {
              id: item.senderId,
              nickname: "玩家",
              authUserId: item.senderId,
              authProvider: "local"
            }
        })),
        nextCursor
      }
    }
  )
}

export async function createRoomMessage(args: {
  roomId: string
  senderId: string
  content: string
  messageType: "user" | "system"
}) {
  return withFallback(
    () =>
      prisma.message.create({
        data: args,
        include: { sender: true }
      }),
    () => {
      const store = getMemoryStore()
      const item = {
        id: crypto.randomUUID(),
        roomId: args.roomId,
        senderId: args.senderId,
        content: args.content,
        messageType: args.messageType,
        createdAt: new Date()
      }
      store.messages.set(item.id, item)
      return {
        ...item,
        sender:
          store.users.get(item.senderId) || {
            id: item.senderId,
            nickname: "玩家",
            authUserId: item.senderId,
            authProvider: "local"
          }
      }
    }
  )
}

export async function updateRoomMember(args: {
  roomId: string
  userId: string
  readyStatus?: boolean
  voiceStatus?: string
}) {
  return withFallback(
    () =>
      prisma.roomMember.update({
        where: {
          roomId_userId: {
            roomId: args.roomId,
            userId: args.userId
          }
        },
        data: {
          ...(typeof args.readyStatus === "boolean"
            ? { readyStatus: args.readyStatus }
            : {}),
          ...(args.voiceStatus ? { voiceStatus: args.voiceStatus } : {})
        }
      }),
    () => {
      const store = getMemoryStore()
      const target = [...store.roomMembers.values()].find(
        (item) => item.roomId === args.roomId && item.userId === args.userId
      )
      if (!target) {
        const created = {
          id: crypto.randomUUID(),
          roomId: args.roomId,
          userId: args.userId,
          readyStatus: args.readyStatus || false,
          voiceStatus: args.voiceStatus || "offline",
          joinedAt: new Date()
        }
        store.roomMembers.set(created.id, created)
        return created
      }
      const updated = {
        ...target,
        readyStatus:
          typeof args.readyStatus === "boolean" ? args.readyStatus : target.readyStatus,
        voiceStatus: args.voiceStatus || target.voiceStatus
      }
      store.roomMembers.set(updated.id, updated)
      return updated
    }
  )
}

export async function updateUserAvatarByCharacter(args: {
  userId: string
  character: string
  force?: boolean
}) {
  const avatarPath = getAvatarPathByCharacter(args.character)
  return withFallback(
    () => {
      if (args.force) {
        return prisma.user.updateMany({
          where: { id: args.userId },
          data: { avatarUrl: avatarPath }
        })
      }
      return prisma.user.updateMany({
        where: {
          id: args.userId,
          OR: [{ avatarUrl: null }, { avatarUrl: "/images/avatars/default.png" }]
        },
        data: { avatarUrl: avatarPath }
      })
    },
    () => {
      const store = getMemoryStore()
      const user = store.users.get(args.userId)
      if (!user) return null
      store.users.set(args.userId, {
        ...user,
        avatarUrl: avatarPath
      })
      return { id: args.userId, avatarUrl: avatarPath }
    }
  )
}
