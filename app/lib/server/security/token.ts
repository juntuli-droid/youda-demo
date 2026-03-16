import { SignJWT, jwtVerify } from "jose"

type AuthPayload = {
  sub: string
  phone: string
}

const issuer = "syncup-auth"
const audience = "syncup-client"

function getSecret() {
  return new TextEncoder().encode(
    process.env.AUTH_JWT_SECRET || "syncup-dev-jwt-secret"
  )
}

export async function signAuthToken(payload: AuthPayload) {
  return new SignJWT({ phone: payload.phone })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuer(issuer)
    .setAudience(audience)
    .setIssuedAt()
    .setExpirationTime("2h")
    .sign(getSecret())
}

export async function verifyAuthToken(token: string) {
  const result = await jwtVerify(token, getSecret(), {
    issuer,
    audience
  })

  return {
    sub: result.payload.sub || "",
    phone: typeof result.payload.phone === "string" ? result.payload.phone : ""
  }
}
