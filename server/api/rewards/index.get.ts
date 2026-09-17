import { listUserRewards } from '../../utils/rewards'
import { requireUser } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const rewards = await listUserRewards(user.id)
  return { rewards }
})
