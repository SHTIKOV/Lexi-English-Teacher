import { and, eq } from 'drizzle-orm'
import { useDb } from '../../db/client'
import { userRewards } from '../../db/schema'
import { requireUser } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const id = Number(getRouterParam(event, 'id'))
  if (!Number.isInteger(id) || id < 1) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid id' })
  }

  const db = useDb()
  const deleted = await db
    .delete(userRewards)
    .where(and(eq(userRewards.id, id), eq(userRewards.userId, user.id)))
    .returning({ id: userRewards.id })

  if (!deleted.length) {
    throw createError({ statusCode: 404, statusMessage: 'Reward not found' })
  }

  return { ok: true }
})
