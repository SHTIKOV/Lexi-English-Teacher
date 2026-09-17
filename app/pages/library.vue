<script setup lang="ts">
import type { Word } from '#shared/types'

const [learned, upcoming] = await Promise.all([
  $fetch<{ blocks: { id: number; title: string; words: Word[] }[] }>('/api/catalog/learned'),
  $fetch<{ blocks: { id: number; title: string; words: Word[] }[] }>('/api/catalog/upcoming?limit=50'),
])

function goHome() {
  navigateTo('/')
}
</script>

<template>
  <LibraryPanel
    :learned-blocks="learned.blocks"
    :upcoming-blocks="upcoming.blocks"
    @back="goHome"
  />
</template>
