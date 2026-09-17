/**
 * Max WebViews often drop session cookies (especially on IP / self-signed HTTPS).
 * When a request has no session but includes X-Max-Init-Data, validate and create one.
 */
import { eq } from 'drizzle-orm'
import { getUserSession, setUserSession } from '#imports'
import { useDb } from '../db/client'
import { users } from '../db/schema'
import { toSessionUser } from '../utils/auth'
import { validateMaxInitData } from '../utils/maxAuth'

export default defineEventHandler(async (event) => {
  const path = getRequestURL(event).pathname
  if (!path.startsWith('/api/')) return
  if (path.startsWith('/api/auth/max')) return
  if (path.startsWith('/api/auth/features')) return
  if (path.startsWith('/api/cron/')) return

  try {
    const session = await getUserSession(event)
    if (session?.user) return
  }
  catch {
    // continue — try initData
  }

  const initData = getHeader(event, 'x-max-init-data')?.trim()
  if (!initData) return

  const config = useRuntimeConfig()
  const botToken = process.env.MAX_BOT_TOKEN || String(config.maxBotToken || '')
  if (!botToken) return

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

    await setUserSession(event, { user: toSessionUser(row) })
  }
  catch (err) {
    console.error('[max-init-auth]', err)
  }
})
