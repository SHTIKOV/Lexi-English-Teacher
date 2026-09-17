import { eq } from 'drizzle-orm'
import { useDb } from '../../db/client'
import { users } from '../../db/schema'
import { requireUser, toSessionUser } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  const sessionUser = await requireUser(event)
  const db = useDb()

  const [updated] = await db
    .update(users)
    .set({ onboardingCompletedAt: new Date() })
    .where(eq(users.id, sessionUser.id))
    .returning()

  if (!updated) {
    throw createError({ statusCode: 404, statusMessage: 'User not found' })
  }

  const user = toSessionUser(updated)
  await setUserSession(event, { user })
  return { user }
})
