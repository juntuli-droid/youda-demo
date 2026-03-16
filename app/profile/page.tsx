"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import {
  calculatePersonality,
  getFrequencyLabel,
  getPersonalityLabel,
  getPersonalityMeta,
  getPreferenceLabel,
  getStyleLabel
} from "../lib/personalityEngine"

type ProfileResult = ReturnType<typeof calculatePersonality> &
  ReturnType<typeof getPersonalityMeta> & {
    frequencyLabel: string
  }

type CareerItem = {
  id: string
  game: string
  rank: string
  duration: string
  achievement: string
  note: string
  createdAt: string
}

type VlogItem = {
  id: string
  date: string
  partnersCount: string
  duration: string
  game: string
  summary: string
  createdAt: string
}

export default function ProfilePage() {
  const router = useRouter()
  const [result, setResult] = useState<ProfileResult | null>(null)
  const [careerList, setCareerList] = useState<CareerItem[]>([])
  const [vlogList, setVlogList] = useState<VlogItem[]>([])

  useEffect(() => {
    const raw = localStorage.getItem("personalityScores")
    const metaRaw = localStorage.getItem("personalityResultMeta")
    const currentSessionId = localStorage.getItem("demoSessionId")

    if (raw && metaRaw && currentSessionId) {
      const meta = JSON.parse(metaRaw) as {
        sessionId: string
        updatedAt: string
      }

      if (meta.sessionId === currentSessionId) {
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
      } else {
        setResult(null)
      }
    } else {
      setResult(null)
    }

    const rawCareer = localStorage.getItem("gameCareerRecords")
    const rawVlog = localStorage.getItem("gameVlogRecords")

    if (rawCareer) {
      setCareerList(JSON.parse(rawCareer))
    }

    if (rawVlog) {
      setVlogList(JSON.parse(rawVlog))
    }
  }, [])

  const latestCareer = useMemo(() => careerList[0], [careerList])
  const latestVlog = useMemo(() => vlogList[0], [vlogList])

  const topGames = useMemo(() => {
    const counter = new Map<string, number>()

    careerList.forEach((item) => {
      const game = item.game?.trim()
      if (!game) return
      counter.set(game, (counter.get(game) || 0) + 1)
    })

    return [...counter.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([game]) => game)
  }, [careerList])

  if (!result) {
    return (
      <div className="min-h-screen bg-[#1e2124] text-white flex">
        <aside className="w-20 bg-[#17191c] flex flex-col items-center py-6">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500 flex items-center justify-center text-lg font-bold">
            S
          </div>
        </aside>

        <main className="flex-1 flex items-center justify-center px-6 py-10">
          <div className="w-full max-w-md bg-[#2b2f33] rounded-3xl shadow-2xl p-8 text-center">
            <p className="text-sm text-indigo-300 mb-3">我的主页</p>
            <h1 className="text-2xl font-bold mb-4">还没有本轮人格信息</h1>
            <p className="text-gray-400 leading-7 mb-8">
              你可能开启了一轮新的 Demo。先重新完成测试，再生成这次的专属主页。
            </p>
            <button
              onClick={() => router.push("/personality")}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-500 font-semibold text-lg hover:opacity-90 transition"
            >
              去做测试
            </button>
          </div>
        </main>
      </div>
    )
  }

  const displayCharacter = result.character || "未命名人格"
  const displayInitial = displayCharacter.slice(0, 1)

  return (
    <div className="min-h-screen bg-[#1e2124] text-white flex">
      <aside className="w-20 bg-[#17191c] flex flex-col items-center py-6 space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-indigo-500 flex items-center justify-center text-lg font-bold">
          S
        </div>
      </aside>

      <main className="flex-1 px-6 py-10">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="bg-[#2b2f33] rounded-3xl shadow-2xl p-8 md:p-10">
            <p className="text-sm text-indigo-300 mb-3">我的游戏主页</p>

            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8">
              <div className="flex-1">
                <div className="flex items-center gap-5 mb-6">
                  <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-3xl font-bold shadow-lg">
                    {displayInitial}
                  </div>

                  <div>
                    <h1 className="text-[30px] md:text-[36px] font-bold leading-tight">
                      {displayCharacter}
                    </h1>
                    <p className="text-gray-400 mt-1">
                      {result.code} · {result.title}
                    </p>
                  </div>
                </div>

                <p className="text-gray-300 leading-8 text-base md:text-lg max-w-3xl">
                  {result.description}
                </p>
              </div>

              <div className="lg:w-[320px] grid grid-cols-2 gap-3">
                <TagCard label="游戏风格" value={getStyleLabel(result.style)} />
                <TagCard
                  label="游戏性格"
                  value={getPersonalityLabel(result.personality)}
                />
                <TagCard
                  label="游戏偏好"
                  value={getPreferenceLabel(result.preference)}
                />
                <TagCard label="活跃标签" value={result.frequencyLabel} />
              </div>
            </div>
          </div>

          <div className="grid xl:grid-cols-[1.4fr_0.9fr] gap-6">
            <div className="space-y-6">
              <div className="bg-[#2b2f33] rounded-3xl shadow-2xl p-8">
                <div className="flex items-center justify-between gap-4 mb-6">
                  <div>
                    <p className="text-sm text-indigo-300 mb-2">开始行动</p>
                    <h2 className="text-2xl font-bold">选择你的下一步</h2>
                  </div>
                </div>

                <div className="space-y-4">
                  <button
                    onClick={() => router.push("/match")}
                    className="w-full py-5 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-500 font-semibold text-xl hover:opacity-90 transition"
                  >
                    🎮 进入匹配我的游戏搭子
                  </button>

                  <div className="grid md:grid-cols-2 gap-4">
                    <button
                      onClick={() => router.push("/career")}
                      className="w-full py-4 rounded-2xl bg-[#363b42] border border-[#4a515b] font-semibold text-lg hover:bg-[#3c4148] transition"
                    >
                      🏆 进入我的游戏生涯
                    </button>

                    <button
                      onClick={() => router.push("/vlog")}
                      className="w-full py-4 rounded-2xl bg-[#363b42] border border-[#4a515b] font-semibold text-lg hover:bg-[#3c4148] transition"
                    >
                      📹 查看我的游戏 Vlog
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-[#2b2f33] rounded-3xl shadow-2xl p-8">
                <p className="text-sm text-indigo-300 mb-3">人格亮点</p>
                <h2 className="text-2xl font-bold mb-4">你适合怎样的搭子关系？</h2>
                <p className="text-gray-300 leading-8 mb-6">
                  你的游戏人格更适合节奏稳定、沟通清晰、目标一致的队友关系。你在匹配中会更在意
                  回应速度、配合效率和持续上线的可能性，因此适合建立长期搭子，而不只是临时路人局。
                </p>

                <div className="grid md:grid-cols-3 gap-4">
                  <InfoBlock
                    title="理想搭子"
                    content="高响应、愿意沟通、目标一致"
                  />
                  <InfoBlock
                    title="适合场景"
                    content="双排冲分、固定开黑、默契配合"
                  />
                  <InfoBlock
                    title="匹配关键词"
                    content="高频玩家 / 沟通配合 / 情绪稳定"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-[#2b2f33] rounded-3xl shadow-2xl p-6">
                <p className="text-sm text-indigo-300 mb-4">数据概览</p>
                <div className="grid grid-cols-2 gap-4">
                  <StatCard label="人格代号" value={result.code} />
                  <StatCard label="人格记忆点" value={result.character} />
                  <StatCard label="生涯记录" value={`${careerList.length} 条`} />
                  <StatCard label="Vlog 日志" value={`${vlogList.length} 条`} />
                </div>
              </div>

              <div className="bg-[#2b2f33] rounded-3xl shadow-2xl p-6">
                <p className="text-sm text-indigo-300 mb-4">常玩游戏</p>

                {topGames.length > 0 ? (
                  <>
                    <p className="text-gray-300 leading-7 mb-4">
                      常玩：{topGames.join(" / ")}
                    </p>
                    <div className="flex flex-wrap gap-3">
                      {topGames.map((game) => (
                        <span
                          key={game}
                          className="px-4 py-2 rounded-2xl bg-[#363b42] border border-[#4a515b] text-sm font-medium"
                        >
                          {game}
                        </span>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="bg-[#363b42] rounded-2xl p-4 text-gray-400 leading-7">
                    你还没有足够的生涯记录，先去补充几条游戏生涯，主页会自动生成你的常玩游戏。
                  </div>
                )}
              </div>

              <div className="bg-[#2b2f33] rounded-3xl shadow-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm text-indigo-300">最近游戏生涯</p>
                  <button
                    onClick={() => router.push("/career")}
                    className="text-sm text-indigo-300 hover:text-indigo-200 transition"
                  >
                    查看全部
                  </button>
                </div>

                {latestCareer ? (
                  <div className="bg-[#363b42] rounded-2xl p-5">
                    <p className="text-xl font-semibold mb-2">{latestCareer.game}</p>
                    <p className="text-gray-300 mb-2">段位：{latestCareer.rank}</p>
                    <p className="text-gray-300 mb-2">时长：{latestCareer.duration}</p>
                    <p className="text-gray-400 leading-7">
                      成就：{latestCareer.achievement || "暂无填写"}
                    </p>
                  </div>
                ) : (
                  <EmptyCard text="你还没有添加游戏生涯记录，先去补充你的段位、时长和成就吧。" />
                )}
              </div>

              <div className="bg-[#2b2f33] rounded-3xl shadow-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm text-indigo-300">最近游戏 Vlog</p>
                  <button
                    onClick={() => router.push("/vlog")}
                    className="text-sm text-indigo-300 hover:text-indigo-200 transition"
                  >
                    查看全部
                  </button>
                </div>

                {latestVlog ? (
                  <div className="bg-[#363b42] rounded-2xl p-5">
                    <p className="text-xl font-semibold mb-2">{latestVlog.game}</p>
                    <p className="text-gray-300 mb-2">日期：{latestVlog.date}</p>
                    <p className="text-gray-300 mb-2">
                      匹配到 {latestVlog.partnersCount} 个搭子 · 玩了 {latestVlog.duration}
                    </p>
                    <p className="text-gray-400 leading-7">
                      {latestVlog.summary || "今天的对局还没有写总结。"}
                    </p>
                  </div>
                ) : (
                  <EmptyCard text="你还没有记录游戏 Vlog，之后每次开黑都可以在这里留下今天的战绩故事。" />
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

function TagCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-[#363b42] rounded-2xl p-4 min-h-[108px]">
      <p className="text-sm text-gray-400 mb-3">{label}</p>
      <p className="text-[16px] leading-7 font-semibold">{value}</p>
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-[#363b42] rounded-2xl p-4">
      <p className="text-sm text-gray-400 mb-2">{label}</p>
      <p className="text-lg font-semibold">{value}</p>
    </div>
  )
}

function InfoBlock({ title, content }: { title: string; content: string }) {
  return (
    <div className="bg-[#363b42] rounded-2xl p-5">
      <p className="text-sm text-gray-400 mb-3">{title}</p>
      <p className="text-white font-semibold leading-7">{content}</p>
    </div>
  )
}

function EmptyCard({ text }: { text: string }) {
  return (
    <div className="bg-[#363b42] rounded-2xl p-5">
      <p className="text-gray-400 leading-7">{text}</p>
    </div>
  )
}