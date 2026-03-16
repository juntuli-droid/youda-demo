"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

type CareerItem = {
  id: string
  game: string
  rank: string
  duration: string
  achievement: string
  note: string
  createdAt: string
}

const initialForm = {
  game: "英雄联盟",
  rank: "",
  duration: "",
  achievement: "",
  note: ""
}

export default function CareerPage() {
  const router = useRouter()
  const [form, setForm] = useState(initialForm)
  const [records, setRecords] = useState<CareerItem[]>([])

  useEffect(() => {
    const raw = localStorage.getItem("gameCareerRecords")
    if (raw) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setRecords(JSON.parse(raw))
    }
  }, [])

  const handleSave = () => {
    if (!form.rank.trim() && !form.duration.trim() && !form.achievement.trim()) {
      return
    }

    const nextItem: CareerItem = {
      id: crypto.randomUUID(),
      game: form.game,
      rank: form.rank,
      duration: form.duration,
      achievement: form.achievement,
      note: form.note,
      createdAt: new Date().toISOString()
    }

    const nextRecords = [nextItem, ...records]
    setRecords(nextRecords)
    localStorage.setItem("gameCareerRecords", JSON.stringify(nextRecords))
    setForm(initialForm)
  }

  const handleDelete = (id: string) => {
    const nextRecords = records.filter((item) => item.id !== id)
    setRecords(nextRecords)
    localStorage.setItem("gameCareerRecords", JSON.stringify(nextRecords))
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
            <p className="text-sm text-indigo-300 mb-3">我的游戏生涯</p>
            <h1 className="text-3xl font-bold mb-3">记录你的成长轨迹</h1>
            <p className="text-gray-400 leading-8 mb-8">
              你可以记录常玩的游戏、当前段位、游戏时长、达成成就和你的阶段总结。
            </p>

            <div className="space-y-4">
              <InputGroup label="游戏">
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

              <InputGroup label="当前段位 / 水平">
                <input
                  value={form.rank}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, rank: e.target.value }))
                  }
                  placeholder="例如：钻石 2 / 荣耀王者 / 超凡先锋"
                  className="w-full bg-[#363b42] border border-[#4a515b] rounded-xl px-4 py-3 text-white placeholder:text-gray-500 outline-none"
                />
              </InputGroup>

              <InputGroup label="游戏时长">
                <input
                  value={form.duration}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, duration: e.target.value }))
                  }
                  placeholder="例如：620 小时 / 3 个赛季 / 2 年"
                  className="w-full bg-[#363b42] border border-[#4a515b] rounded-xl px-4 py-3 text-white placeholder:text-gray-500 outline-none"
                />
              </InputGroup>

              <InputGroup label="达成成就">
                <input
                  value={form.achievement}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, achievement: e.target.value }))
                  }
                  placeholder="例如：国服英雄 / 巅峰赛前 1% / 全成就达成"
                  className="w-full bg-[#363b42] border border-[#4a515b] rounded-xl px-4 py-3 text-white placeholder:text-gray-500 outline-none"
                />
              </InputGroup>

              <InputGroup label="阶段总结">
                <textarea
                  value={form.note}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, note: e.target.value }))
                  }
                  rows={5}
                  placeholder="写写你对这段游戏生涯的总结，比如打法变化、心态变化、最难忘的一次上分。"
                  className="w-full bg-[#363b42] border border-[#4a515b] rounded-xl px-4 py-3 text-white placeholder:text-gray-500 outline-none resize-none"
                />
              </InputGroup>

              <div className="grid md:grid-cols-2 gap-4 pt-2">
                <button
                  onClick={handleSave}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-500 font-semibold text-lg hover:opacity-90 transition"
                >
                  保存游戏生涯
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
                <p className="text-sm text-indigo-300 mb-2">生涯档案</p>
                <h2 className="text-2xl font-bold">已保存记录</h2>
              </div>
              <span className="text-sm text-gray-400">{records.length} 条记录</span>
            </div>

            <div className="space-y-4 max-h-[760px] overflow-y-auto pr-1">
              {records.length === 0 ? (
                <div className="bg-[#363b42] rounded-2xl p-6">
                  <p className="text-gray-400 leading-7">
                    你还没有保存任何游戏生涯。先写下你的代表游戏、段位和成就，让你的主页更完整。
                  </p>
                </div>
              ) : (
                records.map((item) => (
                  <div key={item.id} className="bg-[#363b42] rounded-2xl p-5">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div>
                        <p className="text-xl font-semibold">{item.game}</p>
                        <p className="text-sm text-gray-400 mt-1">
                          {new Date(item.createdAt).toLocaleDateString("zh-CN")}
                        </p>
                      </div>

                      <button
                        onClick={() => handleDelete(item.id)}
                        className="text-sm text-red-300 hover:text-red-200 transition"
                      >
                        删除
                      </button>
                    </div>

                    <div className="grid md:grid-cols-3 gap-3 mb-4">
                      <MiniInfo label="段位 / 水平" value={item.rank || "未填写"} />
                      <MiniInfo label="游戏时长" value={item.duration || "未填写"} />
                      <MiniInfo label="达成成就" value={item.achievement || "未填写"} />
                    </div>

                    <div className="bg-[#2b2f33] rounded-xl p-4">
                      <p className="text-sm text-gray-400 mb-2">阶段总结</p>
                      <p className="text-gray-300 leading-7">
                        {item.note || "这条记录还没有填写总结。"}
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