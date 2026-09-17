import { eq } from 'drizzle-orm'
import { useDb } from '../../db/client'
import { users } from '../../db/schema'
import { toSessionUser } from '../../utils/auth'

function isTruthy(v: unknown) {
  return v === true || v === '1' || v === 'true'
}

/** @deprecated use /api/auth/test-login — kept for compatibility */
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const bypass = isTruthy(process.env.MAX_DEV_BYPASS)
    || isTruthy(process.env.MAX_TEST_AUTH)
    || isTruthy(config.maxDevBypass)
    || isTruthy(config.maxTestAuth)
  if (!bypass) {
    throw createError({ statusCode: 403, statusMessage: 'Dev bypass disabled' })
  }

  const db = useDb()
  const maxId = 'test-user'
  const existing = await db.select().from(users).where(eq(users.maxId, maxId)).limit(1)

  let row = existing[0]
  if (!row) {
    const [created] = await db
      .insert(users)
      .values({
        maxId,
        displayName: 'Тестовый ученик',
        childName: 'Малышка',
      })
      .returning()
    row = created
  }

  await setUserSession(event, { user: toSessionUser(row) })
  return { user: toSessionUser(row) }
})
