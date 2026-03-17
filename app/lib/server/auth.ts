import { jwtVerify, createRemoteJWKSet } from "jose"
import { NextRequest } from "next/server"
import { prisma } from "./prisma"
import { unauthorized } from "./errors"
import { verifyAuthToken } from "./security/token"
import { getMemoryStore } from "./memoryStore"

type AuthUser = {
  id: string
  authUserId: string
}

function getBearerToken(request: NextRequest) {
  const header = request.headers.get("authorization")
  if (!header) return null
  const [type, token] = header.split(" ")
  if (type !== "Bearer" || !token) return null
  return token
}

function getSupabaseIssuer() {
  const explicitIssuer = process.env.SUPABASE_JWT_ISSUER
  if (explicitIssuer) return explicitIssuer

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!url) return null
  return `${url}/auth/v1`
}

async function verifySupabaseToken(token: string) {
  const issuer = getSupabaseIssuer()
  if (!issuer) return null

  const jwks = createRemoteJWKSet(new URL(`${issuer}/.well-known/jwks.json`))
  const result = await jwtVerify(token, jwks, { issuer })
  return result.payload
}

async function ensureUserByAuthId(authUserId: string) {
  const useMemoryOnly = !process.env.DATABASE_URL
  const memoryStore = getMemoryStore()
  const memoryUser = [...memoryStore.users.values()].find(
    (item) => item.authUserId === authUserId
  )
  if (memoryUser && useMemoryOnly) {
    return { id: memoryUser.id, authUserId: memoryUser.authUserId }
  }

  if (!useMemoryOnly) {
    try {
      const found = await prisma.user.findUnique({
        where: { authUserId },
        select: { id: true, authUserId: true }
      })

      if (found) {
        memoryStore.users.set(found.id, {
          id: found.id,
          authUserId: found.authUserId,
          nickname: `玩家${found.authUserId.slice(0, 6)}`,
          authProvider: "supabase"
        })
        return found
      }

      const created = await prisma.user.create({
        data: {
          authUserId,
          nickname: `玩家${authUserId.slice(0, 6)}`,
          authProvider: "supabase"
        },
        select: { id: true, authUserId: true }
      })
      memoryStore.users.set(created.id, {
        id: created.id,
        authUserId: created.authUserId,
        nickname: `玩家${created.authUserId.slice(0, 6)}`,
        authProvider: "supabase"
      })
      return created
    } catch {
    }
  }

  if (memoryUser) {
    return { id: memoryUser.id, authUserId: memoryUser.authUserId }
  }

  const fallbackId = authUserId.startsWith("dev_user_")
    ? authUserId
    : crypto.randomUUID()
  memoryStore.users.set(fallbackId, {
    id: fallbackId,
    authUserId,
    nickname: `玩家${authUserId.slice(0, 6)}`,
    authProvider: "local"
  })
  return { id: fallbackId, authUserId }
}

export async function requireUser(request: NextRequest): Promise<AuthUser> {
  const token = getBearerToken(request)

  if (token) {
    const localPayload = await verifyAuthToken(token).catch(() => null)
    if (localPayload?.sub) {
      return ensureUserByAuthId(localPayload.sub)
    }

    const payload = await verifySupabaseToken(token).catch(() => null)
    const sub = payload?.sub

    if (!sub || typeof sub !== "string") {
      throw unauthorized()
    }

    return ensureUserByAuthId(sub)
  }

  if (process.env.NODE_ENV !== "production") {
    const devUserId = request.headers.get("x-dev-user-id") || "dev_user_default"
    return ensureUserByAuthId(devUserId)
  }

  throw unauthorized()
}
