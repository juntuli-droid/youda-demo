import { randomBytes, scryptSync, timingSafeEqual } from "crypto"

export function generatePasswordSalt() {
  return randomBytes(16).toString("hex")
}

export function hashPassword(password: string, salt: string) {
  return scryptSync(password, salt, 64).toString("hex")
}

export function verifyPassword(args: {
  plainPassword: string
  salt: string
  passwordHash: string
}) {
  const candidate = hashPassword(args.plainPassword, args.salt)
  const left = Buffer.from(candidate, "hex")
  const right = Buffer.from(args.passwordHash, "hex")
  if (left.length !== right.length) {
    return false
  }
  return timingSafeEqual(left, right)
}
