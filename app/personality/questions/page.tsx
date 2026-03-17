"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { questions } from "../../data/personalityQuestions"
import type {
  Question,
  QuestionCategory,
  QuestionOption
} from "../../data/personalityQuestions"
import { ensureDemoSession } from "../../lib/demoSession"

type AnswerButtonProps = {
  label: string
  onClick: () => void
}

const SELECTION_PLAN: Record<QuestionCategory, number> = {
  style: 5,
  personality: 4,
  preference: 4,
  frequency: 3
}

function shuffleArray<T>(list: T[]): T[] {
  const arr = [...list]
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

function pickQuestionsByCategory(
  allQuestions: Question[],
  plan: Record<QuestionCategory, number>
): Question[] {
  const selected: Question[] = []

  ;(Object.keys(plan) as QuestionCategory[]).forEach((category) => {
    const categoryQuestions = allQuestions.filter(
      (q) => q.category === category
    )
    const picked = shuffleArray(categoryQuestions).slice(0, plan[category])
    selected.push(...picked)
  })

  return shuffleArray(selected)
}

export default function PersonalityQuestionsPage() {
  const router = useRouter()

  useEffect(() => {
    ensureDemoSession()
  }, [])

  const quizQuestions = useMemo(() => {
    return pickQuestionsByCategory(questions, SELECTION_PLAN)
  }, [])

  const [currentIndex, setCurrentIndex] = useState(0)
  const [scores, setScores] = useState<Record<string, number>>({})

  const currentQuestion = quizQuestions[currentIndex]
  const progress =
    quizQuestions.length > 0
      ? ((currentIndex + 1) / quizQuestions.length) * 100
      : 0

  function handleAnswer(option: QuestionOption) {
    const nextScores = { ...scores }

    Object.entries(option.score).forEach(([key, value]) => {
      nextScores[key] = (nextScores[key] || 0) + (value || 0)
    })

    if (currentIndex < quizQuestions.length - 1) {
      setScores(nextScores)
      setCurrentIndex((prev) => prev + 1)
      return
    }

    const sessionId = localStorage.getItem("demoSessionId") || ""

    localStorage.setItem("personalityScores", JSON.stringify(nextScores))
    localStorage.setItem(
      "personalityResultMeta",
      JSON.stringify({
        sessionId,
        updatedAt: new Date().toISOString()
      })
    )

    router.push("/personality/result")
  }

  function handleBack() {
    if (currentIndex === 0) {
      router.push("/personality")
      return
    }

    setCurrentIndex((prev) => prev - 1)
  }

  if (!quizQuestions.length || !currentQuestion) {
    return (
      <div
        className="game-shell"
        style={{
          backgroundImage:
            "linear-gradient(rgba(14,26,37,0.8), rgba(14,26,37,0.9)), url('/assets/gameImages/background/bg-05.webp')",
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
          <div className="w-full max-w-2xl game-panel p-10 text-center">
            <p className="text-sm text-indigo-300 mb-3">游戏人格构建</p>
            <h1 className="text-2xl font-bold mb-4">题目加载失败</h1>
            <p className="text-gray-400 leading-7 mb-6">
              当前题库可能没有覆盖完整的四个维度，请检查题库数据结构是否包含：
              style、personality、preference、frequency。
            </p>

            <button
              onClick={() => router.push("/personality")}
              className="px-6 py-3 neon-btn font-semibold hover:opacity-90 transition"
            >
              返回上一页
            </button>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div
      className="game-shell"
      style={{
        backgroundImage:
          "linear-gradient(rgba(14,26,37,0.8), rgba(14,26,37,0.9)), url('/assets/gameImages/background/bg-06.webp')",
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
        <div className="w-full max-w-3xl game-panel p-8 md:p-10 motion-fade-in">
          <div className="flex items-start justify-between gap-4 mb-8">
            <button
              onClick={handleBack}
              className="px-4 py-2 neon-outline-btn"
            >
              返回
            </button>

            <div className="flex-1 max-w-md">
              <div className="flex items-center justify-between mb-3 text-sm">
                <p className="text-indigo-300">
                  游戏人格构建 · {currentIndex + 1}/{quizQuestions.length}
                </p>
                <p className="text-gray-400">已完成 {Math.round(progress)}%</p>
              </div>

              <div className="w-full h-2 bg-[rgba(58,63,70,0.7)] rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#10B981] to-[#2dd4bf] transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>

          <div className="mb-6">
            <p className="text-sm text-indigo-300 mb-3">
              第 {currentIndex + 1} 题
            </p>
            <h1 className="text-2xl md:text-3xl font-bold mb-3">{currentQuestion.title}</h1>
            <p className="text-gray-400 leading-7">
              选择一个更接近你真实习惯的答案
            </p>
          </div>

          <div className="space-y-4">
            {currentQuestion.options.map((option) => (
              <AnswerButton
                key={option.label}
                label={option.label}
                onClick={() => handleAnswer(option)}
              />
            ))}
          </div>

          <div className="mt-8 text-sm text-gray-400 leading-6">
            本次测试会综合评估你的游戏风格、游戏性格、游戏偏好和活跃频率，
            最终生成更稳定的游戏人格结果。
          </div>
        </div>
      </main>
    </div>
  )
}

function AnswerButton({ label, onClick }: AnswerButtonProps) {
  return (
    <button
      onClick={onClick}
      className="w-full game-panel hover:scale-[1.01] transition"
    >
      <div className="flex items-center justify-between px-6 py-5">
        <span className="text-lg font-medium text-white leading-none">
          {label}
        </span>

        <span className="text-gray-400 text-xl">→</span>
      </div>
    </button>
  )
}
