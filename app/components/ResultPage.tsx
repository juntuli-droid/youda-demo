"use client"

import { useMemo } from "react"
import { useRouter } from "next/navigation"
import { getPersonalityLabel, getPreferenceLabel, getStyleLabel } from "../lib/personalityEngine"
import {
  getAvatarFileByCharacter,
  getResultImagePathByCharacter
} from "../lib/gameCharacterAvatar"
import LazyGameImage from "./LazyGameImage"

type ResultData = {
  code: string
  style: string
  personality: string
  preference: string
  frequencyLabel: string
  title: string
  description: string
  character: string
  gamePersonality?: string
}

type ResultPageProps = {
  result: ResultData
  isRestarting: boolean
  onRetest: () => void
}

export default function ResultPage({
  result,
  isRestarting,
  onRetest
}: ResultPageProps) {
  const router = useRouter()
  const gamePersonality = result.gamePersonality || result.character
  const avatarFile = getAvatarFileByCharacter(gamePersonality)
  const portrait = getResultImagePathByCharacter(gamePersonality)

  const resultCards = useMemo(
    () => [
      { label: "游戏风格", value: getStyleLabel(result.style) },
      { label: "游戏性格", value: getPersonalityLabel(result.personality) },
      { label: "游戏偏好", value: getPreferenceLabel(result.preference) },
      { label: "活跃标签", value: result.frequencyLabel }
    ],
    [result]
  )
  const visualGuides = useMemo(
    () => [result.title, result.frequencyLabel, `代号 ${result.code}`],
    [result]
  )

  if (!avatarFile) {
    console.warn(`缺失人物映射: ${gamePersonality}`)
  }

  return (
    <div className="game-shell h-screen overflow-hidden">
      <aside className="game-sidebar hidden md:flex flex-col items-center py-6 space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-indigo-500 flex items-center justify-center text-lg font-bold">
          S
        </div>
      </aside>

      <main className="flex-1 h-screen overflow-hidden px-2 md:px-4 py-2 md:py-2 flex items-center justify-center">
        <div
          className={`w-full max-w-6xl game-panel result-master-panel motion-fade-in transition-all duration-300 ${isRestarting ? "opacity-60 scale-[0.99]" : "opacity-100 scale-100"}`}
        >
          <div className="result-layout-grid">
            <section className="result-hero-grid">
              <div className="result-copy-safe result-hero-copy game-panel">
                <p className="text-xs text-indigo-300 mb-2">人格结果</p>
                <h1 className="text-[22px] md:text-[26px] lg:text-[30px] leading-tight font-bold mb-2">
                  你的游戏人格是 {result.code}
                </h1>
                <p className="text-[14px] lg:text-[16px] font-semibold mb-2">
                  {result.title}
                </p>
                <p className="text-gray-300 text-[13px] lg:text-[14px] leading-7 line-clamp-3">
                  {result.description}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {visualGuides.map((item) => (
                    <span key={item} className="neon-chip">
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              <div
                className="result-hero-image game-panel"
                style={{
                  maxWidth: "min(400px, 100%)",
                  aspectRatio: "16 / 10",
                  overflow: "hidden"
                }}
              >
                <LazyGameImage
                  src={portrait}
                  fallbackSrc="/images/avatars/placeholder.png"
                  alt={`${gamePersonality} 角色形象`}
                  className="w-full h-full max-w-full max-h-full object-contain block"
                  width={880}
                  height={560}
                  priority
                  onFallback={() => {
                    console.warn(`人物图片缺失或加载失败: ${gamePersonality}`)
                  }}
                />
              </div>
            </section>

            <section className="result-metric-grid">
              {resultCards.map((item) => (
                <ResultMiniCard key={item.label} label={item.label} value={item.value} />
              ))}
            </section>

            <section className="result-bottom-grid min-h-0">
              <div className="game-panel p-3 md:p-4 min-h-0">
                <p className="text-xs md:text-sm text-gray-400 mb-1 text-center xl:text-left">人格记忆点</p>
                <p className="text-base md:text-lg font-semibold mb-1 text-center xl:text-left">{gamePersonality}</p>
                <p className="text-xs text-gray-400 leading-6 line-clamp-2 text-center xl:text-left">
                  这个称呼可以帮助你快速记住自己的游戏风格，也方便后续匹配时更直观地表达自己。
                </p>
              </div>

              <div className="result-actions-grid">
                <button
                  onClick={onRetest}
                  disabled={isRestarting}
                  className="result-cta-btn neon-outline-btn disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isRestarting ? "重置中..." : "重新测试"}
                </button>
                <button
                  onClick={() => router.push("/profile")}
                  className="result-cta-btn neon-btn"
                >
                  进入我的游戏主页
                </button>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  )
}

function ResultMiniCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="game-panel p-3 min-h-[96px] flex items-center justify-center text-center">
      <div className="w-full">
        <p className="hud-label mb-1 text-center">{label}</p>
        <p className="text-[14px] md:text-[15px] leading-6 font-semibold text-white text-center">
          {value}
        </p>
      </div>
    </div>
  )
}
