<script setup lang="ts">
import type { Word } from '#shared/types'

const { catalog, refresh } = useCatalog()
await refresh()

const wordsPayload = await $fetch<{ all: Word[]; remaining: Word[] }>('/api/words/all')
const words = computed(() => catalog.value?.currentBlock?.words ?? wordsPayload.remaining.slice(0, 20))
const allWords = computed(() => wordsPayload.all)

function goHome() {
  navigateTo('/')
}
</script>

<template>
  <QuizPanel
    :words="words"
    :all-words="allWords"
    title="✅ Проверка знаний"
    @back="goHome"
  />
</template>
