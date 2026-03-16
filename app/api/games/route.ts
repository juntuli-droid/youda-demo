import { withApi } from "@/app/lib/server/http"
import { prisma } from "@/app/lib/server/prisma"

const defaultGames = ["英雄联盟", "王者荣耀", "无畏契约", "APEX", "永劫无间", "原神"]

export const GET = withApi(async () => {
  const count = await prisma.game.count()

  if (count === 0) {
    await prisma.game.createMany({
      data: defaultGames.map((name) => ({
        name,
        slug: name.toLowerCase().replace(/\s+/g, "-")
      }))
    })
  }

  const games = await prisma.game.findMany({
    orderBy: { name: "asc" }
  })

  return games
})
