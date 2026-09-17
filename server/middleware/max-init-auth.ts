/**
 * Max WebViews often drop session cookies (especially on IP / self-signed HTTPS).
 * When a request has no session but includes X-Max-Init-Data, validate and attach user.
 */
import { eq } from 'drizzle-orm'
import { getUserSession, setUserSession } from '#imports'
import type { SessionUser } from '#shared/types'
import { useDb } from '../db/client'
import { users } from '../db/schema'
import { toSessionUser } from '../utils/auth'
import { validateMaxInitData } from '../utils/maxAuth'

declare module 'h3' {
  interface H3EventContext {
    lexiUser?: SessionUser
  }
}

export default defineEventHandler(async (event) => {
  const path = getRequestURL(event).pathname
  if (!path.startsWith('/api/')) return
  if (path.startsWith('/api/auth/max')) return
  if (path.startsWith('/api/auth/features')) return
  if (path.startsWith('/api/auth/logout')) return
  if (path.startsWith('/api/cron/')) return
  if (path.startsWith('/api/max/')) return

  try {
    const session = await getUserSession(event)
    if (session?.user?.id && session.user.maxId) {
      event.context.lexiUser = session.user as SessionUser
      return
    }
  }
  catch {
    // continue — try initData
  }

  const rawHeader = getHeader(event, 'x-max-init-data')?.trim()
  if (!rawHeader) return

  let initData = rawHeader
  try {
    // Client may send encodeURIComponent(initData)
    if (rawHeader.includes('%')) {
      initData = decodeURIComponent(rawHeader)
    }
  }
  catch {
    initData = rawHeader
  }

  const config = useRuntimeConfig()
  const botToken = process.env.MAX_BOT_TOKEN || String(config.maxBotToken || '')
  if (!botToken) {
    console.error('[max-init-auth] MAX_BOT_TOKEN missing')
    return
  }

  try {
    const { user: maxUser } = validateMaxInitData(initData, botToken)
    const maxId = String(maxUser.id)
    const displayName = [maxUser.first_name, maxUser.last_name].filter(Boolean).join(' ')
      || maxUser.username
      || 'Ученик'
    const avatarUrl = maxUser.photo_url || null

    const db = useDb()
    const existing = await db.select().from(users).where(eq(users.maxId, maxId)).limit(1)
    let row = existing[0]
    if (row) {
      const [updated] = await db
        .update(users)
        .set({ displayName, avatarUrl })
        .where(eq(users.id, row.id))
        .returning()
      row = updated
    }
    else {
      const [created] = await db
        .insert(users)
        .values({
          maxId,
          displayName,
          avatarUrl,
          childName: 'Малышка',
        })
        .returning()
      row = created
    }

    const sessionUser = toSessionUser(row)
    event.context.lexiUser = sessionUser
    await setUserSession(event, { user: sessionUser })
  }
  catch (err) {
    console.error('[max-init-auth]', err)
  }
})
