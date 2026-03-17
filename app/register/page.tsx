"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { startNewDemoSession } from "../lib/demoSession"
import { ApiRequestError, apiRequest } from "../lib/client/api"

type RegisterForm = {
  nickname: string
  phone: string
  password: string
  confirmPassword: string
}

const initialForm: RegisterForm = {
  nickname: "",
  phone: "",
  password: "",
  confirmPassword: ""
}

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState<RegisterForm>(initialForm)
  const [error, setError] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const canSubmit = useMemo(() => {
    return (
      form.nickname.trim().length > 0 &&
      form.phone.trim().length > 0 &&
      form.password.trim().length > 0 &&
      form.confirmPassword.trim().length > 0
    )
  }, [form])

  const handleSubmit = async () => {
    const nextError = validateForm(form)
    if (nextError) {
      setError(nextError)
      return
    }

    setSubmitting(true)
    setError("")

    try {
      const payload = await apiRequest<{
        accessToken: string
        tokenType: string
        profile: {
          nickname: string
          phone: string
        }
      }>("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({
          nickname: form.nickname.trim(),
          phone: form.phone.trim(),
          password: form.password,
          confirmPassword: form.confirmPassword
        })
      })

      startNewDemoSession()
      localStorage.setItem("authAccessToken", payload.accessToken)
      localStorage.setItem(
        "authUserProfile",
        JSON.stringify({
          ...payload.profile,
          provider: "phone",
          registeredAt: new Date().toISOString()
        })
      )
      router.push("/personality")
    } catch (requestError) {
      if (requestError instanceof ApiRequestError) {
        setError(requestError.message || "注册失败，请稍后重试")
        return
      }
      setError("注册服务暂不可用，请稍后重试")
    } finally {
      setSubmitting(false)
    }
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

      <main className="flex-1 flex items-center justify-center px-6 py-10">
        <div className="w-full max-w-md game-panel p-10 motion-fade-in">
          <div className="mb-10">
            <p className="text-sm text-indigo-300 mb-3">账号注册</p>
            <h1 className="text-4xl font-bold mb-3">创建你的有搭账号</h1>
            <p className="text-gray-400 leading-7">
              完成注册后即可创建专属游戏人格，开始匹配长期搭子。
            </p>
          </div>

          <div className="space-y-4">
            <InputGroup label="昵称">
              <input
                value={form.nickname}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, nickname: e.target.value }))
                }
                placeholder="请输入昵称"
                className="neon-input"
              />
            </InputGroup>

            <InputGroup label="手机号">
              <input
                value={form.phone}
                onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
                placeholder="请输入 11 位手机号"
                className="neon-input"
              />
            </InputGroup>

            <InputGroup label="密码">
              <input
                value={form.password}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, password: e.target.value }))
                }
                type="password"
                placeholder="请设置密码（至少 6 位）"
                className="neon-input"
              />
            </InputGroup>

            <InputGroup label="确认密码">
              <input
                value={form.confirmPassword}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, confirmPassword: e.target.value }))
                }
                type="password"
                placeholder="请再次输入密码"
                className="neon-input"
              />
            </InputGroup>

            {error ? (
              <div className="rounded-xl border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                {error}
              </div>
            ) : null}

            <button
              onClick={handleSubmit}
              disabled={!canSubmit || submitting}
              className="w-full py-4 font-semibold text-lg neon-btn disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? "注册中..." : "注册并开始"}
            </button>

            <button
              onClick={() => router.push("/login")}
              className="w-full py-4 neon-outline-btn"
            >
              已有账号？去登录
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}

function validateForm(form: RegisterForm) {
  const nickname = form.nickname.trim()
  const phone = form.phone.trim()
  const password = form.password.trim()
  const confirmPassword = form.confirmPassword.trim()

  if (nickname.length < 2 || nickname.length > 20) {
    return "昵称长度需在 2 到 20 个字符之间"
  }

  if (!/^1\d{10}$/.test(phone)) {
    return "请输入有效的 11 位手机号"
  }

  if (password.length < 6) {
    return "密码长度至少为 6 位"
  }

  if (password !== confirmPassword) {
    return "两次输入的密码不一致"
  }

  return ""
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
