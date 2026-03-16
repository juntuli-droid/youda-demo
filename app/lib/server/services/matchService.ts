import {
  createMatchAndRoom,
  ensureGameByName,
  getMatchRequestForUser
} from "../repositories/coreRepository"
import { badRequest, notFound } from "../errors"

export async function createMatchRequest(args: {
  userId: string
  gameName?: string
  gameId?: string
  ownStyle: string
  targetStyle: string
  teamSize: string
}) {
  let gameId = args.gameId

  if (!gameId) {
    if (!args.gameName) {
      throw badRequest("game 或 gameId 至少传一个")
    }
    const game = await ensureGameByName(args.gameName)
    gameId = game.id
  }
  const resolvedGameId = gameId as string

  const score = scoreByStyle(args.ownStyle, args.targetStyle)
  const { request, room } = await createMatchAndRoom({
    userId: args.userId,
    gameId: resolvedGameId,
    ownStyle: args.ownStyle,
    targetStyle: args.targetStyle,
    teamSize: args.teamSize,
    score
  })

  return {
    requestId: request.id,
    status: request.status,
    roomId: room.id
  }
}

export async function getMatchStatus(args: { userId: string; requestId: string }) {
  const request = await getMatchRequestForUser(args.requestId, args.userId)
  if (!request) {
    throw notFound("匹配请求不存在")
  }
  const results = request.results as Array<{
    id: string
    score: number
    status: string
    matchedUser: {
      id: string
      nickname: string
    }
  }>

  return {
    requestId: request.id,
    status: request.status,
    results: results.map((item) => ({
      id: item.id,
      score: item.score,
      status: item.status,
      matchedUser: {
        id: item.matchedUser.id,
        nickname: item.matchedUser.nickname
      }
    }))
  }
}

function scoreByStyle(ownStyle: string, targetStyle: string) {
  if (ownStyle === targetStyle) return 95
  if (ownStyle.includes("高沟通") && targetStyle.includes("高沟通")) return 88
  if (ownStyle.includes("认真") && targetStyle.includes("认真")) return 90
  return 80
}
