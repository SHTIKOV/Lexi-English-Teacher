<script setup lang="ts">
import type { Word } from '#shared/types'

const headers = maxAuthHeaders()
const [learned, upcoming] = await Promise.all([
  $fetch<{ blocks: { id: number; title: string; words: Word[] }[] }>('/api/catalog/learned', { headers }),
  $fetch<{ blocks: { id: number; title: string; words: Word[] }[] }>('/api/catalog/upcoming?limit=50', { headers }),
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
