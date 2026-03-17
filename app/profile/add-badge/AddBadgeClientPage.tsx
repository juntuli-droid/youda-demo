"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import type { OfficialBadgePreset } from "../../lib/badgeTypes"
import {
  addManualBadge,
  addManualBadgeFromPreset,
  loadBadgeStore,
  replaceManualBadge
} from "../../lib/badgeStorage"

type Props = {
  officialBadges: OfficialBadgePreset[]
  editId: string
}

type Tab = "official" | "custom"

export default function AddBadgeClientPage({ officialBadges, editId }: Props) {
  const router = useRouter()
  const [tab, setTab] = useState<Tab>("official")
  const [keyword, setKeyword] = useState("")
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [iconUrl, setIconUrl] = useState("")
  const [error, setError] = useState("")
  useEffect(() => {
    if (!editId) return
    let disposed = false
    async function hydrate() {
      await Promise.resolve()
      if (disposed) return
      const store = loadBadgeStore()
      const target = store.manualBadges.find((item) => item.id === editId)
      if (!target) return
      setTab("custom")
      setName(target.name)
      setDescription(target.description)
      setIconUrl(target.iconUrl)
    }
    hydrate()
    return () => {
      disposed = true
    }
  }, [editId])

  const filtered = useMemo(() => {
    const key = keyword.trim().toLowerCase()
    if (!key) return officialBadges
    return officialBadges.filter(
      (item) =>
        item.name.toLowerCase().includes(key) || item.description.toLowerCase().includes(key)
    )
  }, [officialBadges, keyword])

  const handlePickOfficial = (item: OfficialBadgePreset) => {
    addManualBadgeFromPreset(item)
    router.push("/profile")
  }

  const handleUpload = (file: File) => {
    if (!["image/png", "image/webp"].includes(file.type)) {
      setError("仅支持 PNG/WebP")
      return
    }
    if (file.size > 200 * 1024) {
      setError("图片需小于 200KB")
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      setIconUrl(String(reader.result || ""))
      setError("")
    }
    reader.readAsDataURL(file)
  }

  const handleSaveCustom = () => {
    if (!name.trim() || !iconUrl) {
      setError("请填写名称并上传图标")
      return
    }
    if (editId) {
      replaceManualBadge(editId, {
        name: name.trim().slice(0, 12),
        description: description.trim().slice(0, 30),
        iconUrl,
        blurDataURL: iconUrl
      })
    } else {
      addManualBadge({
        name: name.trim().slice(0, 12),
        description: description.trim().slice(0, 30),
        iconUrl,
        blurDataURL: iconUrl
      })
    }
    router.push("/profile")
  }

  return (
    <div className="game-shell">
      <aside className="game-sidebar flex flex-col items-center py-6">
        <div className="w-12 h-12 rounded-2xl bg-indigo-500 flex items-center justify-center text-lg font-bold">
          S
        </div>
      </aside>
      <main className="flex-1 px-6 py-10">
        <div className="max-w-5xl mx-auto game-panel p-6 space-y-5">
          <div className="flex items-center justify-between gap-3">
            <h1 className="text-2xl font-bold">添加标签 / 奖牌</h1>
            <button onClick={() => router.push("/profile")} className="neon-outline-btn px-3 py-2">
              返回
            </button>
          </div>
          <input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="搜索官方标签"
            className="neon-input"
          />
          <div className="flex gap-3">
            <button
              onClick={() => setTab("official")}
              className={`px-4 py-2 rounded-lg ${tab === "official" ? "neon-btn" : "neon-outline-btn"}`}
            >
              官方成就
            </button>
            <button
              onClick={() => setTab("custom")}
              className={`px-4 py-2 rounded-lg ${tab === "custom" ? "neon-btn" : "neon-outline-btn"}`}
            >
              自定义
            </button>
          </div>

          {tab === "official" ? (
            <div className="grid md:grid-cols-2 gap-4">
              {filtered.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handlePickOfficial(item)}
                  className="game-panel p-4 text-left hover:scale-[1.01] transition"
                >
                  <div className="flex items-center gap-3">
                    <Image
                      src={item.iconUrl}
                      alt={item.name}
                      width={64}
                      height={64}
                      className="rounded-xl"
                      placeholder={item.blurDataURL ? "blur" : undefined}
                      blurDataURL={item.blurDataURL}
                    />
                    <div>
                      <p className="font-semibold">{item.name}</p>
                      <p className="text-sm text-gray-400">{item.description}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={12}
                placeholder="标签名称（≤12字）"
                className="neon-input"
              />
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={30}
                placeholder="描述（≤30字）"
                className="neon-input min-h-[92px]"
              />
              <input
                type="file"
                accept="image/png,image/webp"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handleUpload(file)
                }}
                className="neon-input"
              />
              {iconUrl ? (
                <Image src={iconUrl} alt="预览图标" width={64} height={64} className="rounded-xl" />
              ) : null}
              {error ? <div className="text-red-300 text-sm">{error}</div> : null}
              <button onClick={handleSaveCustom} className="neon-btn px-5 py-3 font-semibold">
                保存
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
