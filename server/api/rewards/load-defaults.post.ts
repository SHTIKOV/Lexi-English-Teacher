import { eq } from 'drizzle-orm'
import { useDb } from '../../db/client'
import { userRewards } from '../../db/schema'
import { requireUser } from '../../utils/auth'
import { getDefaultRewardTemplates, listUserRewards } from '../../utils/rewards'

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const body = await readBody<{ replace?: boolean }>(event).catch(() => ({} as { replace?: boolean }))
  const replace = body?.replace !== false

  const db = useDb()
  const defaults = getDefaultRewardTemplates()

  if (replace) {
    await db.delete(userRewards).where(eq(userRewards.userId, user.id))
  }
  else {
    const existing = await listUserRewards(user.id)
    if (existing.length > 0) {
      return { rewards: existing, loaded: false, reason: 'already-has-rewards' }
    }
  }

  if (defaults.length) {
    await db.insert(userRewards).values(
      defaults.map((r) => ({
        userId: user.id,
        words: r.words,
        title: r.title,
        emoji: r.emoji,
        description: r.description,
        details: r.details ?? null,
      })),
    )
  }

  const rewards = await listUserRewards(user.id)
  return { rewards, loaded: true }
})
