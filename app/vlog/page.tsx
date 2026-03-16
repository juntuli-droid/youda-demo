"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

type VlogItem = {
  id: string
  date: string
  partnersCount: string
  duration: string
  game: string
  summary: string
  createdAt: string
}

type VlogPrefill = {
  date: string
  partnersCount: string
  duration: string
  game: string
  summary: string
}

const initialForm = {
  date: new Date().toISOString().slice(0, 10),
  partnersCount: "",
  duration: "",
  game: "英雄联盟",
  summary: ""
}

export default function VlogPage() {
  const router = useRouter()
  const [form, setForm] = useState(initialForm)
  const [records, setRecords] = useState<VlogItem[]>([])

  useEffect(() => {
    const raw = localStorage.getItem("gameVlogRecords")
    if (raw) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setRecords(JSON.parse(raw))
    }

    const rawPrefill = localStorage.getItem("vlogPrefill")
    if (rawPrefill) {
      const prefill = JSON.parse(rawPrefill) as VlogPrefill

      setForm({
        date: prefill.date || new Date().toISOString().slice(0, 10),
        partnersCount: prefill.partnersCount || "",
        duration: prefill.duration || "",
        game: prefill.game || "英雄联盟",
        summary: prefill.summary || ""
      })
    }
  }, [])

  const handleSave = () => {
    if (!form.partnersCount.trim() && !form.duration.trim() && !form.summary.trim()) {
      return
    }

    const nextItem: VlogItem = {
      id: crypto.randomUUID(),
      date: form.date,
      partnersCount: form.partnersCount,
      duration: form.duration,
      game: form.game,
      summary: form.summary,
      createdAt: new Date().toISOString()
    }

    const nextRecords = [nextItem, ...records]
    setRecords(nextRecords)
    localStorage.setItem("gameVlogRecords", JSON.stringify(nextRecords))
    localStorage.removeItem("vlogPrefill")

    setForm({
      ...initialForm,
      date: new Date().toISOString().slice(0, 10)
    })
  }

  const handleDelete = (id: string) => {
    const nextRecords = records.filter((item) => item.id !== id)
    setRecords(nextRecords)
    localStorage.setItem("gameVlogRecords", JSON.stringify(nextRecords))
  }

  return (
    <div className="min-h-screen bg-[#1e2124] text-white flex">
      <aside className="w-20 bg-[#17191c] flex flex-col items-center py-6 space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-indigo-500 flex items-center justify-center text-lg font-bold">
          S
        </div>
      </aside>

      <main className="flex-1 px-6 py-10">
        <div className="max-w-6xl mx-auto grid xl:grid-cols-[1fr_1.1fr] gap-6">
          <section className="bg-[#2b2f33] rounded-3xl shadow-2xl p-8">
            <p className="text-sm text-indigo-300 mb-3">我的游戏 Vlog</p>
            <h1 className="text-3xl font-bold mb-3">记录每一次开黑故事</h1>
            <p className="text-gray-400 leading-8 mb-8">
              记录你今天匹配到了几个搭子、玩了多久、玩了什么游戏，以及你想留下的对局感受。
            </p>

            <div className="space-y-4">
              <InputGroup label="日期">
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, date: e.target.value }))
                  }
                  className="w-full bg-[#363b42] border border-[#4a515b] rounded-xl px-4 py-3 text-white outline-none"
                />
              </InputGroup>

              <InputGroup label="今天玩了什么游戏">
                <select
                  value={form.game}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, game: e.target.value }))
                  }
                  className="w-full bg-[#363b42] border border-[#4a515b] rounded-xl px-4 py-3 text-white outline-none"
                >
                  <option value="英雄联盟">英雄联盟</option>
                  <option value="王者荣耀">王者荣耀</option>
                  <option value="无畏契约">无畏契约</option>
                  <option value="APEX">APEX</option>
                  <option value="永劫无间">永劫无间</option>
                  <option value="原神">原神</option>
                </select>
              </InputGroup>

              <div className="grid md:grid-cols-2 gap-4">
                <InputGroup label="匹配到几个搭子">
                  <input
                    value={form.partnersCount}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        partnersCount: e.target.value
                      }))
                    }
                    placeholder="例如：2 个"
                    className="w-full bg-[#363b42] border border-[#4a515b] rounded-xl px-4 py-3 text-white placeholder:text-gray-500 outline-none"
                  />
                </InputGroup>

                <InputGroup label="今天玩了多久">
                  <input
                    value={form.duration}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, duration: e.target.value }))
                    }
                    placeholder="例如：3 小时 20 分钟"
                    className="w-full bg-[#363b42] border border-[#4a515b] rounded-xl px-4 py-3 text-white placeholder:text-gray-500 outline-none"
                  />
                </InputGroup>
              </div>

              <InputGroup label="今天的 Vlog 总结">
                <textarea
                  value={form.summary}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, summary: e.target.value }))
                  }
                  rows={6}
                  placeholder="例如：今天匹配到了两个很会沟通的队友，打了三把排位，整体节奏非常舒服。"
                  className="w-full bg-[#363b42] border border-[#4a515b] rounded-xl px-4 py-3 text-white placeholder:text-gray-500 outline-none resize-none"
                />
              </InputGroup>

              <div className="grid md:grid-cols-2 gap-4 pt-2">
                <button
                  onClick={handleSave}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-500 font-semibold text-lg hover:opacity-90 transition"
                >
                  保存今天的游戏 Vlog
                </button>

                <button
                  onClick={() => router.push("/profile")}
                  className="w-full py-4 rounded-2xl bg-[#363b42] border border-[#4a515b] font-semibold text-lg hover:bg-[#3c4148] transition"
                >
                  返回我的主页
                </button>
              </div>
            </div>
          </section>

          <section className="bg-[#2b2f33] rounded-3xl shadow-2xl p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-sm text-indigo-300 mb-2">Vlog 时间线</p>
                <h2 className="text-2xl font-bold">最近记录</h2>
              </div>
              <span className="text-sm text-gray-400">{records.length} 条日志</span>
            </div>

            <div className="space-y-4 max-h-[760px] overflow-y-auto pr-1">
              {records.length === 0 ? (
                <div className="bg-[#363b42] rounded-2xl p-6">
                  <p className="text-gray-400 leading-7">
                    你还没有任何 Vlog 记录。下一次匹配到游戏搭子后，回来写下今天的故事吧。
                  </p>
                </div>
              ) : (
                records.map((item) => (
                  <div key={item.id} className="bg-[#363b42] rounded-2xl p-5">
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div>
                        <p className="text-xl font-semibold">{item.game}</p>
                        <p className="text-sm text-gray-400 mt-1">{item.date}</p>
                      </div>

                      <button
                        onClick={() => handleDelete(item.id)}
                        className="text-sm text-red-300 hover:text-red-200 transition"
                      >
                        删除
                      </button>
                    </div>

                    <div className="grid md:grid-cols-2 gap-3 mb-4">
                      <MiniInfo
                        label="匹配到的搭子"
                        value={item.partnersCount || "未填写"}
                      />
                      <MiniInfo
                        label="游戏时长"
                        value={item.duration || "未填写"}
                      />
                    </div>

                    <div className="bg-[#2b2f33] rounded-xl p-4">
                      <p className="text-sm text-gray-400 mb-2">今日总结</p>
                      <p className="text-gray-300 leading-7">
                        {item.summary || "今天的 Vlog 还没有写总结。"}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}

function InputGroup({
  label,
  children
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div>
      <p className="text-sm text-gray-400 mb-3">{label}</p>
      {children}
    </div>
  )
}

function MiniInfo({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-[#2b2f33] rounded-xl p-4">
      <p className="text-sm text-gray-400 mb-2">{label}</p>
      <p className="font-semibold leading-7">{value}</p>
    </div>
  )
}