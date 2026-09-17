import { eq } from 'drizzle-orm'
import { useDb } from '../../db/client'
import { users } from '../../db/schema'
import { toSessionUser } from '../../utils/auth'
import { validateMaxInitData } from '../../utils/maxAuth'

export default defineEventHandler(async (event) => {
  const body = await readBody<{ initData?: string }>(event)
  const config = useRuntimeConfig()
  const botToken = process.env.MAX_BOT_TOKEN || (config.maxBotToken as string)

  if (!botToken) {
    throw createError({
      statusCode: 503,
      statusMessage: 'MAX_BOT_TOKEN is not configured',
    })
  }

  const initData = body?.initData?.trim()
  if (!initData) {
    throw createError({ statusCode: 400, statusMessage: 'initData required' })
  }

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

  await setUserSession(event, {
    user: toSessionUser(row),
  })

  return { user: toSessionUser(row) }
})
