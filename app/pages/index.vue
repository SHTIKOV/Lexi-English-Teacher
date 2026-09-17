<script setup lang="ts">
const { user, clear } = useUserSession()
const { catalog, pending, refresh, rewards } = useCatalog()

await refresh()

async function logout() {
  await $fetch('/api/auth/logout', { method: 'POST' })
  await clear()
  await navigateTo('/login')
}

function go(path: string) {
  navigateTo(path)
}
</script>

<template>
  <div v-if="pending && !catalog" class="app-screen flex items-center justify-center">
    <p class="text-3xl animate-float">🌟</p>
  </div>
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
