import { getDbUser, toSessionUser } from '../../utils/auth'
import type { SessionUser } from '#shared/types'

export default defineEventHandler(async (event) => {
  const fromContext = event.context.lexiUser as SessionUser | undefined
  if (fromContext?.id) {
    try {
      const row = await getDbUser(fromContext.id)
      const user = toSessionUser(row)
      await setUserSession(event, { user })
      return { user }
    }
    catch {
      // fall through
    }
  }

  const session = await getUserSession(event)
  const sessionUser = session.user as SessionUser | undefined
  if (!sessionUser?.id) {
    return { user: null }
  }

  try {
    const row = await getDbUser(sessionUser.id)
    const user = toSessionUser(row)
    await setUserSession(event, { user })
    return { user }
  }
  catch {
    // Stale cookie after user delete
    await clearUserSession(event)
    return { user: null }
  }
})
