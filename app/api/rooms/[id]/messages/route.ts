import { withApi } from "@/app/lib/server/http"
import { requireUser } from "@/app/lib/server/auth"
import { roomMessageCreateSchema } from "@/app/lib/server/contracts"
import { listRoomMessages, sendRoomMessage } from "@/app/lib/server/services/roomService"

function getRoomId(url: string) {
  const parts = new URL(url).pathname.split("/")
  return parts[parts.length - 2]
}

export const GET = withApi(async ({ request }) => {
  const user = await requireUser(request)
  const url = new URL(request.url)
  const limit = Number(url.searchParams.get("limit") || 20)
  const cursor = url.searchParams.get("cursor") || undefined

  return listRoomMessages({
    roomId: getRoomId(request.url),
    userId: user.id,
    cursor,
    limit: Number.isNaN(limit) ? 20 : Math.min(Math.max(limit, 1), 100)
  })
})

export const POST = withApi(async ({ request }) => {
  const user = await requireUser(request)
  const payload = roomMessageCreateSchema.parse(await request.json())

  return sendRoomMessage({
    roomId: getRoomId(request.url),
    userId: user.id,
    content: payload.content,
    type: payload.type
  })
})
