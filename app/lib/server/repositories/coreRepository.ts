import { MessageType, Prisma, RoomStatus } from "@prisma/client"
import { prisma } from "../prisma"

export async function getProfileByUserId(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    include: { personality: true }
  })
}

export async function getDashboardByUserId(userId: string) {
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
}

export async function replacePersonalityAnswers(args: {
  userId: string
  answers: Array<{ questionId: number; answerValue: string }>
}) {
  await prisma.$transaction([
    prisma.personalityAnswer.deleteMany({ where: { userId: args.userId } }),
    prisma.personalityAnswer.createMany({ data: args.answers.map((item) => ({ ...item, userId: args.userId })) })
  ])
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
  return prisma.gamePersonalityProfile.upsert({
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
  })
}

export async function ensureGameByName(name: string) {
  const slug = name.toLowerCase().replace(/\s+/g, "-")
  return prisma.game.upsert({
    where: { slug },
    update: { name },
    create: { name, slug }
  })
}

export async function createMatchAndRoom(args: {
  userId: string
  gameId: string
  ownStyle: string
  targetStyle: string
  teamSize: string
  score: number
}) {
  return prisma.$transaction(async (tx) => {
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
        status: RoomStatus.open
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
  })
}

export async function getMatchRequestForUser(requestId: string, userId: string) {
  return prisma.matchRequest.findFirst({
    where: { id: requestId, userId },
    include: {
      results: {
        orderBy: { score: "desc" },
        take: 5,
        include: { matchedUser: true }
      }
    }
  })
}

export async function getRoomById(roomId: string) {
  return prisma.room.findUnique({
    where: { id: roomId },
    include: {
      game: true,
      members: {
        include: { user: true },
        orderBy: { joinedAt: "asc" }
      }
    }
  })
}

export async function getRoomMessages(roomId: string, limit: number, cursor?: string) {
  const query: Prisma.MessageFindManyArgs = {
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
}

export async function createRoomMessage(args: {
  roomId: string
  senderId: string
  content: string
  messageType: MessageType
}) {
  return prisma.message.create({
    data: args,
    include: { sender: true }
  })
}

export async function updateRoomMember(args: {
  roomId: string
  userId: string
  readyStatus?: boolean
  voiceStatus?: string
}) {
  return prisma.roomMember.update({
    where: {
      roomId_userId: {
        roomId: args.roomId,
        userId: args.userId
      }
    },
    data: {
      ...(typeof args.readyStatus === "boolean" ? { readyStatus: args.readyStatus } : {}),
      ...(args.voiceStatus ? { voiceStatus: args.voiceStatus } : {})
    }
  })
}
