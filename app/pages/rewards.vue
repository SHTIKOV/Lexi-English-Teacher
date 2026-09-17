<script setup lang="ts">
const { catalog, refresh } = useCatalog()
await refresh()

function goHome() {
  navigateTo('/')
}
</script>

<template>
  <RewardsPanel
    :learned-count="catalog?.learnedCount ?? 0"
    @back="goHome"
  />
</template>
