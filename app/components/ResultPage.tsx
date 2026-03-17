"use client"

import { useMemo } from "react"
import { useRouter } from "next/navigation"
import { getPersonalityLabel, getPreferenceLabel, getStyleLabel } from "../lib/personalityEngine"
import { getAvatarFileByCharacter, getAvatarPathByCharacter } from "../lib/gameCharacterAvatar"
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
  const avatarFile = getAvatarFileByCharacter(result.character)
  const portrait = getAvatarPathByCharacter(result.character)

  const resultCards = useMemo(
    () => [
      { label: "游戏风格", value: getStyleLabel(result.style) },
      { label: "游戏性格", value: getPersonalityLabel(result.personality) },
      { label: "游戏偏好", value: getPreferenceLabel(result.preference) },
      { label: "活跃标签", value: result.frequencyLabel }
    ],
    [result]
  )

  if (!avatarFile) {
    console.warn(`缺失人物映射: ${result.character}`)
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
          className={`w-full max-w-6xl game-panel p-2 md:p-4 motion-fade-in transition-all duration-300 ${isRestarting ? "opacity-60 scale-[0.99]" : "opacity-100 scale-100"}`}
        >
          <div className="grid gap-2 md:gap-4">
            <div className="grid xl:grid-cols-[1.1fr_0.9fr] gap-2 md:gap-4 items-center">
              <section className="min-h-0">
                <p className="text-xs text-indigo-300 mb-1">人格结果</p>
                <h1 className="text-[20px] md:text-[24px] lg:text-[28px] leading-tight font-bold mb-1">
                  你的游戏人格是 {result.code}
                </h1>
                <p className="text-[14px] lg:text-[15px] font-semibold mb-1">
                  {result.title}
                </p>
                <p className="text-gray-300 text-[13px] lg:text-[14px] leading-6 pr-0 xl:pr-4 line-clamp-3">
                  {result.description}
                </p>
              </section>

              <section className="rounded-2xl border border-[rgba(123,153,214,0.16)] overflow-hidden bg-[rgba(17,24,38,0.45)] min-h-[136px] md:min-h-[176px]">
                <LazyGameImage
                  src={portrait}
                  fallbackSrc="/images/avatars/placeholder.png"
                  alt={`${result.character} 角色形象`}
                  className="w-full h-[132px] md:h-[176px] lg:h-[200px] object-contain"
                  width={880}
                  height={560}
                  priority
                  onFallback={() => {
                    console.warn(`人物图片缺失或加载失败: ${result.character}`)
                  }}
                />
              </section>
            </div>

            <div className="grid grid-cols-2 xl:grid-cols-4 gap-2 md:gap-4">
              {resultCards.map((item) => (
                <ResultMiniCard key={item.label} label={item.label} value={item.value} />
              ))}
            </div>

            <div className="grid xl:grid-cols-[1fr_208px] gap-2 md:gap-4 items-center min-h-0">
              <div className="game-panel p-2 md:p-4 min-h-0">
                <p className="text-xs md:text-sm text-gray-400 mb-1">人格记忆点</p>
                <p className="text-base md:text-lg font-semibold mb-1">{result.character}</p>
                <p className="text-xs text-gray-400 leading-6 line-clamp-2">
                  这个称呼可以帮助你快速记住自己的游戏风格，也方便后续匹配时更直观地表达自己。
                </p>
              </div>

              <div className="grid grid-cols-2 xl:grid-cols-1 gap-2 md:gap-4">
                <button
                  onClick={onRetest}
                  disabled={isRestarting}
                  className="h-10 md:h-11 px-3 md:px-4 font-semibold text-sm md:text-[15px] neon-outline-btn disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isRestarting ? "重置中..." : "重新测试"}
                </button>
                <button
                  onClick={() => router.push("/profile")}
                  className="h-10 md:h-11 px-3 md:px-4 font-semibold text-sm md:text-[15px] neon-btn"
                >
                  进入我的游戏主页
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

function ResultMiniCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="game-panel p-2 md:p-3 min-h-[88px] flex flex-col justify-between">
      <div>
        <p className="hud-label mb-1">{label}</p>
        <p className="text-[14px] md:text-[15px] leading-6 font-semibold text-white">
          {value}
        </p>
      </div>
    </div>
  )
}
