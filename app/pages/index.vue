<script setup lang="ts">
const { user, clear, fetch: fetchSession } = useUserSession()
const { catalog, pending, refresh, rewards } = useCatalog()
const { ensureAuth, isInsideMax, loadFeatures } = useMaxAuth()

const ready = ref(false)
const bootError = ref('')

onMounted(async () => {
  try {
    await loadFeatures()
    if (isInsideMax()) {
      await ensureAuth()
      await fetchSession()
    }
    await refresh()
    ready.value = true
  }
  catch (e: unknown) {
    const err = e as { data?: { statusMessage?: string }; statusMessage?: string; message?: string }
    bootError.value = err?.data?.statusMessage || err?.statusMessage || err?.message || 'Ошибка загрузки'
  }
})

const showOnboarding = computed(() => Boolean(user.value) && !user.value?.onboardingCompleted)

async function logout() {
  await $fetch('/api/auth/logout', { method: 'POST', headers: maxAuthHeaders() })
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
  <div v-if="bootError" class="app-screen flex flex-col items-center justify-center px-6 gap-3">
    <p class="text-red-500 font-bold text-center">{{ bootError }}</p>
    <button
      class="px-4 py-3 rounded-2xl font-extrabold text-white bg-gradient-to-r from-purple-400 to-pink-500"
      @click="() => { bootError = ''; ready = false; location.reload() }"
    >
      Попробовать снова
    </button>
  </div>
  <div v-else-if="!ready || (pending && !catalog)" class="app-screen flex items-center justify-center">
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
