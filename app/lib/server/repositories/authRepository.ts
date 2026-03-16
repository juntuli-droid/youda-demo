import { prisma } from "../prisma"
import type { Prisma } from "@prisma/client"

type CredentialRow = {
  id: string
  userId: string
  phone: string
  passwordHash: string
  passwordSalt: string
  failedAttempts: number
  captchaSeed: string | null
  lockedUntil: Date | null
}

type MemoryUser = {
  id: string
  nickname: string
}

const globalMemoryStore = globalThis as unknown as {
  authMemoryStore?: {
    usersById: Map<string, MemoryUser>
    phoneToCredential: Map<string, CredentialRow>
  }
}

function getMemoryStore() {
  if (!globalMemoryStore.authMemoryStore) {
    globalMemoryStore.authMemoryStore = {
      usersById: new Map<string, MemoryUser>(),
      phoneToCredential: new Map<string, CredentialRow>()
    }
  }
  return globalMemoryStore.authMemoryStore
}

function shouldUseMemoryStore() {
  return !process.env.DATABASE_URL
}

function canFallbackToMemory(error: unknown) {
  if (process.env.NODE_ENV === "production") return false
  if (shouldUseMemoryStore()) return true
  const code =
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof (error as { code?: unknown }).code === "string"
      ? (error as { code: string }).code
      : ""
  return ["P2021", "P1001", "P1017", "P1008", "P1000"].includes(code)
}

function getCredentialFromMemory(phone: string) {
  const store = getMemoryStore()
  return store.phoneToCredential.get(phone) || null
}

export async function findCredentialByPhone(phone: string) {
  if (shouldUseMemoryStore()) {
    return getCredentialFromMemory(phone)
  }

  try {
    const rows = await prisma.$queryRaw<CredentialRow[]>`
      SELECT
        id,
        "userId",
        phone,
        "passwordHash",
        "passwordSalt",
        "failedAttempts",
        "captchaSeed",
        "lockedUntil"
      FROM user_credentials
      WHERE phone = ${phone}
      LIMIT 1
    `

    return rows[0] || null
  } catch (error) {
    if (!canFallbackToMemory(error)) throw error
    return getCredentialFromMemory(phone)
  }
}

export async function createUserWithCredential(args: {
  phone: string
  nickname: string
  passwordHash: string
  passwordSalt: string
}) {
  if (shouldUseMemoryStore()) {
    const store = getMemoryStore()
    const user: MemoryUser = {
      id: crypto.randomUUID(),
      nickname: args.nickname
    }
    const credential: CredentialRow = {
      id: crypto.randomUUID(),
      userId: user.id,
      phone: args.phone,
      passwordHash: args.passwordHash,
      passwordSalt: args.passwordSalt,
      failedAttempts: 0,
      captchaSeed: null,
      lockedUntil: null
    }
    store.usersById.set(user.id, user)
    store.phoneToCredential.set(args.phone, credential)
    return {
      id: user.id,
      authUserId: `local_phone_${args.phone}`,
      nickname: user.nickname
    }
  }

  try {
    return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const user = await tx.user.create({
        data: {
          authUserId: `local_phone_${args.phone}`,
          nickname: args.nickname,
          authProvider: "local"
        }
      })

      await tx.userCredential.create({
        data: {
          userId: user.id,
          phone: args.phone,
          passwordHash: args.passwordHash,
          passwordSalt: args.passwordSalt
        }
      })

      return user
    })
  } catch (error) {
    if (!canFallbackToMemory(error)) throw error
    const store = getMemoryStore()
    const user: MemoryUser = {
      id: crypto.randomUUID(),
      nickname: args.nickname
    }
    const credential: CredentialRow = {
      id: crypto.randomUUID(),
      userId: user.id,
      phone: args.phone,
      passwordHash: args.passwordHash,
      passwordSalt: args.passwordSalt,
      failedAttempts: 0,
      captchaSeed: null,
      lockedUntil: null
    }
    store.usersById.set(user.id, user)
    store.phoneToCredential.set(args.phone, credential)
    return {
      id: user.id,
      authUserId: `local_phone_${args.phone}`,
      nickname: user.nickname
    }
  }
}

export async function resetCredentialFailure(credentialId: string) {
  if (shouldUseMemoryStore()) {
    const store = getMemoryStore()
    for (const [phone, item] of store.phoneToCredential.entries()) {
      if (item.id === credentialId) {
        store.phoneToCredential.set(phone, {
          ...item,
          failedAttempts: 0,
          captchaSeed: null,
          lockedUntil: null
        })
      }
    }
    return
  }

  try {
    await prisma.userCredential.update({
      where: { id: credentialId },
      data: {
        failedAttempts: 0,
        captchaSeed: null,
        lockedUntil: null
      }
    })
  } catch (error) {
    if (!canFallbackToMemory(error)) throw error
    const store = getMemoryStore()
    for (const [phone, item] of store.phoneToCredential.entries()) {
      if (item.id === credentialId) {
        store.phoneToCredential.set(phone, {
          ...item,
          failedAttempts: 0,
          captchaSeed: null,
          lockedUntil: null
        })
      }
    }
  }
}

export async function incrementCredentialFailure(args: {
  credentialId: string
  nextFailedAttempts: number
  captchaSeed?: string | null
  lockedUntil?: Date | null
}) {
  if (shouldUseMemoryStore()) {
    const store = getMemoryStore()
    for (const [phone, item] of store.phoneToCredential.entries()) {
      if (item.id === args.credentialId) {
        store.phoneToCredential.set(phone, {
          ...item,
          failedAttempts: args.nextFailedAttempts,
          captchaSeed: args.captchaSeed ?? item.captchaSeed,
          lockedUntil: args.lockedUntil ?? item.lockedUntil
        })
      }
    }
    return
  }

  try {
    await prisma.userCredential.update({
      where: { id: args.credentialId },
      data: {
        failedAttempts: args.nextFailedAttempts,
        captchaSeed: args.captchaSeed ?? undefined,
        lockedUntil: args.lockedUntil ?? undefined
      }
    })
  } catch (error) {
    if (!canFallbackToMemory(error)) throw error
    const store = getMemoryStore()
    for (const [phone, item] of store.phoneToCredential.entries()) {
      if (item.id === args.credentialId) {
        store.phoneToCredential.set(phone, {
          ...item,
          failedAttempts: args.nextFailedAttempts,
          captchaSeed: args.captchaSeed ?? item.captchaSeed,
          lockedUntil: args.lockedUntil ?? item.lockedUntil
        })
      }
    }
  }
}

export async function saveLoginAttempt(args: {
  userId?: string
  phone: string
  success: boolean
  failureCode?: string
  ipAddress?: string
}) {
  if (shouldUseMemoryStore()) {
    return
  }

  try {
    await prisma.loginAttempt.create({
      data: {
        userId: args.userId,
        phone: args.phone,
        success: args.success,
        failureCode: args.failureCode,
        ipAddress: args.ipAddress
      }
    })
  } catch (error) {
    if (!canFallbackToMemory(error)) throw error
  }
}

export async function getUserBasicById(userId: string) {
  if (shouldUseMemoryStore()) {
    const store = getMemoryStore()
    const user = store.usersById.get(userId)
    return user ? { id: user.id, nickname: user.nickname } : null
  }

  try {
    return prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        nickname: true
      }
    })
  } catch (error) {
    if (!canFallbackToMemory(error)) throw error
    const store = getMemoryStore()
    const user = store.usersById.get(userId)
    return user ? { id: user.id, nickname: user.nickname } : null
  }
}
