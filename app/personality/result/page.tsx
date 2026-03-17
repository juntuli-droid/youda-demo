"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  calculatePersonality,
  getFrequencyLabel,
  getPersonalityMeta,
  getCharacterByBaseCode
} from "../../lib/personalityEngine"
import ResultPage from "../../components/ResultPage"
import { saveAvatarProfile } from "../../lib/avatarProfile"
import { getAvatarPathByCharacter } from "../../lib/gameCharacterAvatar"

type ResultData = ReturnType<typeof calculatePersonality> &
  ReturnType<typeof getPersonalityMeta> & {
    frequencyLabel: string
  }

export default function PersonalityResultPage() {
  const router = useRouter()
  const [result, setResult] = useState<ResultData | null>(null)
  const [isRestarting, setIsRestarting] = useState(false)

  useEffect(() => {
    const raw = localStorage.getItem("personalityScores")
    const metaRaw = localStorage.getItem("personalityResultMeta")
    const currentSessionId = localStorage.getItem("demoSessionId")

    if (!raw || !metaRaw || !currentSessionId) return

    const meta = JSON.parse(metaRaw) as {
      sessionId: string
      updatedAt: string
    }

    if (meta.sessionId !== currentSessionId) return

    const scores = JSON.parse(raw) as Record<string, number>
    const personality = calculatePersonality(scores)
    const metaInfo = getPersonalityMeta(personality.code)
    const frequencyLabel = getFrequencyLabel(personality.frequency)
    const character = getCharacterByBaseCode(personality.baseCode)

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setResult({
      ...personality,
      ...metaInfo,
      frequencyLabel,
      character
    })
    saveAvatarProfile({ src: getAvatarPathByCharacter(character) })
  }, [])

  if (!result) {
    return (
      <div className="game-shell">
        <aside className="game-sidebar flex flex-col items-center py-6">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500 flex items-center justify-center text-lg font-bold">
            S
          </div>
        </aside>

        <main className="flex-1 flex items-center justify-center px-6 py-10">
          <div className="w-full max-w-md game-panel p-8 text-center motion-fade-in">
            <p className="text-sm text-indigo-300 mb-3">人格结果</p>
            <h1 className="text-2xl font-bold mb-4">还没有本轮测试结果</h1>
            <p className="text-gray-400 leading-7 mb-8">
              你可能刚刚开启了一轮新的 Demo。请先重新完成测试，再生成这次的人格结果。
            </p>

            <button
              onClick={() => router.push("/personality")}
              className="w-full py-4 font-semibold text-lg neon-btn"
            >
              去做测试
            </button>
          </div>
        </main>
      </div>
    )
  }
  const handleRetest = async () => {
    if (isRestarting) return
    setIsRestarting(true)
    localStorage.removeItem("personalityScores")
    localStorage.removeItem("personalityResultMeta")
    localStorage.removeItem("latestMatchDraft")
    localStorage.removeItem("latestMatchRequestId")
    localStorage.removeItem("currentRoomId")
    await new Promise((resolve) => setTimeout(resolve, 260))
    router.replace("/personality/questions")
  }

  return <ResultPage result={result} isRestarting={isRestarting} onRetest={handleRetest} />
}
