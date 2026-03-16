import { jwtVerify, createRemoteJWKSet } from "jose"
import { NextRequest } from "next/server"
import { prisma } from "./prisma"
import { unauthorized } from "./errors"
import { verifyAuthToken } from "./security/token"

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
  const found = await prisma.user.findUnique({
    where: { authUserId },
    select: { id: true, authUserId: true }
  })

  if (found) return found

  return prisma.user.create({
    data: {
      authUserId,
      nickname: `玩家${authUserId.slice(0, 6)}`,
      authProvider: "supabase"
    },
    select: { id: true, authUserId: true }
  })
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
