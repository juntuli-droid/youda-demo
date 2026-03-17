"use client"

import Image from "next/image"
import type { BadgeItem } from "../lib/badgeTypes"

type BadgeRailProps = {
  badges: BadgeItem[]
  canManage: boolean
  onAdd: () => void
  onEdit: (badge: BadgeItem) => void
}

export default function BadgeRail({ badges, canManage, onAdd, onEdit }: BadgeRailProps) {
  if (badges.length === 0) {
    return (
      <div className="game-panel p-4">
        <div className="h-[96px] rounded-2xl border border-[rgba(117,138,178,0.24)] bg-[rgba(32,45,70,0.45)] flex items-center justify-center gap-3">
          <Image
            src="/images/avatars/placeholder.png"
            alt="暂无标签"
            width={48}
            height={48}
            className="rounded-xl"
          />
          <div className="text-sm text-gray-300">暂无标签，去添加</div>
          <button
            onClick={onAdd}
            className={`${canManage ? "neon-btn" : "neon-outline-btn"} px-3 py-2 text-sm`}
          >
            {canManage ? "+ 添加标签/奖牌" : "+ 登录后添加"}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="game-panel p-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm text-indigo-300">标签 / 奖牌</p>
        <button
          onClick={onAdd}
          className={`${canManage ? "neon-outline-btn" : "neon-outline-btn opacity-90"} px-3 py-1.5 text-sm`}
        >
          {canManage ? "+ 添加标签/奖牌" : "+ 登录后添加"}
        </button>
      </div>
      <div className="overflow-x-auto">
        <div className="flex gap-3 min-w-max pr-2">
          {badges.map((badge) => (
            <button
              key={badge.id}
              onClick={() => (canManage ? onEdit(badge) : undefined)}
              title={
                badge.type === "auto"
                  ? `来自游戏生涯·${badge.game || ""}-${badge.rank || ""}`
                  : "手动添加"
              }
              className="w-[188px] shrink-0 rounded-2xl border border-[rgba(117,138,178,0.24)] bg-[rgba(32,45,70,0.45)] px-3 py-3 text-left hover:scale-[1.02] transition"
            >
              <div className="flex items-center gap-2">
                <Image
                  src={badge.iconUrl}
                  alt={badge.name}
                  width={32}
                  height={32}
                  className="rounded-lg"
                  placeholder={badge.blurDataURL ? "blur" : undefined}
                  blurDataURL={badge.blurDataURL}
                />
                <div className="flex-1">
                  <p className="text-xs text-gray-300 whitespace-normal break-words leading-5">
                    {badge.name}
                  </p>
                  <p className="text-[10px] text-gray-400 mt-0.5">
                    {badge.type === "auto" ? "自动" : "手动"}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
