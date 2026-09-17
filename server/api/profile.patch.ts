import { eq } from 'drizzle-orm'
import { useDb } from '../db/client'
import { users } from '../db/schema'
import { requireUser, toSessionUser } from '../utils/auth'

export default defineEventHandler(async (event) => {
  const sessionUser = await requireUser(event)
  const body = await readBody<{ childName?: string }>(event)
  const childName = body.childName?.trim()
  if (!childName || childName.length > 40) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid childName' })
  }

  const db = useDb()
  const [updated] = await db
    .update(users)
    .set({ childName })
    .where(eq(users.id, sessionUser.id))
    .returning()

  await setUserSession(event, { user: toSessionUser(updated) })
  return { user: toSessionUser(updated) }
})
