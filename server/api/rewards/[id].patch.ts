import { and, eq } from 'drizzle-orm'
import { useDb } from '../../db/client'
import { userRewards } from '../../db/schema'
import { requireUser } from '../../utils/auth'
import { parseRewardInput, toReward } from '../../utils/rewards'

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const id = Number(getRouterParam(event, 'id'))
  if (!Number.isInteger(id) || id < 1) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid id' })
  }

  const body = await readBody(event)
  const data = parseRewardInput(body ?? {})
  const db = useDb()

  try {
    const [row] = await db
      .update(userRewards)
      .set(data)
      .where(and(eq(userRewards.id, id), eq(userRewards.userId, user.id)))
      .returning()

    if (!row) {
      throw createError({ statusCode: 404, statusMessage: 'Reward not found' })
    }
    return { reward: toReward(row) }
  }
  catch (err: unknown) {
    if (err && typeof err === 'object' && 'statusCode' in err) throw err
    const msg = err instanceof Error ? err.message : String(err)
    if (msg.includes('user_rewards_user_words_uidx') || msg.includes('unique')) {
      throw createError({ statusCode: 409, statusMessage: 'Подарок с таким числом слов уже есть' })
    }
    throw err
  }
})
