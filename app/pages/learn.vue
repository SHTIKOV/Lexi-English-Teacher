<script setup lang="ts">
import type { Word } from '#shared/types'

const { catalog, refresh, completeStage, resetProgress } = useCatalog()
const headers = maxAuthHeaders()

const learnedBlocks = ref<{ id: number; title: string; words: Word[] }[]>([])
const allWords = ref<Word[]>([])

await refresh()

const [{ blocks }, wordsPayload] = await Promise.all([
  $fetch<{ blocks: { id: number; title: string; words: Word[] }[] }>('/api/catalog/learned', { headers }),
  $fetch<{ all: Word[] }>('/api/words/all', { headers }),
])
learnedBlocks.value = blocks
allWords.value = wordsPayload.all

const block = computed(() => catalog.value?.currentBlock ?? null)
const stage = computed(() => catalog.value?.stage ?? 'learn')

async function onComplete(stageName: 'learn' | 'quiz' | 'play') {
  await completeStage(stageName)
  if (stageName === 'play') {
    const h = maxAuthHeaders()
    const learned = await $fetch<{ blocks: typeof learnedBlocks.value }>('/api/catalog/learned', { headers: h })
    learnedBlocks.value = learned.blocks
    const words = await $fetch<{ all: Word[] }>('/api/words/all', { headers: h })
    allWords.value = words.all
  }
}

async function onRestart() {
  await resetProgress()
}

function goHome() {
  navigateTo('/')
}
</script>

<template>
  <div v-if="!block" class="app-screen flex flex-col max-w-lg mx-auto">
    <div class="flex-1 flex flex-col items-center justify-center px-4 text-center">
      <p class="text-5xl mb-4">🎉</p>
      <h2 class="text-2xl font-extrabold text-purple-600 mb-2">Все блоки пройдены!</h2>
      <p class="text-gray-600">Ты выучила весь словарь. Горжусь тобой!</p>
    </div>
    <div class="flex-shrink-0 app-screen-x app-screen-bottom">
      <button
        class="w-full py-4 rounded-2xl text-lg font-bold text-white bg-gradient-to-r from-pink-400 to-purple-500 shadow-lg"
        @click="goHome"
      >
        🏠 Главное меню
      </button>
    </div>
  </div>
  <LessonFlow
    v-else
    :words="block.words"
    :learned-blocks="learnedBlocks"
    :all-words="allWords"
    :block-number="block.blockNumber"
    :total-blocks="block.totalBlocks"
    :stage="stage"
    @complete="onComplete"
    @restart="onRestart"
    @back="goHome"
  />
</template>
