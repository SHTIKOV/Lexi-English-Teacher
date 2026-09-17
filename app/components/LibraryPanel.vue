<script setup lang="ts">
import type { Word } from '#shared/types'

defineProps<{
  learnedBlocks: { id: number; title: string; words: Word[] }[]
  upcomingBlocks: { id: number; title: string; words: Word[] }[]
}>()

const emit = defineEmits<{ back: [] }>()

function wordsLabel(count: number): string {
  const mod10 = count % 10
  const mod100 = count % 100
  if (mod10 === 1 && mod100 !== 11) return 'слово'
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return 'слова'
  return 'слов'
}

function blocksLabel(count: number): string {
  const mod10 = count % 10
  const mod100 = count % 100
  if (mod10 === 1 && mod100 !== 11) return 'блок'
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return 'блока'
  return 'блоков'
}

function learnedCount(blocks: { words: Word[] }[]) {
  return blocks.reduce((sum, b) => sum + b.words.length, 0)
}
</script>

<template>
  <div class="app-screen flex flex-col max-w-lg mx-auto">
    <div class="flex-shrink-0 app-screen-x pt-3 sm:pt-4 pb-2 text-center">
      <h2 class="text-xl sm:text-3xl font-extrabold text-indigo-600">📖 Моя библиотека</h2>
      <div class="mt-2 bg-white/70 rounded-2xl p-3 shadow-md">
        <div class="grid grid-cols-3 gap-2 text-center">
          <div>
            <p class="text-lg sm:text-xl font-extrabold text-emerald-600">{{ learnedCount(learnedBlocks) }}</p>
            <p class="text-[10px] sm:text-xs text-gray-500 font-bold">выучено</p>
          </div>
          <div>
            <p class="text-lg sm:text-xl font-extrabold text-amber-600">{{ learnedCount(upcomingBlocks) }}</p>
            <p class="text-[10px] sm:text-xs text-gray-500 font-bold">впереди</p>
          </div>
          <div>
            <p class="text-lg sm:text-xl font-extrabold text-indigo-600">
              {{ learnedCount(learnedBlocks) + learnedCount(upcomingBlocks) }}
            </p>
            <p class="text-[10px] sm:text-xs text-gray-500 font-bold">всего</p>
          </div>
        </div>
        <p class="text-center text-xs text-gray-500 mt-2">
          {{ learnedBlocks.length }} {{ blocksLabel(learnedBlocks.length) }} выучено ·
          {{ upcomingBlocks.length }} {{ blocksLabel(upcomingBlocks.length) }} впереди
        </p>
      </div>
    </div>

    <div class="flex-1 overflow-y-auto app-screen-x min-h-0 overscroll-contain">
      <div class="flex flex-col gap-5 py-2 pb-3">
        <div class="flex flex-col gap-3">
          <div class="flex items-center gap-2 px-1">
            <span class="text-sm font-extrabold text-emerald-700 bg-emerald-100 rounded-full px-3 py-1">
              ✅ Выученные
            </span>
            <span class="text-xs text-gray-400">
              {{ learnedCount(learnedBlocks) }} {{ wordsLabel(learnedCount(learnedBlocks)) }}
            </span>
          </div>

          <p v-if="learnedBlocks.length === 0" class="text-center text-sm text-gray-400 py-4">
            Пока нет выученных слов
          </p>
          <section
            v-for="(block, blockIndex) in learnedBlocks"
            :key="`learned-${block.id}`"
            class="flex flex-col gap-2"
          >
            <div class="flex items-center justify-between gap-2 px-1">
              <h3 class="text-base sm:text-lg font-extrabold text-emerald-700">
                {{ blockIndex + 1 }}. {{ block.title }}
              </h3>
              <span class="text-xs sm:text-sm font-bold rounded-full px-2.5 py-0.5 text-emerald-700 bg-emerald-50">
                {{ block.words.length }} {{ wordsLabel(block.words.length) }}
              </span>
            </div>
            <div class="flex flex-col gap-1.5">
              <div
                v-for="(word, i) in block.words"
                :key="`${block.id}-${word.en}-${i}`"
                class="rounded-2xl px-3 py-2 sm:px-4 sm:py-2.5 shadow-md flex items-center gap-3 bg-white/80"
              >
                <span class="flex-shrink-0 w-6 h-6 sm:w-7 sm:h-7 rounded-full text-[10px] sm:text-xs font-extrabold flex items-center justify-center bg-emerald-100 text-emerald-700">✓</span>
                <div class="flex-1 min-w-0">
                  <p class="text-sm sm:text-base font-extrabold capitalize truncate text-blue-500">{{ word.en }}</p>
                  <p class="text-[11px] sm:text-xs font-medium truncate text-purple-400">[ {{ word.transcription }} ]</p>
                </div>
                <p class="flex-shrink-0 text-sm sm:text-base font-bold text-right text-gray-700">{{ word.ru }}</p>
              </div>
            </div>
          </section>
        </div>

        <div class="flex flex-col gap-3">
          <div class="flex items-center gap-2 px-1">
            <span class="text-sm font-extrabold text-amber-700 bg-amber-100 rounded-full px-3 py-1">
              ⏳ Предстоит изучить
            </span>
            <span class="text-xs text-gray-400">
              {{ learnedCount(upcomingBlocks) }} {{ wordsLabel(learnedCount(upcomingBlocks)) }}
            </span>
          </div>

          <p v-if="upcomingBlocks.length === 0" class="text-center text-sm text-emerald-600 font-bold py-4">
            Все слова выучены! 🎉
          </p>
          <section
            v-for="(block, blockIndex) in upcomingBlocks"
            :key="`upcoming-${block.id}`"
            class="flex flex-col gap-2"
          >
            <div class="flex items-center justify-between gap-2 px-1">
              <h3
                class="text-base sm:text-lg font-extrabold"
                :class="blockIndex === 0 ? 'text-amber-700' : 'text-gray-500'"
              >
                {{ learnedBlocks.length + blockIndex + 1 }}.
                {{ blockIndex === 0 ? 'Сейчас учим' : `Скоро · ${block.title}` }}
              </h3>
              <span class="text-xs sm:text-sm font-bold rounded-full px-2.5 py-0.5 text-amber-700 bg-amber-50">
                {{ blockIndex === 0 ? `сейчас · ${block.words.length}` : `${block.words.length} ${wordsLabel(block.words.length)}` }}
              </span>
            </div>
            <div class="flex flex-col gap-1.5">
              <div
                v-for="(word, i) in block.words"
                :key="`${block.id}-${word.en}-${i}`"
                class="rounded-2xl px-3 py-2 sm:px-4 sm:py-2.5 shadow-md flex items-center gap-3 bg-white/50 border border-dashed border-gray-300"
              >
                <span class="flex-shrink-0 w-6 h-6 sm:w-7 sm:h-7 rounded-full text-[10px] sm:text-xs font-extrabold flex items-center justify-center bg-gray-100 text-gray-400">{{ i + 1 }}</span>
                <div class="flex-1 min-w-0">
                  <p class="text-sm sm:text-base font-extrabold capitalize truncate text-gray-500">{{ word.en }}</p>
                  <p class="text-[11px] sm:text-xs font-medium truncate text-gray-400">[ {{ word.transcription }} ]</p>
                </div>
                <p class="flex-shrink-0 text-sm sm:text-base font-bold text-right text-gray-400">{{ word.ru }}</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>

    <div class="flex-shrink-0 app-screen-x app-screen-bottom pt-2 sm:pt-3">
      <button
        class="w-full py-3 sm:py-4 rounded-2xl text-base sm:text-lg font-bold text-gray-600 bg-white/80 shadow active:scale-95 transition-transform cursor-pointer"
        @click="emit('back')"
      >
        🏠 Главное меню
      </button>
    </div>
  </div>
</template>
