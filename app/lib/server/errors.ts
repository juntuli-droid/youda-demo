export class ApiError extends Error {
  status: number
  code: string
  details?: unknown

  constructor(status: number, code: string, message: string, details?: unknown) {
    super(message)
    this.status = status
    this.code = code
    this.details = details
  }
}

export function badRequest(message: string, details?: unknown) {
  return new ApiError(400, "VAL_400", message, details)
}

export function unauthorized(message = "未登录或会话已失效") {
  return new ApiError(401, "AUTH_401", message)
}

export function forbidden(message = "无权限访问该资源") {
  return new ApiError(403, "PERM_403", message)
}

export function notFound(message = "资源不存在") {
  return new ApiError(404, "BIZ_404", message)
}

export function rateLimited(message = "请求过于频繁，请稍后再试") {
  return new ApiError(429, "RATE_429", message)
}

export function invalidCredentials(message = "手机号或密码不正确") {
  return new ApiError(401, "AUTH_INVALID_CREDENTIALS", message)
}

export function captchaRequired(details?: unknown) {
  return new ApiError(429, "AUTH_CAPTCHA_REQUIRED", "请先完成验证码校验", details)
}

export function accountLocked(details?: unknown) {
  return new ApiError(429, "AUTH_ACCOUNT_LOCKED", "登录失败次数过多，请稍后重试", details)
}

export function conflict(message = "资源冲突") {
  return new ApiError(409, "BIZ_CONFLICT", message)
}
