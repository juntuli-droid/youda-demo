import { rateLimited } from "./errors"

type Bucket = {
  count: number
  resetAt: number
}

const buckets = new Map<string, Bucket>()

export function assertRateLimit(args: {
  key: string
  limit: number
  windowMs: number
}) {
  const now = Date.now()
  const current = buckets.get(args.key)

  if (!current || current.resetAt <= now) {
    buckets.set(args.key, {
      count: 1,
      resetAt: now + args.windowMs
    })
    return
  }

  if (current.count >= args.limit) {
    throw rateLimited()
  }

  current.count += 1
  buckets.set(args.key, current)
}
