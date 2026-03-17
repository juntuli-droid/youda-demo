"use client"

import { useRouter } from "next/navigation"
import { startNewDemoSession } from "./lib/demoSession"

export default function HomePage() {
  const router = useRouter()

  const handleStartDemo = () => {
    startNewDemoSession()
    router.push("/personality")
  }

  const handlePhoneLogin = () => {
    router.push("/login")
  }

  const handleWechatLogin = () => {
    startNewDemoSession()
    router.push("/personality")
  }

  return (
    <div className="game-shell">
      <aside className="game-sidebar flex flex-col items-center py-6 space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-indigo-500 flex items-center justify-center text-lg font-bold">
          有搭
        </div>
        <div className="w-12 h-12 rounded-2xl bg-[#2b2f33]" />
        <div className="w-12 h-12 rounded-2xl bg-[#2b2f33]" />
      </aside>

      <main className="flex-1 flex items-center justify-center px-6">
        <div className="w-full max-w-md game-panel p-10 motion-fade-in">
          <div className="mb-10">
            <p className="text-sm text-indigo-300 mb-3">有搭</p>
            <h1 className="text-4xl font-bold mb-3">找到你的游戏搭子</h1>
            <p className="text-gray-400 leading-7">
              不只是队友，而是与你节奏一致、能一起长期开黑的人。
            </p>
          </div>

          <div className="space-y-4">
            <button
              className="w-full py-4 font-semibold text-lg neon-btn"
              onClick={handleStartDemo}
            >
              先体验 Demo
            </button>

            <button
              onClick={handlePhoneLogin}
              className="w-full py-4 neon-outline-btn"
            >
              手机号登录
            </button>

            <button
              onClick={handleWechatLogin}
              className="w-full py-4 neon-outline-btn"
            >
              微信登录
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
