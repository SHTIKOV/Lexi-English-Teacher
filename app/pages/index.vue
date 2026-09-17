<script setup lang="ts">
const { user, clear, fetch: fetchSession } = useUserSession()
const { catalog, pending, refresh, rewards } = useCatalog()

await refresh()

const showOnboarding = computed(() => Boolean(user.value) && !user.value?.onboardingCompleted)

async function logout() {
  await $fetch('/api/auth/logout', { method: 'POST' })
  await clear()
  await navigateTo('/login')
}

function go(path: string) {
  navigateTo(path)
}

async function onOnboardingDone() {
  await fetchSession()
  await refresh()
}
</script>

<template>
  <div v-if="pending && !catalog" class="app-screen flex items-center justify-center">
    <p class="text-3xl animate-float">🌟</p>
  </div>
  <template v-else>
    <Onboarding
      v-if="showOnboarding"
      @done="onOnboardingDone"
    />
    <HomeScreen
      v-else
      :child-name="user?.childName || 'Малышка'"
      :learned-count="catalog?.learnedCount ?? 0"
      :stage="catalog?.stage ?? 'learn'"
      :rewards="rewards"
      @navigate="go"
      @logout="logout"
    />
  </template>
</template>
