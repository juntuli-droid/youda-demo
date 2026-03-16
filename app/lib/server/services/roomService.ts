import { MessageType } from "@prisma/client"
import { forbidden, notFound } from "../errors"
import {
  createRoomMessage,
  getRoomById,
  getRoomMessages,
  updateRoomMember
} from "../repositories/coreRepository"

export async function getRoomDetail(args: { roomId: string; userId: string }) {
  const room = await getRoomById(args.roomId)
  if (!room) {
    throw notFound("房间不存在")
  }

  const me = room.members.find((item) => item.userId === args.userId)
  if (!me) {
    throw forbidden()
  }

  return {
    room: {
      id: room.id,
      status: room.status,
      roomType: room.roomType,
      game: {
        id: room.game.id,
        name: room.game.name
      }
    },
    members: room.members.map((item) => ({
      userId: item.userId,
      nickname: item.user.nickname,
      readyStatus: item.readyStatus,
      voiceStatus: item.voiceStatus,
      joinedAt: item.joinedAt
    }))
  }
}

export async function listRoomMessages(args: {
  roomId: string
  userId: string
  cursor?: string
  limit: number
}) {
  await assertRoomMember(args.roomId, args.userId)
  return getRoomMessages(args.roomId, args.limit, args.cursor)
}

export async function sendRoomMessage(args: {
  roomId: string
  userId: string
  content: string
  type?: "user" | "system"
}) {
  await assertRoomMember(args.roomId, args.userId)

  return createRoomMessage({
    roomId: args.roomId,
    senderId: args.userId,
    content: args.content,
    messageType: (args.type || "user") as MessageType
  })
}

export async function patchMyRoomMember(args: {
  roomId: string
  userId: string
  readyStatus?: boolean
  voiceStatus?: string
}) {
  await assertRoomMember(args.roomId, args.userId)

  return updateRoomMember({
    roomId: args.roomId,
    userId: args.userId,
    readyStatus: args.readyStatus,
    voiceStatus: args.voiceStatus
  })
}

async function assertRoomMember(roomId: string, userId: string) {
  const room = await getRoomById(roomId)
  if (!room) throw notFound("房间不存在")
  const member = room.members.find((item) => item.userId === userId)
  if (!member) throw forbidden("你不在该房间成员列表中")
}
