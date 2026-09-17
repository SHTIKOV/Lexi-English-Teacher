<script setup lang="ts">
const { catalog, refresh, rewards } = useCatalog()
await refresh()

function goHome() {
  navigateTo('/')
}

async function onChanged() {
  await refresh()
}
</script>

<template>
  <RewardsPanel
    :learned-count="catalog?.learnedCount ?? 0"
    :rewards="rewards"
    @back="goHome"
    @changed="onChanged"
  />
</template>
