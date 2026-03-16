import { createClient } from "@supabase/supabase-js"
import { badRequest } from "./errors"

export function isSupabaseConfigured() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  return Boolean(url && anonKey)
}

export function createServerSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!isSupabaseConfigured() || !url || !anonKey) {
    throw badRequest("缺少 Supabase 环境变量配置")
  }

  return createClient(url, anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  })
}

export function phoneToAuthEmail(phone: string) {
  return `${phone}@syncup.local`
}

export function createDevPhoneToken(phone: string) {
  return `dev_phone_${phone}`
}
