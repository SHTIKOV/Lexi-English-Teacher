<script setup lang="ts">
import type { Word } from '#shared/types'
import lexiBook from '~/assets/lexi-book.png'

const props = defineProps<{
  words: Word[]
  blockNumber?: number | null
  totalBlocks?: number | null
}>()

const emit = defineEmits<{
  learned: []
  back: []
}>()

const index = ref(0)
const showExit = ref(false)
</script>

<template>
  <div class="app-screen flex flex-col max-w-lg mx-auto">
    <template v-if="words.length === 0">
      <div class="flex-1 flex flex-col items-center justify-center px-4">
        <img :src="lexiBook" alt="Lexi" class="w-36 h-36 object-contain drop-shadow-lg mb-4">
        <p class="text-2xl font-bold text-purple-600 text-center">
          Все слова выучены! Ты молодец!
        </p>
      </div>
      <div class="flex-shrink-0 app-screen-x app-screen-bottom">
        <button
          class="w-full py-4 rounded-2xl text-lg font-bold text-gray-600 bg-white/80 shadow active:scale-95 transition-transform cursor-pointer"
          @click="emit('back')"
        >
          🏠 Главное меню
        </button>
      </div>
    </template>

    <template v-else>
      <ExitConfirm
        v-if="showExit"
        :on-confirm="() => emit('back')"
        :on-cancel="() => { showExit = false }"
      />

      <div class="flex-shrink-0 flex items-center gap-2 sm:gap-3 app-screen-x pt-3 sm:pt-4 pb-1 sm:pb-2">
        <img :src="lexiBook" alt="Lexi с книгой" class="w-14 h-14 sm:w-20 sm:h-20 object-contain drop-shadow-lg flex-shrink-0">
        <div>
          <h2 class="text-xl sm:text-2xl font-extrabold text-purple-600">Учим слова!</h2>
          <p class="text-sm text-gray-500">
            <template v-if="blockNumber && totalBlocks">
              Блок {{ blockNumber }} из {{ totalBlocks }} · {{ words.length }} слов
            </template>
            <template v-else>
              {{ words.length }} слов · запоминай и повторяй вслух
            </template>
          </p>
        </div>
      </div>

      <div class="flex-1 flex items-center justify-center app-screen-x min-h-0 overflow-y-auto overscroll-contain">
        <WordCard :word="words[index]!" :index="index" :total="words.length" />
      </div>

      <div class="flex-shrink-0 app-screen-x app-screen-bottom pt-2 sm:pt-3 flex flex-col gap-2 sm:gap-3">
        <div class="flex gap-3">
          <button
            class="flex-1 py-4 rounded-2xl text-lg font-bold text-white bg-gradient-to-r from-blue-400 to-blue-500 shadow-lg active:scale-95 transition-transform disabled:opacity-40 cursor-pointer disabled:cursor-default"
            :disabled="index === 0"
            @click="index = Math.max(0, index - 1)"
          >
            ← Назад
          </button>
          <button
            v-if="index === words.length - 1"
            class="flex-1 py-4 rounded-2xl text-lg font-bold text-white bg-gradient-to-r from-green-400 to-emerald-500 shadow-lg active:scale-95 transition-transform cursor-pointer"
            @click="emit('learned')"
          >
            Я выучил! → Проверка
          </button>
          <button
            v-else
            class="flex-1 py-4 rounded-2xl text-lg font-bold text-white bg-gradient-to-r from-blue-400 to-blue-500 shadow-lg active:scale-95 transition-transform cursor-pointer"
            @click="index = Math.min(words.length - 1, index + 1)"
          >
            Далее →
          </button>
        </div>
        <button
          class="w-full py-3 rounded-2xl text-lg font-bold text-gray-600 bg-white/80 shadow active:scale-95 transition-transform cursor-pointer"
          @click="showExit = true"
        >
          🏠 Главное меню
        </button>
      </div>
    </template>
  </div>
</template>
