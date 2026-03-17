"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { apiRequest } from "../lib/client/api"

export default function MatchPage() {
  const router = useRouter()
  const [game, setGame] = useState("英雄联盟")
  const [myStyle, setMyStyle] = useState("认真冲分")
  const [targetStyle, setTargetStyle] = useState("高沟通配合")
  const [teamSize, setTeamSize] = useState("双排")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  const handleStartMatch = async () => {
    setSubmitting(true)
    setError("")

    const draft = {
      game,
      playStyle: myStyle,
      targetStyle,
      teamMode: teamSize,
      createdAt: new Date().toISOString()
    }

    try {
      const response = await apiRequest<{
        requestId: string
        status: string
        roomId: string
      }>("/api/match/request", {
        method: "POST",
        body: JSON.stringify({
          game,
          ownStyle: myStyle,
          targetStyle,
          teamSize
        })
      })

      localStorage.setItem("latestMatchDraft", JSON.stringify(draft))
      localStorage.setItem("latestMatchRequestId", response.requestId)
      localStorage.setItem("currentRoomId", response.roomId)
      router.push("/matching")
    } catch (requestError) {
      const message =
        requestError instanceof Error ? requestError.message : "匹配服务暂不可用"
      setError(message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div
      className="game-shell"
      style={{
        backgroundImage:
          "linear-gradient(rgba(14,26,37,0.76), rgba(14,26,37,0.88)), url('/assets/gameImages/background/bg-02.webp')",
        backgroundSize: "cover",
        backgroundPosition: "center"
      }}
    >
      <aside className="game-sidebar flex flex-col items-center py-6 space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-indigo-500 flex items-center justify-center text-lg font-bold">
          S
        </div>
      </aside>

      <main className="flex-1 flex items-center justify-center px-6 py-10">
        <div className="w-full max-w-3xl game-panel p-10">
          <div className="mb-10">
            <p className="text-sm text-indigo-300 mb-3">开始匹配</p>
            <h1 className="text-3xl font-bold mb-3">设置你的开黑条件</h1>
            <p className="text-gray-400">
              选择你想玩的游戏、你的风格，以及你希望匹配到什么样的搭子。
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <SelectCard
              label="选择游戏"
              value={game}
              options={["英雄联盟", "王者荣耀", "无畏契约", "APEX"]}
              onChange={setGame}
            />

            <SelectCard
              label="你的游戏风格"
              value={myStyle}
              options={["认真冲分", "轻松娱乐", "佛系随缘", "高沟通配合"]}
              onChange={setMyStyle}
            />

            <SelectCard
              label="想匹配到的风格"
              value={targetStyle}
              options={["认真冲分", "轻松娱乐", "高沟通配合", "情绪稳定"]}
              onChange={setTargetStyle}
            />

            <SelectCard
              label="想匹配几个队友"
              value={teamSize}
              options={["双排", "三排", "五排", "都可以"]}
              onChange={setTeamSize}
            />
          </div>

          <div className="mt-10">
            {error ? (
              <div className="mb-4 rounded-xl border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                {error}
              </div>
            ) : null}
            <button
              onClick={handleStartMatch}
              disabled={submitting}
              className="w-full py-5 neon-btn font-semibold text-xl hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? "🎮 匹配中..." : "🎮 开始匹配游戏搭子"}
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}

function SelectCard({
  label,
  value,
  options,
  onChange
}: {
  label: string
  value: string
  options: string[]
  onChange: (value: string) => void
}) {
  return (
    <div className="game-panel p-5">
      <p className="text-sm text-gray-400 mb-3">{label}</p>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="neon-input"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  )
}
