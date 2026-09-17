export default defineNuxtRouteMiddleware(async (to) => {
  const { loggedIn } = useUserSession()
  const {
    ensureAuth,
    isInsideMax,
    testAuthEnabled,
    loginAsAnonymous,
    loadFeatures,
  } = useMaxAuth()

  if (import.meta.client) {
    await loadFeatures()
  }

  if (to.path === '/login') {
    if (loggedIn.value) return navigateTo('/')
    if (import.meta.client && isInsideMax()) {
      const ok = await ensureAuth()
      if (ok) return navigateTo('/')
    }
    if (import.meta.client && testAuthEnabled.value && !isInsideMax()) {
      const ok = await loginAsAnonymous()
      if (ok) return navigateTo('/')
    }
    return
  }

  if (loggedIn.value) return

  if (import.meta.client) {
    if (isInsideMax()) {
      const ok = await ensureAuth()
      if (ok) return
    }
    else if (testAuthEnabled.value) {
      const ok = await loginAsAnonymous()
      if (ok) return
    }
  }

  // SSR: anon-auth server middleware should already set the session.
  if (import.meta.server && testAuthEnabled.value) {
    return
  }

  return navigateTo('/login')
})
