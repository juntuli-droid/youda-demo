"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  calculatePersonality,
  getFrequencyLabel,
  getPersonalityLabel,
  getPersonalityMeta,
  getPreferenceLabel,
  getStyleLabel
} from "../../lib/personalityEngine"
import {
  withCatalogAsset
} from "../../lib/personalityAssets"
import LazyGameImage from "../../components/LazyGameImage"
import { loadAssetCatalog } from "../../lib/assetCatalogClient"

type ResultData = ReturnType<typeof calculatePersonality> &
  ReturnType<typeof getPersonalityMeta> & {
    frequencyLabel: string
  }

type ResultMiniCardProps = {
  label: string
  value: string
}

export default function PersonalityResultPage() {
  const router = useRouter()
  const [result, setResult] = useState<ResultData | null>(null)
  const [catalogAsset, setCatalogAsset] = useState<{
    portrait: string
    avatar: string
    banner: string
  } | null>(null)

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

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setResult({
      ...personality,
      ...metaInfo,
      frequencyLabel
    })

    const prefix = personality.code.split("-")[0]
    loadAssetCatalog().then((catalog) => {
      if (catalog?.assets[prefix]) {
        setCatalogAsset(catalog.assets[prefix])
      }
    })
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
  const visual = withCatalogAsset(result.code, catalogAsset || undefined)

  return (
    <div className="game-shell">
      <aside className="game-sidebar flex flex-col items-center py-6 space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-indigo-500 flex items-center justify-center text-lg font-bold">
          S
        </div>
      </aside>

      <main className="flex-1 flex items-center justify-center px-6 py-10">
        <div className="w-full max-w-4xl game-panel p-8 md:p-10 motion-fade-in">
          <div className="mb-8">
            <p className="text-sm text-indigo-300 mb-3">人格结果</p>

            <h1 className="text-[30px] md:text-[34px] leading-tight font-bold mb-3">
              你的游戏人格是 {result.code}
            </h1>

            <p className="text-[18px] md:text-[20px] font-semibold mb-4">
              {result.title}
            </p>

            <p className="text-gray-400 text-base leading-8">
              {result.description}
            </p>
          </div>

          <div className="mb-6 rounded-3xl border border-[rgba(123,153,214,0.22)] overflow-hidden">
            <LazyGameImage
              src={visual.portrait}
              fallbackSrc="/assets/personality/default-portrait.svg"
              alt={`${visual.title} 角色形象`}
              className="w-full h-[280px] object-cover"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <ResultMiniCard
              label="游戏风格"
              value={getStyleLabel(result.style)}
            />
            <ResultMiniCard
              label="游戏性格"
              value={getPersonalityLabel(result.personality)}
            />
            <ResultMiniCard
              label="游戏偏好"
              value={getPreferenceLabel(result.preference)}
            />
            <ResultMiniCard
              label="活跃标签"
              value={result.frequencyLabel}
            />
          </div>

          <div className="game-panel p-6 mb-8">
            <p className="text-sm text-gray-400 mb-3">人格记忆点</p>
            <p className="text-2xl font-semibold mb-3">{result.character}</p>
            <p className="text-sm text-gray-400 leading-8">
              这个称呼可以帮助你快速记住自己的游戏风格，也方便后续匹配时更直观地表达自己。
            </p>
          </div>

          <button
            onClick={() => router.push("/profile")}
            className="w-full py-4 font-semibold text-xl neon-btn"
          >
            进入我的游戏主页
          </button>
        </div>
      </main>
    </div>
  )
}

function ResultMiniCard({ label, value }: ResultMiniCardProps) {
  return (
    <div className="game-panel p-5 min-h-[124px] flex flex-col justify-between">
      <div>
        <p className="hud-label mb-3">{label}</p>
        <p className="text-[17px] leading-8 font-semibold text-white">
          {value}
        </p>
      </div>
    </div>
  )
}
