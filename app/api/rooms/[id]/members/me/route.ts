import { withApi } from "@/app/lib/server/http"
import { requireUser } from "@/app/lib/server/auth"
import { roomMemberUpdateSchema } from "@/app/lib/server/contracts"
import { patchMyRoomMember } from "@/app/lib/server/services/roomService"

function getRoomId(url: string) {
  const parts = new URL(url).pathname.split("/")
  return parts[parts.length - 3]
}

export const PATCH = withApi(async ({ request }) => {
  const user = await requireUser(request)
  const payload = roomMemberUpdateSchema.parse(await request.json())

  return patchMyRoomMember({
    roomId: getRoomId(request.url),
    userId: user.id,
    readyStatus: payload.readyStatus,
    voiceStatus: payload.voiceStatus
  })
})
