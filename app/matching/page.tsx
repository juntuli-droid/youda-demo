"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { apiRequest } from "../lib/client/api"

type MatchDraft = {
  game: string
  playStyle: string
  targetStyle: string
  teamMode: string
  createdAt: string
}

export default function MatchingPage() {
  const router = useRouter()
  const [matchDraft, setMatchDraft] = useState<MatchDraft | null>(null)
  const [error, setError] = useState("")

  useEffect(() => {
    const raw = localStorage.getItem("latestMatchDraft")
    if (raw) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setMatchDraft(JSON.parse(raw))
    }

    const requestId = localStorage.getItem("latestMatchRequestId")
    if (!requestId) {
      setError("匹配请求不存在，请返回重新发起匹配")
      return
    }

    let cancelled = false
    let attempts = 0
    const maxAttempts = 12

    const poll = async () => {
      if (cancelled) return
      attempts += 1

      try {
        await apiRequest<{
          requestId: string
          status: string
        }>(`/api/match/request/${requestId}`)

        router.push("/room")
        return
      } catch {
        if (attempts >= maxAttempts) {
          setError("匹配超时，请稍后重试")
          return
        }
      }

      setTimeout(poll, 1000)
    }

    const timer = setTimeout(poll, 1200)

    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [router])

  return (
    <div
      className="game-shell"
      style={{
        backgroundImage:
          "linear-gradient(rgba(14,26,37,0.78), rgba(14,26,37,0.9)), url('/assets/gameImages/background/bg-03.webp')",
        backgroundSize: "cover",
        backgroundPosition: "center"
      }}
    >
      <aside className="game-sidebar flex flex-col items-center py-6 space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-indigo-500 flex items-center justify-center text-lg font-bold">
          S
        </div>
      </aside>

      <main className="flex-1 flex items-center justify-center px-6">
        <div className="w-full max-w-xl game-panel p-12 text-center">
          <div className="w-20 h-20 mx-auto rounded-full border-4 border-indigo-500 border-t-transparent animate-spin mb-8" />

          <p className="text-sm text-indigo-300 mb-3">匹配中</p>
          <h1 className="text-3xl font-bold mb-4">正在为你寻找节奏一致的搭子</h1>
          <p className="text-gray-400 leading-7 mb-8">
            我们正在根据你的游戏、风格偏好和队伍人数，寻找更合拍的队友。
          </p>

          {error ? (
            <div className="mb-8 rounded-xl border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {error}
            </div>
          ) : null}

          <div className="grid grid-cols-3 gap-4 text-sm">
            <InfoBox label="当前游戏" value={matchDraft?.game || "英雄联盟"} />
            <InfoBox label="匹配人数" value={matchDraft?.teamMode || "双排"} />
            <InfoBox label="目标风格" value={matchDraft?.targetStyle || "高沟通配合"} />
          </div>
        </div>
      </main>
    </div>
  )
}

function InfoBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="game-panel py-5 px-3">
      <p className="text-gray-400 mb-2">{label}</p>
      <p className="font-semibold">{value}</p>
    </div>
  )
}
