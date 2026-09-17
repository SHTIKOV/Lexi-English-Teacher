import { getUserSession } from '#imports'
import { isTestAuthEnabled, loginTestUser } from '../utils/testLogin'

/**
 * When MAX_TEST_AUTH=1, every request without a session gets an anonymous guest.
 * Allows browser testing without Max messenger.
 */
export default defineEventHandler(async (event) => {
  // Skip static assets
  const path = getRequestURL(event).pathname
  if (path.startsWith('/_nuxt') || path.startsWith('/images') || path.includes('.')) {
    return
  }

  if (!isTestAuthEnabled()) return

  try {
    const session = await getUserSession(event)
    if (session?.user) return
    await loginTestUser(event, 'anon')
  }
  catch (err) {
    console.error('[anon-auth]', err)
  }
})
