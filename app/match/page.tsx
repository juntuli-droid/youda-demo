"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"

export default function MatchPage() {
  const router = useRouter()
  const [game, setGame] = useState("英雄联盟")
  const [myStyle, setMyStyle] = useState("认真冲分")
  const [targetStyle, setTargetStyle] = useState("高沟通配合")
  const [teamSize, setTeamSize] = useState("双排")

  return (
    <div className="min-h-screen bg-[#1e2124] text-white flex">
      <aside className="w-20 bg-[#17191c] flex flex-col items-center py-6 space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-indigo-500 flex items-center justify-center text-lg font-bold">
          S
        </div>
      </aside>

      <main className="flex-1 flex items-center justify-center px-6 py-10">
        <div className="w-full max-w-3xl bg-[#2b2f33] rounded-3xl shadow-2xl p-10">
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
            <button
              onClick={() => router.push("/matching")}
              className="w-full py-5 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-500 font-semibold text-xl hover:opacity-90 transition"
            >
              🎮 开始匹配游戏搭子
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
    <div className="bg-[#363b42] rounded-2xl p-5">
      <p className="text-sm text-gray-400 mb-3">{label}</p>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-[#2b2f33] border border-[#4a515b] rounded-xl px-4 py-3 text-white outline-none"
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