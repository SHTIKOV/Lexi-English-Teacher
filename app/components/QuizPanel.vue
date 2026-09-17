<script setup lang="ts">
import type { Word } from '#shared/types'
import lexiHappy from '~/assets/lexi-happy.png'

const props = defineProps<{
  words: Word[]
  allWords: Word[]
  title: string
  questionCount?: number
  passThreshold?: number
  continueLabel?: string
}>()

const emit = defineEmits<{
  continue: []
  back: []
}>()

const showExit = ref(false)
const wordsRef = toRef(props, 'words')
const allWordsRef = toRef(props, 'allWords')
const { current, currentIndex, total, score, answered, finished, answer, next, reset } =
  useQuiz(wordsRef, allWordsRef, props.questionCount)

const threshold = computed(() => props.passThreshold ?? 80)
const percent = computed(() => (total.value > 0 ? Math.round((score.value / total.value) * 100) : 0))
const passed = computed(() => finished.value && percent.value >= threshold.value)
const isCorrect = computed(() => answered.value !== null && answered.value === current.value?.correctIndex)
const isWrong = computed(() => answered.value !== null && !isCorrect.value)

function optionClass(i: number) {
  let classes = 'quiz-option w-full py-3 sm:py-4 px-4 sm:px-5 rounded-2xl text-center shadow-md transition-colors cursor-pointer '
  if (answered.value === null) {
    classes += 'bg-white active:scale-95 text-gray-700'
  }
  else if (i === current.value?.correctIndex) {
    classes += 'bg-green-400 text-white'
  }
  else if (i === answered.value) {
    classes += 'bg-red-400 text-white animate-shake'
  }
  else {
    classes += 'bg-white/50 text-gray-400'
  }
  return classes
}
</script>

<template>
  <div class="app-screen flex flex-col max-w-lg mx-auto">
    <template v-if="words.length < 2">
      <div class="flex-1 flex flex-col items-center justify-center px-4">
        <p class="text-5xl mb-4">😅</p>
        <p class="text-xl font-bold text-purple-600 text-center">
          Нужно хотя бы 2 слова для проверки!
        </p>
      </div>
      <div class="flex-shrink-0 app-screen-x app-screen-bottom">
        <button
          class="w-full py-4 rounded-2xl text-lg font-bold text-white bg-gradient-to-r from-pink-400 to-purple-500 shadow-lg active:scale-95 transition-transform cursor-pointer"
          @click="emit('back')"
        >
          🏠 Главное меню
        </button>
      </div>
    </template>

    <template v-else-if="finished">
      <div class="flex-1 flex flex-col items-center justify-center px-4">
        <Confetti v-if="passed" />
        <img v-if="passed" :src="lexiHappy" alt="Lexi радуется" class="w-40 h-40 sm:w-48 sm:h-48 object-contain drop-shadow-lg mb-4">
        <p v-else class="text-6xl mb-4">💪</p>
        <h2 class="text-2xl sm:text-3xl font-extrabold text-purple-600 mb-2">
          {{ passed ? 'Отлично!' : 'Хорошая попытка!' }}
        </h2>
        <div class="bg-white/70 rounded-3xl p-6 shadow-lg text-center w-full">
          <p class="text-5xl font-extrabold text-green-500 mb-1">
            {{ score }}/{{ total }}
          </p>
          <p class="text-lg text-gray-600">
            {{ passed ? 'Ты настоящая звезда! ⭐' : 'Попробуй ещё разок! 🌈' }}
          </p>
          <p v-if="continueLabel" class="text-sm font-semibold text-purple-400 mt-2">
            {{ passed
              ? `Этап пройден — ${percent}% из нужных ${threshold}%`
              : `Нужно ${threshold}%, а пока ${percent}%` }}
          </p>
        </div>
      </div>
      <div class="flex-shrink-0 app-screen-x app-screen-bottom pt-2 sm:pt-3 flex flex-col gap-2 sm:gap-3">
        <button
          v-if="continueLabel && passed"
          class="w-full py-4 rounded-2xl text-lg font-bold text-white bg-gradient-to-r from-green-400 to-emerald-500 shadow-lg active:scale-95 transition-transform cursor-pointer"
          @click="emit('continue')"
        >
          {{ continueLabel }}
        </button>
        <button
          v-else
          class="w-full py-4 rounded-2xl text-lg font-bold text-white bg-gradient-to-r from-green-400 to-emerald-500 shadow-lg active:scale-95 transition-transform cursor-pointer"
          @click="reset"
        >
          🔄 Ещё раз
        </button>
        <button
          class="w-full py-3 rounded-2xl text-lg font-bold text-gray-600 bg-white/80 shadow active:scale-95 transition-transform cursor-pointer"
          @click="emit('back')"
        >
          🏠 Главное меню
        </button>
      </div>
    </template>

    <template v-else-if="current">
      <ExitConfirm
        v-if="showExit"
        :on-confirm="() => emit('back')"
        :on-cancel="() => { showExit = false }"
      />

      <div class="flex-shrink-0 flex items-center justify-between app-screen-x pt-3 sm:pt-4 pb-1 sm:pb-2">
        <h2 class="text-xl sm:text-2xl font-extrabold text-purple-600">{{ title }}</h2>
        <span class="text-sm text-gray-400 bg-white/60 rounded-full px-3 py-1">
          {{ currentIndex + 1 }}/{{ total }}
        </span>
      </div>

      <div class="flex-shrink-0 app-screen-x pt-1 sm:pt-2 pb-2 sm:pb-3">
        <div class="quiz-question bg-white/70 rounded-3xl p-4 sm:p-6 shadow-lg text-center w-full">
          <template v-if="current.reverse">
            <p class="text-sm text-gray-400 mb-1">Как будет по-русски:</p>
            <p class="text-3xl sm:text-4xl font-extrabold text-blue-500">{{ current.word.en }}</p>
            <p class="text-lg text-purple-400 font-medium mt-1">[ {{ current.word.transcription }} ]</p>
          </template>
          <template v-else>
            <p class="text-sm text-gray-400 mb-1">Как будет по-английски:</p>
            <p class="text-3xl sm:text-4xl font-extrabold text-gray-700">{{ current.word.ru }}</p>
          </template>
        </div>
      </div>

      <div class="flex-1 flex flex-col justify-center app-screen-x min-h-0 overflow-y-auto overscroll-contain">
        <div class="relative w-full flex-shrink-0 py-1">
          <div class="grid grid-cols-1 gap-2 sm:gap-3 w-full">
            <button
              v-for="(opt, i) in current.options"
              :key="`${current.word.en}-${i}`"
              :disabled="answered !== null"
              :class="optionClass(i)"
              @click="answer(i)"
            >
              <template v-if="current.reverse">
                <span class="text-xl sm:text-2xl font-bold block">{{ opt.ru }}</span>
              </template>
              <template v-else>
                <span class="text-xl sm:text-2xl font-bold block">{{ opt.en }}</span>
                <span class="text-sm sm:text-base font-medium opacity-70 block">[ {{ opt.transcription }} ]</span>
              </template>
            </button>
          </div>

          <div
            v-if="answered !== null"
            class="absolute inset-0 flex items-center justify-center animate-bounce-in"
          >
            <div
              class="rounded-3xl px-8 py-6 shadow-2xl text-center"
              :class="isCorrect ? 'bg-green-500' : 'bg-red-500'"
            >
              <p class="text-3xl font-extrabold text-white mb-1">
                {{ isCorrect ? '✅ Правильно!' : '❌ Неправильно' }}
              </p>
              <p v-if="isWrong" class="text-lg text-white/90">
                Ответ:
                <span class="font-bold">{{ current.reverse ? current.word.ru : current.word.en }}</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      <div class="flex-shrink-0 app-screen-x app-screen-bottom pt-2 sm:pt-3 flex flex-col gap-2 sm:gap-3">
        <button
          class="w-full py-4 rounded-2xl text-lg font-bold text-white bg-gradient-to-r from-blue-400 to-purple-500 shadow-lg active:scale-95 transition-all cursor-pointer"
          :class="answered === null ? 'opacity-0 pointer-events-none' : 'opacity-100'"
          :disabled="answered === null"
          @click="next"
        >
          Далее →
        </button>
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
