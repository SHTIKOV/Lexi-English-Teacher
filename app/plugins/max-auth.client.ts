export default defineNuxtPlugin(async () => {
  if (!import.meta.client) return

  const { loggedIn, clear } = useUserSession()
  const {
    ensureAuth,
    isInsideMax,
    loadFeatures,
    testAuthEnabled,
    loginAsAnonymous,
    isTestOrAnonUser,
  } = useMaxAuth()

  await loadFeatures()

  if (isInsideMax()) {
    await ensureAuth()
    return
  }

  if (testAuthEnabled.value) {
    if (!loggedIn.value) {
      await loginAsAnonymous()
    }
    return
  }

  // Outside Max and test auth OFF: drop real Max sessions only
  if (loggedIn.value && !isTestOrAnonUser()) {
    await clear()
  }
})
