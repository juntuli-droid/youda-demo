import { beforeEach, describe, expect, it, vi } from "vitest"

vi.mock("../repositories/authRepository", () => ({
  createUserWithCredential: vi.fn(),
  findCredentialByPhone: vi.fn(),
  getUserBasicById: vi.fn(),
  incrementCredentialFailure: vi.fn(),
  resetCredentialFailure: vi.fn(),
  saveLoginAttempt: vi.fn()
}))

vi.mock("../security/password", () => ({
  generatePasswordSalt: vi.fn(),
  hashPassword: vi.fn(),
  verifyPassword: vi.fn()
}))

vi.mock("../security/token", () => ({
  signAuthToken: vi.fn()
}))

import { loginByPhone } from "./authService"
import {
  findCredentialByPhone,
  getUserBasicById,
  incrementCredentialFailure,
  resetCredentialFailure,
  saveLoginAttempt
} from "../repositories/authRepository"
import { verifyPassword } from "../security/password"
import { signAuthToken } from "../security/token"

describe("loginByPhone", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("支持正常登录", async () => {
    vi.mocked(findCredentialByPhone).mockResolvedValue({
      id: "cred_1",
      userId: "user_1",
      phone: "13800000000",
      passwordHash: "hash",
      passwordSalt: "salt",
      failedAttempts: 0,
      captchaSeed: null,
      lockedUntil: null
    })
    vi.mocked(verifyPassword).mockReturnValue(true)
    vi.mocked(getUserBasicById).mockResolvedValue({
      id: "user_1",
      nickname: "测试用户"
    })
    vi.mocked(signAuthToken).mockResolvedValue("token_1")

    const result = await loginByPhone({
      phone: "13800000000",
      password: "password123"
    })

    expect(result.accessToken).toBe("token_1")
    expect(result.profile.nickname).toBe("测试用户")
    expect(resetCredentialFailure).toHaveBeenCalledWith("cred_1")
  })

  it("用户不存在时返回错误", async () => {
    vi.mocked(findCredentialByPhone).mockResolvedValue(
      null as unknown as Awaited<ReturnType<typeof findCredentialByPhone>>
    )

    await expect(
      loginByPhone({
        phone: "13900000000",
        password: "password123"
      })
    ).rejects.toMatchObject({
      code: "AUTH_INVALID_CREDENTIALS"
    })

    expect(saveLoginAttempt).toHaveBeenCalled()
  })

  it("密码错误时累加失败次数", async () => {
    vi.mocked(findCredentialByPhone).mockResolvedValue({
      id: "cred_2",
      userId: "user_2",
      phone: "13700000000",
      passwordHash: "hash",
      passwordSalt: "salt",
      failedAttempts: 0,
      captchaSeed: null,
      lockedUntil: null
    })
    vi.mocked(verifyPassword).mockReturnValue(false)

    await expect(
      loginByPhone({
        phone: "13700000000",
        password: "wrong"
      })
    ).rejects.toMatchObject({
      code: "AUTH_INVALID_CREDENTIALS"
    })

    expect(incrementCredentialFailure).toHaveBeenCalledWith(
      expect.objectContaining({
        credentialId: "cred_2",
        nextFailedAttempts: 1
      })
    )
  })

  it("失败次数过高时要求验证码", async () => {
    vi.mocked(findCredentialByPhone).mockResolvedValue({
      id: "cred_3",
      userId: "user_3",
      phone: "13600000000",
      passwordHash: "hash",
      passwordSalt: "salt",
      failedAttempts: 3,
      captchaSeed: "2468",
      lockedUntil: null
    })

    await expect(
      loginByPhone({
        phone: "13600000000",
        password: "password123"
      })
    ).rejects.toMatchObject({
      code: "AUTH_CAPTCHA_REQUIRED",
      details: {
        captchaHint: "2468"
      }
    })
  })
})
