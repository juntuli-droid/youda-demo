import {
  accountLocked,
  badRequest,
  captchaRequired,
  conflict,
  invalidCredentials
} from "../errors"
import {
  createUserWithCredential,
  findCredentialByPhone,
  getUserBasicById,
  incrementCredentialFailure,
  resetCredentialFailure,
  saveLoginAttempt
} from "../repositories/authRepository"
import {
  generatePasswordSalt,
  hashPassword,
  verifyPassword
} from "../security/password"
import { signAuthToken } from "../security/token"

const CAPTCHA_THRESHOLD = 3
const LOCK_THRESHOLD = 5
const LOCK_MINUTES = 10

function createCaptchaSeed() {
  return String(Math.floor(1000 + Math.random() * 9000))
}

export async function registerByPhone(args: {
  nickname: string
  phone: string
  password: string
  confirmPassword: string
}) {
  if (args.password !== args.confirmPassword) {
    throw badRequest("两次输入的密码不一致")
  }

  const exists = await findCredentialByPhone(args.phone)
  if (exists) {
    throw conflict("该手机号已注册")
  }

  const passwordSalt = generatePasswordSalt()
  const passwordHash = hashPassword(args.password, passwordSalt)
  const user = await createUserWithCredential({
    phone: args.phone,
    nickname: args.nickname,
    passwordHash,
    passwordSalt
  })
  const accessToken = await signAuthToken({
    sub: user.id,
    phone: args.phone
  })

  await saveLoginAttempt({
    userId: user.id,
    phone: args.phone,
    success: true
  })
  console.info(`[auth] register_success phone=${args.phone} userId=${user.id}`)

  return {
    userId: user.id,
    accessToken,
    tokenType: "Bearer",
    profile: {
      nickname: args.nickname,
      phone: args.phone
    }
  }
}

export async function loginByPhone(args: {
  phone: string
  password: string
  captchaAnswer?: string
  ipAddress?: string
}) {
  const credential = await findCredentialByPhone(args.phone)
  if (!credential) {
    await saveLoginAttempt({
      phone: args.phone,
      success: false,
      failureCode: "USER_NOT_FOUND",
      ipAddress: args.ipAddress
    })
    console.warn(`[auth] login_failed phone=${args.phone} reason=user_not_found`)
    throw invalidCredentials()
  }

  const now = new Date()
  if (credential.lockedUntil && credential.lockedUntil > now) {
    await saveLoginAttempt({
      userId: credential.userId,
      phone: args.phone,
      success: false,
      failureCode: "ACCOUNT_LOCKED",
      ipAddress: args.ipAddress
    })
    throw accountLocked({
      lockedUntil: credential.lockedUntil.toISOString()
    })
  }

  if (credential.failedAttempts >= CAPTCHA_THRESHOLD) {
    const expected = credential.captchaSeed || createCaptchaSeed()
    if (!credential.captchaSeed) {
      await incrementCredentialFailure({
        credentialId: credential.id,
        nextFailedAttempts: credential.failedAttempts,
        captchaSeed: expected,
        lockedUntil: credential.lockedUntil
      })
    }

    if (!args.captchaAnswer || args.captchaAnswer !== expected) {
      await saveLoginAttempt({
        userId: credential.userId,
        phone: args.phone,
        success: false,
        failureCode: "CAPTCHA_REQUIRED",
        ipAddress: args.ipAddress
      })
      throw captchaRequired({
        captchaHint: expected
      })
    }
  }

  const passwordOk = verifyPassword({
    plainPassword: args.password,
    salt: credential.passwordSalt,
    passwordHash: credential.passwordHash
  })

  if (!passwordOk) {
    const nextFailedAttempts = credential.failedAttempts + 1
    const shouldLock = nextFailedAttempts >= LOCK_THRESHOLD
    const lockedUntil = shouldLock
      ? new Date(Date.now() + LOCK_MINUTES * 60 * 1000)
      : null
    const captchaSeed =
      nextFailedAttempts >= CAPTCHA_THRESHOLD
        ? credential.captchaSeed || createCaptchaSeed()
        : null

    await incrementCredentialFailure({
      credentialId: credential.id,
      nextFailedAttempts,
      captchaSeed,
      lockedUntil
    })

    await saveLoginAttempt({
      userId: credential.userId,
      phone: args.phone,
      success: false,
      failureCode: shouldLock ? "ACCOUNT_LOCKED" : "PASSWORD_INCORRECT",
      ipAddress: args.ipAddress
    })
    console.warn(
      `[auth] login_failed phone=${args.phone} reason=password_incorrect failed=${nextFailedAttempts}`
    )

    if (shouldLock) {
      throw accountLocked({
        lockedUntil: lockedUntil?.toISOString() || ""
      })
    }

    if (nextFailedAttempts >= CAPTCHA_THRESHOLD) {
      throw captchaRequired({
        captchaHint: captchaSeed
      })
    }

    throw invalidCredentials()
  }

  await resetCredentialFailure(credential.id)
  const user = await getUserBasicById(credential.userId)
  const accessToken = await signAuthToken({
    sub: credential.userId,
    phone: args.phone
  })
  await saveLoginAttempt({
    userId: credential.userId,
    phone: args.phone,
    success: true,
    ipAddress: args.ipAddress
  })
  console.info(`[auth] login_success phone=${args.phone} userId=${credential.userId}`)

  return {
    userId: credential.userId,
    accessToken,
    tokenType: "Bearer",
    profile: {
      nickname: user?.nickname || "玩家",
      phone: args.phone
    }
  }
}
