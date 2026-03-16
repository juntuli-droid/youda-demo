"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { startNewDemoSession } from "../lib/demoSession"
import { ApiRequestError, apiRequest } from "../lib/client/api"

type LoginForm = {
  phone: string
  password: string
}

const initialForm: LoginForm = {
  phone: "",
  password: ""
}

export default function LoginPage() {
  const router = useRouter()
  const [form, setForm] = useState<LoginForm>(initialForm)
  const [captchaAnswer, setCaptchaAnswer] = useState("")
  const [captchaHint, setCaptchaHint] = useState("")
  const [error, setError] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const canSubmit = useMemo(() => {
    return form.phone.trim().length > 0 && form.password.trim().length > 0
  }, [form.phone, form.password])

  const handleSubmit = async () => {
    const nextError = validateForm(form, Boolean(captchaHint), captchaAnswer)
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
      }>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({
          phone: form.phone.trim(),
          password: form.password,
          captchaAnswer: captchaAnswer.trim() || undefined
        })
      })

      startNewDemoSession()
      localStorage.setItem("authAccessToken", payload.accessToken)
      localStorage.setItem(
        "authUserProfile",
        JSON.stringify({
          ...payload.profile,
          provider: "phone",
          loggedAt: new Date().toISOString()
        })
      )
      router.push("/personality")
    } catch (requestError) {
      if (requestError instanceof ApiRequestError) {
        if (requestError.code === "AUTH_CAPTCHA_REQUIRED") {
          const hint =
            (requestError.details as { captchaHint?: string } | undefined)
              ?.captchaHint || ""
          setCaptchaHint(hint)
          setError("登录失败次数较多，请输入验证码后重试")
          return
        }

        setError(requestError.message || "登录失败，请检查账号信息")
        return
      }

      setError("登录服务暂不可用，请稍后重试")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex bg-[#1e2124] text-white">
      <aside className="w-20 bg-[#17191c] flex flex-col items-center py-6 space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-indigo-500 flex items-center justify-center text-lg font-bold">
          有搭
        </div>
        <div className="w-12 h-12 rounded-2xl bg-[#2b2f33]" />
        <div className="w-12 h-12 rounded-2xl bg-[#2b2f33]" />
      </aside>

      <main className="flex-1 flex items-center justify-center px-6 py-10">
        <div className="w-full max-w-md bg-[#2b2f33] rounded-3xl shadow-2xl p-10">
          <div className="mb-10">
            <p className="text-sm text-indigo-300 mb-3">手机号登录</p>
            <h1 className="text-4xl font-bold mb-3">欢迎回来</h1>
            <p className="text-gray-400 leading-7">
              登录后即可继续人格测试、匹配与你同频的游戏搭子。
            </p>
          </div>

          <div className="space-y-4">
            <InputGroup label="手机号">
              <input
                value={form.phone}
                onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
                placeholder="请输入 11 位手机号"
                className="w-full bg-[#363b42] border border-[#4a515b] rounded-xl px-4 py-3 text-white placeholder:text-gray-500 outline-none"
              />
            </InputGroup>

            <InputGroup label="密码">
              <input
                value={form.password}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, password: e.target.value }))
                }
                type="password"
                placeholder="请输入密码"
                className="w-full bg-[#363b42] border border-[#4a515b] rounded-xl px-4 py-3 text-white placeholder:text-gray-500 outline-none"
              />
            </InputGroup>

            {captchaHint ? (
              <InputGroup label={`验证码（请输入：${captchaHint}）`}>
                <input
                  value={captchaAnswer}
                  onChange={(e) => setCaptchaAnswer(e.target.value)}
                  placeholder="请输入验证码"
                  className="w-full bg-[#363b42] border border-[#4a515b] rounded-xl px-4 py-3 text-white placeholder:text-gray-500 outline-none"
                />
              </InputGroup>
            ) : null}

            {error ? (
              <div className="rounded-xl border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                {error}
              </div>
            ) : null}

            <button
              onClick={handleSubmit}
              disabled={!canSubmit || submitting}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-500 font-semibold text-lg hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? "登录中..." : "登录并继续"}
            </button>

            <button
              onClick={() => router.push("/register")}
              className="w-full py-4 rounded-2xl bg-[#363b42] border border-[#4a515b] text-gray-300 hover:bg-[#414751] transition"
            >
              没有账号？去注册
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}

function validateForm(
  form: LoginForm,
  requireCaptcha: boolean,
  captchaAnswer: string
) {
  const phone = form.phone.trim()
  const password = form.password.trim()

  if (!/^1\d{10}$/.test(phone)) {
    return "请输入有效的 11 位手机号"
  }

  if (password.length < 6) {
    return "密码长度至少为 6 位"
  }

  if (requireCaptcha && !captchaAnswer.trim()) {
    return "请先输入验证码"
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
