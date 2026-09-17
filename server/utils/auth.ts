import { eq } from 'drizzle-orm'
import { useDb } from '../db/client'
import { users } from '../db/schema'
import type { SessionUser } from '#shared/types'

export async function requireUser(event: Parameters<typeof requireUserSession>[0]) {
  const fromContext = event.context.lexiUser as SessionUser | undefined
  if (fromContext?.id && fromContext.maxId) {
    return fromContext
  }

  const session = await getUserSession(event)
  const user = session.user as SessionUser | undefined
  if (user?.id && user.maxId) {
    return user
  }

  throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
}

export async function getDbUser(userId: number) {
  const db = useDb()
  const [row] = await db.select().from(users).where(eq(users.id, userId)).limit(1)
  if (!row) {
    throw createError({ statusCode: 401, statusMessage: 'User not found' })
  }
  return row
}

export function toSessionUser(row: typeof users.$inferSelect): SessionUser {
  return {
    id: row.id,
    maxId: row.maxId,
    displayName: row.displayName,
    avatarUrl: row.avatarUrl,
    childName: row.childName,
    onboardingCompleted: Boolean(row.onboardingCompletedAt),
  }
}
