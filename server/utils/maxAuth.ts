import { createHmac, timingSafeEqual } from 'node:crypto'
import type { MaxInitUser } from '#shared/types'

const MAX_AUTH_AGE_SEC = 60 * 60 * 24 // 24 hours

export interface ValidatedMaxInitData {
  user: MaxInitUser
  authDate: number
  raw: Record<string, string>
}

/**
 * Validates Max mini-app initData (WebAppData) per:
 * https://dev.max.ru/docs/webapps/validation
 *
 * User identity is trusted only after HMAC check with bot token.
 * Client-supplied user ids without a valid hash are rejected.
 */
export function validateMaxInitData(initData: string, botToken: string): ValidatedMaxInitData {
  if (!initData?.trim() || !botToken) {
    throw createError({ statusCode: 401, statusMessage: 'Missing initData or bot token' })
  }

  const pairs = initData.split('&').map((part) => {
    const eq = part.indexOf('=')
    if (eq === -1) return [part, ''] as const
    return [part.slice(0, eq), part.slice(eq + 1)] as const
  })

  const hashPairs = pairs.filter(([k]) => k === 'hash')
  if (hashPairs.length !== 1) {
    throw createError({ statusCode: 401, statusMessage: 'Invalid initData hash' })
  }

  const originalHash = decodeURIComponent(hashPairs[0]![1])
  const decoded = pairs.map(([k, v]) => [k, decodeURIComponent(v)] as const)

  const launchParams = decoded
    .filter(([k]) => k !== 'hash')
    .slice()
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join('\n')

  // secret_key = HMAC_SHA256(key="WebAppData", data=botToken)
  const secretKey = createHmac('sha256', 'WebAppData').update(botToken).digest()
  const computedHash = createHmac('sha256', secretKey).update(launchParams).digest('hex')

  const a = Buffer.from(computedHash, 'utf8')
  const b = Buffer.from(originalHash, 'utf8')
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    throw createError({ statusCode: 401, statusMessage: 'Invalid initData signature' })
  }

  const map = Object.fromEntries(decoded.filter(([k]) => k !== 'hash'))
  const authDate = Number(map.auth_date)
  if (!Number.isFinite(authDate)) {
    throw createError({ statusCode: 401, statusMessage: 'Invalid auth_date' })
  }

  const now = Math.floor(Date.now() / 1000)
  if (authDate > now + 60 || now - authDate > MAX_AUTH_AGE_SEC) {
    throw createError({ statusCode: 401, statusMessage: 'initData expired' })
  }

  if (!map.user) {
    throw createError({ statusCode: 401, statusMessage: 'User missing in initData' })
  }

  let user: MaxInitUser
  try {
    user = JSON.parse(map.user) as MaxInitUser
  }
  catch {
    throw createError({ statusCode: 401, statusMessage: 'Invalid user JSON' })
  }

  if (!user?.id) {
    throw createError({ statusCode: 401, statusMessage: 'Invalid Max user id' })
  }

  return { user, authDate, raw: map }
}
