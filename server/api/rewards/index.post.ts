import { useDb } from '../../db/client'
import { userRewards } from '../../db/schema'
import { requireUser } from '../../utils/auth'
import { parseRewardInput, toReward } from '../../utils/rewards'

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const body = await readBody(event)
  const data = parseRewardInput(body ?? {})

  const db = useDb()
  try {
    const [row] = await db
      .insert(userRewards)
      .values({
        userId: user.id,
        ...data,
      })
      .returning()
    return { reward: toReward(row) }
  }
  catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    if (msg.includes('user_rewards_user_words_uidx') || msg.includes('unique')) {
      throw createError({ statusCode: 409, statusMessage: 'Подарок с таким числом слов уже есть' })
    }
    throw err
  }
})
