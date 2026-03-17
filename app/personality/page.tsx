"use client"

import { useRouter } from "next/navigation"
import { startNewDemoSession } from "../lib/demoSession"

export default function PersonalityPage() {
  const router = useRouter()

  const handleStartTest = () => {
    startNewDemoSession()
    router.push("/personality/questions")
  }

  return (
    <div
      className="game-shell"
      style={{
        backgroundImage:
          "linear-gradient(rgba(14,26,37,0.8), rgba(14,26,37,0.92)), url('/assets/gameImages/background/bg-03.webp')",
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
        <div className="w-full max-w-3xl game-panel p-10 motion-fade-in">
          <div className="mb-10">
            <p className="text-sm text-indigo-300 mb-3">开始测试</p>
            <h1 className="text-3xl font-bold mb-3">构建你的游戏人格</h1>
            <p className="text-gray-400">
              用 16 道轻量问题，快速判断你的节奏、偏好和协作方式。
            </p>
          </div>

          <div className="game-panel p-5 mb-6">
            <p className="text-sm text-gray-400 mb-3">人格编码说明</p>

            <p className="mb-4 font-semibold">两位主编码 + 一位活跃标签</p>

            <p className="text-gray-300 mb-3">
              第一位：游戏风格
              A 主动进攻型 · B 稳健平衡型 · S 沟通协作型
            </p>

            <p className="text-gray-300 mb-3">
              第二位：游戏偏好
              C 竞技对抗型 · T 团队合作型 · E 探索体验型
            </p>

            <p className="text-gray-300">
              活跃标签
              F 高频玩家 · L 轻量玩家
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="game-panel p-5">
              <p className="text-sm text-gray-400 mb-2">测试题数</p>
              <p className="text-xl font-semibold">16 题</p>
            </div>

            <div className="game-panel p-5">
              <p className="text-sm text-gray-400 mb-2">输出结果</p>
              <p className="text-xl font-semibold">人格编码</p>
            </div>
          </div>

          <div className="mt-10">
            <button
              onClick={handleStartTest}
              className="w-full py-5 neon-btn font-semibold text-xl hover:opacity-90 transition"
            >
              开始测试
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
