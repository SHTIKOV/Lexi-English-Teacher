<script setup lang="ts">
import type { LessonStage, Word } from '#shared/types'
import lexiHappy from '~/assets/lexi-happy.png'

const QUIZ_PASS = 100
const PLAY_PASS = 90

const props = defineProps<{
  words: Word[]
  learnedBlocks: { words: Word[] }[]
  allWords: Word[]
  blockNumber?: number | null
  totalBlocks?: number | null
  stage: LessonStage
}>()

const emit = defineEmits<{
  complete: [stage: 'learn' | 'quiz' | 'play']
  restart: []
  back: []
}>()

const STAGE_LABEL: Record<LessonStage, string> = {
  learn: 'шаг 1: учим слова',
  quiz: 'шаг 2: проверка',
  play: 'шаг 3: игра',
  done: 'урок пройден',
}

const askResume = ref(props.stage !== 'learn')

function pickFromBlock(words: Word[]): Word[] {
  if (words.length <= 1) return words
  const count = Math.min(words.length, 1 + Math.round(Math.random()))
  return [...words].sort(() => Math.random() - 0.5).slice(0, count)
}

const playWords = computed(() => {
  const blocks = [...props.learnedBlocks.map((b) => b.words), props.words].filter((b) => b.length > 0)
  return blocks.flatMap(pickFromBlock)
})
</script>

<template>
  <div v-if="askResume" class="app-screen flex flex-col max-w-lg mx-auto">
    <div class="flex-1 flex flex-col items-center justify-center px-4 text-center">
      <img :src="lexiHappy" alt="Lexi" class="w-32 h-32 sm:w-40 sm:h-40 object-contain drop-shadow-lg mb-4">
      <h2 class="text-2xl sm:text-3xl font-extrabold text-purple-600 mb-2">
        Продолжить или заново?
      </h2>
      <p class="text-lg text-gray-600">
        Ты остановилась на этом:
        <span class="font-bold text-purple-500">{{ STAGE_LABEL[stage] }}</span>
      </p>
    </div>
    <div class="flex-shrink-0 app-screen-x app-screen-bottom pt-2 sm:pt-3 flex flex-col gap-2 sm:gap-3">
      <button
        class="w-full py-4 rounded-2xl text-lg font-bold text-white bg-gradient-to-r from-green-400 to-emerald-500 shadow-lg active:scale-95 transition-transform cursor-pointer"
        @click="askResume = false"
      >
        ▶️ Продолжить
      </button>
      <button
        class="w-full py-4 rounded-2xl text-lg font-bold text-white bg-gradient-to-r from-blue-400 to-purple-500 shadow-lg active:scale-95 transition-transform cursor-pointer"
        @click="() => { emit('restart'); askResume = false }"
      >
        🔄 Начать заново
      </button>
      <button
        class="w-full py-3 rounded-2xl text-lg font-bold text-gray-600 bg-white/80 shadow active:scale-95 transition-transform cursor-pointer"
        @click="emit('back')"
      >
        🏠 Главное меню
      </button>
    </div>
  </div>

  <LearnWords
    v-else-if="stage === 'learn'"
    :words="words"
    :block-number="blockNumber"
    :total-blocks="totalBlocks"
    @learned="emit('complete', 'learn')"
    @back="emit('back')"
  />

  <QuizPanel
    v-else-if="stage === 'quiz'"
    :words="words"
    :all-words="allWords"
    title="✅ Шаг 2: проверка"
    :pass-threshold="QUIZ_PASS"
    continue-label="🎮 Дальше: игра"
    @continue="emit('complete', 'quiz')"
    @back="emit('back')"
  />

  <QuizPanel
    v-else-if="stage === 'play'"
    :words="playWords"
    :all-words="allWords"
    title="🎮 Шаг 3: закрепляем"
    :pass-threshold="PLAY_PASS"
    continue-label="🎉 Урок пройден!"
    @continue="emit('complete', 'play')"
    @back="emit('back')"
  />

  <div v-else class="app-screen flex flex-col max-w-lg mx-auto">
    <div class="flex-1 flex flex-col items-center justify-center px-4 text-center">
      <Confetti />
      <img :src="lexiHappy" alt="Lexi радуется" class="w-40 h-40 sm:w-48 sm:h-48 object-contain drop-shadow-lg mb-4">
      <h2 class="text-2xl sm:text-3xl font-extrabold text-purple-600 mb-2">Урок пройден! 🎉</h2>
      <p class="text-lg text-gray-600">
        Ты выучила все слова блока, прошла проверку и игру.
      </p>
      <p class="text-base text-gray-500 mt-2">
        Слова уже в библиотеке — Лекси готовит новый блок!
      </p>
    </div>
    <div class="flex-shrink-0 app-screen-x app-screen-bottom pt-2 sm:pt-3">
      <button
        class="w-full py-4 rounded-2xl text-lg font-bold text-white bg-gradient-to-r from-pink-400 to-purple-500 shadow-lg active:scale-95 transition-transform cursor-pointer"
        @click="emit('back')"
      >
        🏠 Главное меню
      </button>
    </div>
  </div>
</template>
