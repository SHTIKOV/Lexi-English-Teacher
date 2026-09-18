import { requireUser } from '../../utils/auth'
import { buildLeaderboard } from '../../utils/leaderboard'

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  return buildLeaderboard(user.id)
})
