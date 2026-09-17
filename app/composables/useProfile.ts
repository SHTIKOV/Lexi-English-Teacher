import type { SessionUser } from '#shared/types'
import { maxAuthHeaders } from '~/utils/maxHeaders'

/**
 * Profile from API (with Max initData) — cookies often missing in Max WebView,
 * so useUserSession alone is not enough for onboarding checks.
 */
export function useProfile() {
  const profile = useState<SessionUser | null>('lexi-profile', () => null)
  const { fetch: fetchSession } = useUserSession()

  async function refreshProfile() {
    const res = await $fetch<{ user: SessionUser | null }>('/api/auth/me', {
      headers: maxAuthHeaders(),
    })
    profile.value = res.user
    // Best-effort sync cookie session (may no-op in WebView)
    try {
      await fetchSession()
    }
    catch {
      // ignore
    }
    return profile.value
  }

  function setProfile(user: SessionUser | null) {
    profile.value = user
  }

  return {
    profile,
    refreshProfile,
    setProfile,
  }
}
