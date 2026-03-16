import { withApi } from "@/app/lib/server/http"
import { requireUser } from "@/app/lib/server/auth"
import { getRoomDetail } from "@/app/lib/server/services/roomService"

export const GET = withApi(async ({ request }) => {
  const user = await requireUser(request)
  const parts = new URL(request.url).pathname.split("/")
  const roomId = parts[parts.length - 1]

  return getRoomDetail({
    roomId,
    userId: user.id
  })
})
