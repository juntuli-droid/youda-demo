"use client"

import { useEffect, useState } from "react"
import {
  buildRetryUrl,
  getAvatarCacheKey,
  getAvatarFallbackChain,
  normalizeAvatarSource
} from "./avatarImageLoader"

async function preload(src: string, timeoutMs = 500) {
  await new Promise<void>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("timeout")), timeoutMs)
    const img = new Image()
    img.onload = () => {
      clearTimeout(timer)
      resolve()
    }
    img.onerror = () => {
      clearTimeout(timer)
      reject(new Error("load_error"))
    }
    img.src = src
  })
}

export function useAvatarImage(inputSrc?: string) {
  const normalized = normalizeAvatarSource(inputSrc)
  const [displaySrc, setDisplaySrc] = useState(normalized)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    let disposed = false
    const cacheKey = getAvatarCacheKey(normalized)
    const cached =
      typeof window !== "undefined" ? sessionStorage.getItem(cacheKey) : null

    async function run() {
      await Promise.resolve()
      if (disposed) return

      if (cached && cached === normalized) {
        setDisplaySrc(cached)
        setLoading(false)
        setError(false)
        return
      }

      setDisplaySrc(normalized)
      setLoading(true)
      setError(false)

      for (let i = 0; i < 3; i += 1) {
        try {
          const retrySrc = buildRetryUrl(normalized, i)
          await preload(retrySrc)
          if (disposed) return
          setDisplaySrc(normalized)
          setLoading(false)
          setError(false)
          sessionStorage.setItem(cacheKey, normalized)
          return
        } catch {}
      }

      const fallbacks = getAvatarFallbackChain(undefined)
      for (const fallback of fallbacks) {
        try {
          await preload(fallback, 500)
          if (disposed) return
          setDisplaySrc(fallback)
          setLoading(false)
          setError(fallback !== normalized)
          return
        } catch {}
      }

      if (!disposed) {
        setLoading(false)
        setError(true)
      }
    }

    run()

    return () => {
      disposed = true
    }
  }, [normalized])

  return {
    displaySrc,
    loading,
    error
  }
}
