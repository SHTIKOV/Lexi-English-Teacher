function isTruthy(v: unknown) {
  return v === true || v === '1' || v === 'true'
}

export function useMaxAuth() {
  const { loggedIn, user, fetch: fetchSession } = useUserSession()
  const status = useState<'idle' | 'loading' | 'ready' | 'outside' | 'error'>('max-auth-status', () => 'idle')
  const errorMessage = useState<string>('max-auth-error', () => '')
  const testAuthEnabled = useState<boolean>('max-test-auth-enabled', () => false)
  const featuresLoaded = useState<boolean>('max-features-loaded', () => false)
  const config = useRuntimeConfig()

  async function loadFeatures() {
    if (featuresLoaded.value) return testAuthEnabled.value
    try {
      const features = await $fetch<{ testAuth: boolean }>('/api/auth/features')
      testAuthEnabled.value = Boolean(features.testAuth)
    }
    catch {
      // Fallback to public runtime config / defaults
      testAuthEnabled.value = isTruthy(config.public.maxTestAuth) || isTruthy(config.public.maxDevBypass)
    }
    featuresLoaded.value = true
    return testAuthEnabled.value
  }

  function isInsideMax(): boolean {
    if (!import.meta.client) return false
    const wa = window.WebApp
    return Boolean(wa && typeof wa.initData === 'string' && wa.initData.length > 0)
  }

  function isTestOrAnonUser() {
    const maxId = user.value?.maxId || ''
    return maxId === 'anon-guest' || maxId.startsWith('test-') || maxId.startsWith('anon-')
  }

  async function loginAsTest(preset: 'default' | '1' | '2' | 'anon' = 'anon') {
    status.value = 'loading'
    errorMessage.value = ''
    try {
      await $fetch('/api/auth/test-login', {
        method: 'POST',
        body: { preset },
      })
      await fetchSession()
      status.value = 'ready'
      return true
    }
    catch (e: unknown) {
      const err = e as { data?: { statusMessage?: string }; statusMessage?: string }
      errorMessage.value = err?.data?.statusMessage || err?.statusMessage || 'Тестовый вход недоступен'
      status.value = 'error'
      return false
    }
  }

  async function loginAsAnonymous() {
    return loginAsTest('anon')
  }

  async function loginFromMax() {
    status.value = 'loading'
    errorMessage.value = ''

    if (!import.meta.client) return false

    let attempts = 0
    while (!window.WebApp && attempts < 20) {
      await new Promise((r) => setTimeout(r, 50))
      attempts++
    }

    const initData = window.WebApp?.initData
    if (!initData) {
      status.value = 'outside'
      errorMessage.value = 'Открой Lexi внутри мессенджера MAX'
      return false
    }

    try {
      window.WebApp?.ready?.()
      window.WebApp?.expand?.()
      await $fetch('/api/auth/max', {
        method: 'POST',
        body: { initData },
      })
      await fetchSession()
      if (!loggedIn.value) {
        // Cookie may be blocked; header-based auth will cover subsequent API calls.
        // Re-check once more after a tick.
        await new Promise((r) => setTimeout(r, 50))
        await fetchSession()
      }
      status.value = 'ready'
      return true
    }
    catch (e: unknown) {
      const err = e as { data?: { statusMessage?: string }; statusMessage?: string }
      errorMessage.value = err?.data?.statusMessage || err?.statusMessage || 'Не удалось войти через MAX'
      status.value = 'error'
      return false
    }
  }

  async function ensureAuth() {
    if (loggedIn.value) {
      status.value = 'ready'
      return true
    }
    if (isInsideMax()) {
      return loginFromMax()
    }
    await loadFeatures()
    if (testAuthEnabled.value) {
      return loginAsAnonymous()
    }
    return false
  }

  return {
    status,
    errorMessage,
    loggedIn,
    user,
    isInsideMax,
    isTestOrAnonUser,
    loginFromMax,
    loginAsTest,
    loginAsAnonymous,
    ensureAuth,
    loadFeatures,
    testAuthEnabled,
    featuresLoaded,
    devBypass: testAuthEnabled,
  }
}
