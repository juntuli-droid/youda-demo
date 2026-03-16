"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { apiRequest } from "../lib/client/api"

type MatchDraft = {
  game: string
  playStyle: string
  targetStyle: string
  teamMode: string
  createdAt: string
}

type Teammate = {
  name: string
  tag: string
  personality: string
  active: boolean
  ready: boolean
}

type ChatMessage = {
  id: string
  sender: string
  role: string
  content: string
  time: string
  isSelf?: boolean
}

type RoomDetailPayload = {
  room: {
    id: string
    status: string
    roomType: string
    game: {
      id: string
      name: string
    }
  }
  members: Array<{
    userId: string
    nickname: string
    readyStatus: boolean
    voiceStatus: string
    joinedAt: string
  }>
}

type RoomMessagePayload = {
  items: Array<{
    id: string
    content: string
    createdAt: string
    sender: {
      nickname: string
    }
  }>
  nextCursor: string | null
}

function getTeammatesByTeamMode(teamMode?: string): Teammate[] {
  const base: Teammate[] = [
    {
      name: "你",
      tag: "认真冲分型",
      personality: "ACP-F",
      active: true,
      ready: true
    },
    {
      name: "夜猫打野",
      tag: "高沟通配合",
      personality: "SCP-T",
      active: true,
      ready: true
    },
    {
      name: "稳住能赢",
      tag: "情绪稳定型",
      personality: "SCS-F",
      active: false,
      ready: false
    },
    {
      name: "操作怪",
      tag: "节奏发起者",
      personality: "ACP-T",
      active: true,
      ready: true
    },
    {
      name: "指挥位",
      tag: "目标推进偏好",
      personality: "SCP-F",
      active: true,
      ready: false
    }
  ]

  if (teamMode?.includes("双排")) return base.slice(0, 2)
  if (teamMode?.includes("三排")) return base.slice(0, 3)
  if (teamMode?.includes("四排")) return base.slice(0, 4)
  if (teamMode?.includes("五排")) return base.slice(0, 5)
  return base.slice(0, 2)
}

function mapTeamModeToPartnersCount(teamMode?: string) {
  if (teamMode?.includes("双排")) return "1 个"
  if (teamMode?.includes("三排")) return "2 个"
  if (teamMode?.includes("四排")) return "3 个"
  if (teamMode?.includes("五排")) return "4 个"
  return "1 个"
}

function getInitialMessages(matchDraft: MatchDraft | null): ChatMessage[] {
  const game = matchDraft?.game || "英雄联盟"

  return [
    {
      id: "1",
      sender: "夜猫打野",
      role: "SCP-T · 高沟通配合",
      content: `哈喽，我这边可以先聊一下分路和节奏，等会儿一起打 ${game}。`,
      time: "19:21"
    },
    {
      id: "2",
      sender: "你",
      role: "ACP-F · 认真冲分型",
      content: "可以，我比较偏认真打，想先确认一下这把是稳一点还是主动找机会。",
      time: "19:22",
      isSelf: true
    },
    {
      id: "3",
      sender: "夜猫打野",
      role: "SCP-T · 高沟通配合",
      content: "我沟通会比较多，前期可以先稳住，优势了再提速。",
      time: "19:23"
    }
  ]
}

export default function RoomPage() {
  const router = useRouter()
  const [matchDraft, setMatchDraft] = useState<MatchDraft | null>(null)
  const [roomId, setRoomId] = useState("")
  const [roomDetail, setRoomDetail] = useState<RoomDetailPayload | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState("")
  const [error, setError] = useState("")
  const [sending, setSending] = useState(false)

  useEffect(() => {
    const raw = localStorage.getItem("latestMatchDraft")
    if (raw) {
      const parsed = JSON.parse(raw) as MatchDraft
      setMatchDraft(parsed)

      const vlogPrefill = {
        date: new Date().toISOString().slice(0, 10),
        game: parsed.game,
        partnersCount: mapTeamModeToPartnersCount(parsed.teamMode),
        duration: "1 小时 30 分钟",
        summary: `今天通过匹配页匹配到了${mapTeamModeToPartnersCount(parsed.teamMode)}搭子，一起玩了${parsed.game}，整体风格偏${parsed.targetStyle}。`
      }

      localStorage.setItem("vlogPrefill", JSON.stringify(vlogPrefill))
      setMessages(getInitialMessages(parsed))
    }

    const activeRoomId = localStorage.getItem("currentRoomId") || ""
    if (!activeRoomId) {
      if (!raw) {
        setMessages(getInitialMessages(null))
      }
      return
    }

    setRoomId(activeRoomId)

    const loadRoom = async () => {
      try {
        const [detail, messageData] = await Promise.all([
          apiRequest<RoomDetailPayload>(`/api/rooms/${activeRoomId}`),
          apiRequest<RoomMessagePayload>(`/api/rooms/${activeRoomId}/messages`)
        ])

        setRoomDetail(detail)
        if (messageData.items.length > 0) {
          const profileRaw = localStorage.getItem("authUserProfile")
          const myNickname = profileRaw
            ? (JSON.parse(profileRaw) as { nickname?: string }).nickname || "你"
            : "你"

          setMessages(
            messageData.items.map((item) => ({
              id: item.id,
              sender: item.sender.nickname,
              role: "房间成员",
              content: item.content,
              time: new Date(item.createdAt).toLocaleTimeString("zh-CN", {
                hour: "2-digit",
                minute: "2-digit"
              }),
              isSelf: item.sender.nickname === myNickname
            }))
          )
        }
      } catch (requestError) {
        const message =
          requestError instanceof Error
            ? requestError.message
            : "房间信息加载失败，请稍后重试"
        setError(message)
      }
    }

    loadRoom()
  }, [])

  const teammates = useMemo(
    () =>
      roomDetail
        ? roomDetail.members.map((member) => ({
            name: member.nickname,
            tag: member.voiceStatus === "connected" ? "语音已连接" : "等待连接",
            personality: "SCP-T",
            active: member.voiceStatus !== "offline",
            ready: member.readyStatus
          }))
        : getTeammatesByTeamMode(matchDraft?.teamMode),
    [matchDraft, roomDetail]
  )

  const onlineCount = teammates.filter((item) => item.active).length
  const readyCount = teammates.filter((item) => item.ready).length

  const handleSendMessage = async () => {
    const value = input.trim()
    if (!value) return

    if (!roomId) {
      const fallbackMessage: ChatMessage = {
        id: crypto.randomUUID(),
        sender: "你",
        role: "ACP-F · 认真冲分型",
        content: value,
        time: new Date().toLocaleTimeString("zh-CN", {
          hour: "2-digit",
          minute: "2-digit"
        }),
        isSelf: true
      }
      setMessages((prev) => [...prev, fallbackMessage])
      setInput("")
      return
    }

    setSending(true)
    setError("")

    try {
      const saved = await apiRequest<{
        id: string
        content: string
        createdAt: string
        sender: {
          nickname: string
        }
      }>(`/api/rooms/${roomId}/messages`, {
        method: "POST",
        body: JSON.stringify({
          content: value
        })
      })

      const profileRaw = localStorage.getItem("authUserProfile")
      const myNickname = profileRaw
        ? (JSON.parse(profileRaw) as { nickname?: string }).nickname || "你"
        : "你"

      const newMessage: ChatMessage = {
        id: saved.id,
        sender: saved.sender.nickname,
        role: "房间成员",
        content: saved.content,
        time: new Date(saved.createdAt).toLocaleTimeString("zh-CN", {
          hour: "2-digit",
          minute: "2-digit"
        }),
        isSelf: saved.sender.nickname === myNickname
      }

      setMessages((prev) => [...prev, newMessage])
      setInput("")
    } catch (requestError) {
      const message =
        requestError instanceof Error ? requestError.message : "消息发送失败"
      setError(message)
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#1e2124] text-white flex">
      <aside className="w-20 bg-[#17191c] flex flex-col items-center py-6 space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-indigo-500 flex items-center justify-center text-lg font-bold">
          S
        </div>
      </aside>

      <main className="flex-1 p-8">
        <div className="h-full grid lg:grid-cols-[1.2fr_320px] gap-6">
          <section className="bg-[#2b2f33] rounded-3xl p-8 shadow-2xl flex flex-col min-h-[780px]">
            <div className="mb-8">
              <p className="text-sm text-green-400 mb-2">匹配成功</p>
              <h1 className="text-3xl font-bold mb-3">欢迎进入语音房</h1>
              <p className="text-gray-400">
                你已成功匹配到 {Math.max(teammates.length - 1, 1)} 位节奏相近的游戏搭子，房间已建立。
                你们可以先在下方聊天，确认分工、节奏和开麦习惯，再进入语音通话。
              </p>
            </div>

            {error ? (
              <div className="mb-6 rounded-xl border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                {error}
              </div>
            ) : null}

            <div className="grid sm:grid-cols-2 gap-5 mb-6">
              {teammates.map((user) => (
                <div
                  key={user.name}
                  className="bg-[#363b42] rounded-2xl p-5 border border-[#434a54]"
                >
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center font-bold text-lg">
                        {user.name.slice(0, 1)}
                      </div>
                      <div>
                        <p className="font-semibold text-lg">{user.name}</p>
                        <p className="text-sm text-gray-400">{user.tag}</p>
                      </div>
                    </div>

                    <span className="px-3 py-1 rounded-full bg-[#2b2f33] border border-[#4a515b] text-xs text-indigo-200 whitespace-nowrap">
                      人格 {user.personality}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <MiniStatusCard
                      label="游戏人格"
                      value={`${user.personality} · ${user.tag}`}
                    />
                    <MiniStatusCard
                      label="准备状态"
                      value={user.ready ? "已准备" : "待确认"}
                      valueClassName={user.ready ? "text-green-400" : "text-yellow-300"}
                    />
                  </div>

                  <div className="flex items-center justify-between text-sm mt-4">
                    <span className="text-gray-400">语音状态</span>
                    <span className={user.active ? "text-green-400" : "text-gray-500"}>
                      {user.active ? "在线中" : "未开麦"}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex-1 bg-[#262a2f] rounded-3xl border border-[#3a4048] p-5 flex flex-col min-h-[320px]">
              <div className="flex items-center justify-between gap-4 mb-4">
                <div>
                  <p className="text-sm text-indigo-300 mb-1">进房前先聊一聊</p>
                  <h2 className="text-xl font-bold">房间聊天</h2>
                </div>

                <div className="flex items-center gap-3 text-sm">
                  <span className="px-3 py-1.5 rounded-full bg-[#363b42] text-gray-300">
                    在线 {onlineCount}/{teammates.length}
                  </span>
                  <span className="px-3 py-1.5 rounded-full bg-[#363b42] text-gray-300">
                    已准备 {readyCount}/{teammates.length}
                  </span>
                </div>
              </div>

              <div className="flex-1 space-y-3 overflow-y-auto pr-1">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.isSelf ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                        message.isSelf
                          ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white"
                          : "bg-[#363b42] text-white"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="font-semibold text-sm">{message.sender}</span>
                        <span
                          className={`text-xs ${
                            message.isSelf ? "text-indigo-100/90" : "text-gray-400"
                          }`}
                        >
                          {message.role}
                        </span>
                        <span
                          className={`text-xs ml-auto ${
                            message.isSelf ? "text-indigo-100/80" : "text-gray-500"
                          }`}
                        >
                          {message.time}
                        </span>
                      </div>
                      <p className="leading-7 text-sm">{message.content}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex gap-3">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleSendMessage()
                    }
                  }}
                  placeholder="先聊聊分路、节奏、开麦习惯..."
                  className="flex-1 bg-[#363b42] border border-[#4a515b] rounded-2xl px-4 py-3 text-white placeholder:text-gray-500 outline-none"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={sending}
                  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-500 font-semibold hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {sending ? "发送中" : "发送"}
                </button>
              </div>
            </div>
          </section>

          <aside className="bg-[#2b2f33] rounded-3xl p-6 shadow-2xl">
            <h2 className="text-xl font-bold mb-6">房间信息</h2>

            <div className="space-y-4 mb-8">
              <RoomInfo
                label="房间名称"
                value={`${roomDetail?.room.game.name || matchDraft?.game || "英雄联盟"} · ${roomDetail?.room.roomType || matchDraft?.teamMode || "双排"}房`}
              />
              <RoomInfo label="偏好风格" value={matchDraft?.targetStyle || "高沟通配合"} />
              <RoomInfo label="语音状态" value="已连接" />
            </div>

            <button className="w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-500 font-semibold hover:opacity-90 transition">
              进入语音通话
            </button>

            <button className="w-full mt-4 py-4 rounded-2xl bg-[#363b42] text-gray-300 hover:bg-[#414751] transition">
              邀请更多队友
            </button>

            <button
              onClick={() => router.push("/vlog")}
              className="w-full mt-4 py-4 rounded-2xl bg-[#363b42] text-gray-300 hover:bg-[#414751] transition"
            >
              记录这次游戏 Vlog
            </button>
          </aside>
        </div>
      </main>
    </div>
  )
}

function RoomInfo({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-[#363b42] rounded-2xl px-4 py-4">
      <p className="text-sm text-gray-400 mb-1">{label}</p>
      <p className="font-semibold">{value}</p>
    </div>
  )
}

function MiniStatusCard({
  label,
  value,
  valueClassName
}: {
  label: string
  value: string
  valueClassName?: string
}) {
  return (
    <div className="bg-[#2b2f33] rounded-xl p-3">
      <p className="text-xs text-gray-400 mb-1">{label}</p>
      <p className={`text-sm font-medium leading-6 ${valueClassName || "text-white"}`}>
        {value}
      </p>
    </div>
  )
}
