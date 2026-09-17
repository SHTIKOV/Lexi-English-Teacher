import { eq } from 'drizzle-orm'
import { useDb } from '../db/client'
import { users } from '../db/schema'
import type { SessionUser } from '#shared/types'

export async function requireUser(event: Parameters<typeof requireUserSession>[0]) {
  const session = await requireUserSession(event)
  const user = session.user as SessionUser | undefined
  if (!user?.id || !user.maxId) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }
  return user
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
