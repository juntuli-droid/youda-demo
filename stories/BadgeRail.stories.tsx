import React from "react"
import BadgeRail from "../app/components/BadgeRail"

const meta = {
  title: "Profile/BadgeRail",
  component: BadgeRail
}
export default meta

const badges = [
  {
    id: "1",
    name: "英雄联盟-钻石",
    description: "来自游戏生涯·英雄联盟-钻石",
    iconUrl: "/assets/gameImages/icon/icon-04.webp",
    type: "auto" as const,
    game: "英雄联盟",
    rank: "钻石",
    createdAt: "2026-01-01T00:00:00.000Z"
  },
  {
    id: "2",
    name: "原神-深渊12层满星",
    description: "手动添加",
    iconUrl: "/assets/gameImages/icon/icon-03.webp",
    type: "manual" as const,
    createdAt: "2026-01-02T00:00:00.000Z"
  }
]

export const Default = () => (
  <div style={{ padding: 24, background: "#0e1a25" }}>
    <BadgeRail badges={badges} canManage onAdd={() => {}} onEdit={() => {}} />
  </div>
)
