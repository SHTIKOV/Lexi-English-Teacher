<script setup lang="ts">
import type { LessonStage, Reward } from '#shared/types'
import { motivations } from '#shared/levels'
import lexiHello from '~/assets/lexi-hello.png'

const props = defineProps<{
  childName: string
  learnedCount: number
  stage: LessonStage
  rewards: Reward[]
}>()

const emit = defineEmits<{
  navigate: [path: string]
  logout: []
}>()

const { isInsideMax } = useMaxAuth()
const showLogout = ref(true)
onMounted(() => {
  showLogout.value = !isInsideMax()
})

const STAGE_HINT: Record<LessonStage, string> = {
  learn: 'Урок · шаг 1 из 3: учим новые слова',
  quiz: 'Урок · шаг 2 из 3: проверка, нужно 100%',
  play: 'Урок · шаг 3 из 3: игра, нужно 90%',
  done: 'Урок пройден! Слова уже в библиотеке 🎉',
}

const motivation = motivations[Math.floor(Math.random() * motivations.length)]!
const nextReward = computed(() => props.rewards.find((r) => props.learnedCount < r.words) ?? null)
const progressPct = computed(() => {
  if (!nextReward.value) return 100
  return Math.min(100, (props.learnedCount / nextReward.value.words) * 100)
})
</script>

<template>
  <div class="home-screen app-screen flex flex-col max-w-lg mx-auto relative">
    <div class="home-glow pointer-events-none absolute inset-0" aria-hidden="true" />

    <div class="flex-1 min-h-0 relative z-10 app-screen-x overflow-hidden">
      <div class="absolute top-[6%] left-0 right-0 z-10 flex flex-col gap-2 sm:gap-2.5 pointer-events-none app-screen-x">
        <div class="home-greeting self-start max-w-[78%] animate-bounce-in pointer-events-auto">
          <div class="home-bubble w-fit rounded-[1.25rem] px-3.5 py-2.5 relative">
            <p class="text-[0.95rem] sm:text-lg text-[#6b4f8a] font-extrabold leading-snug tracking-tight">
              Привет, {{ childName }}!
            </p>
            <p class="text-xs sm:text-sm text-[#9a7ab0] font-semibold mt-0.5">
              Меня зовут Лекси
            </p>
            <div class="absolute -bottom-1.5 right-6 w-3 h-3 bg-white/90 border-b border-r border-pink-100/80 rotate-45" />
          </div>
        </div>

        <div
          class="home-motivation self-end max-w-[72%] animate-bounce-in pointer-events-auto"
          style="animation-delay: 0.25s"
        >
          <div class="home-bubble home-bubble-motivation w-fit ml-auto rounded-[1.25rem] px-3.5 py-2.5 relative">
            <p class="text-xs sm:text-sm font-bold text-[#c45d8a] leading-snug">
              {{ motivation }}
            </p>
            <div class="absolute -bottom-1.5 left-6 w-3 h-3 bg-white/90 border-b border-l border-violet-100/80 rotate-45" />
          </div>
        </div>
      </div>

      <div class="absolute inset-x-0 bottom-0 top-[28%] flex items-end justify-center -mb-3">
        <img
          :src="lexiHello"
          alt="Лекси — английский друг"
          class="home-lexi w-auto max-w-[92%] h-full object-contain object-bottom drop-shadow-xl animate-float"
        >
      </div>
    </div>

    <div class="flex-shrink-0 app-screen-x app-screen-bottom relative z-20 flex flex-col gap-2.5 sm:gap-3 pt-1">
      <div class="home-stats rounded-2xl px-3.5 py-2.5 sm:px-4 sm:py-3">
        <div class="flex items-center justify-between gap-3 mb-2">
          <div class="min-w-0">
            <p class="text-[10px] sm:text-xs font-bold uppercase tracking-wide text-[#9a7ab0]">
              Прогресс
            </p>
            <p class="text-sm sm:text-base font-extrabold text-[#5c4a6e] truncate">
              <template v-if="nextReward">
                <span class="text-[#7c5cbf]">{{ learnedCount }}</span>
                <span class="text-[#b0a0c0] font-bold"> / {{ nextReward.words }}</span>
                <span class="text-[#9a7ab0] font-semibold"> · {{ nextReward.emoji }} {{ nextReward.title }}</span>
              </template>
              <template v-else-if="rewards.length === 0">
                Выучено {{ learnedCount }} слов · добавь подарки в разделе «Подарки»
              </template>
              <template v-else>
                Выучено {{ learnedCount }} слов · все подарки открыты
              </template>
            </p>
          </div>
          <div class="flex-shrink-0 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-[#ffd6e7] to-[#e8d5ff] flex items-center justify-center shadow-inner">
            <span class="text-sm sm:text-base font-black text-[#7c5cbf]">{{ learnedCount }}</span>
          </div>
        </div>
        <p class="text-[11px] sm:text-xs font-bold text-[#9a7ab0] mb-1.5">
          {{ STAGE_HINT[stage] }}
        </p>
        <div class="w-full h-2 rounded-full bg-[#f0e8f5] overflow-hidden">
          <div
            class="h-full rounded-full bg-gradient-to-r from-[#f7a8c8] to-[#b794f6] transition-all duration-700 ease-out"
            :style="{ width: `${Math.max(progressPct, learnedCount > 0 ? 6 : 0)}%` }"
          />
        </div>
      </div>

      <div class="home-buttons flex flex-col gap-2 sm:gap-2.5">
        <button
          class="home-btn home-btn-primary w-full rounded-[1.15rem] text-sm sm:text-base font-extrabold text-white active:scale-[0.98] transition-transform cursor-pointer"
          @click="emit('navigate', '/learn')"
        >
          {{ stage === 'done' ? 'Урок пройден 🎉' : 'Учить слова' }}
        </button>

        <div class="grid grid-cols-2 gap-2 sm:gap-2.5">
          <button
            class="home-btn home-btn-soft w-full rounded-[1.15rem] text-sm sm:text-base font-extrabold text-[#3d6b8a] active:scale-[0.98] transition-transform cursor-pointer"
            @click="emit('navigate', '/quiz')"
          >
            Проверить
          </button>
          <button
            class="home-btn home-btn-soft home-btn-play w-full rounded-[1.15rem] text-sm sm:text-base font-extrabold text-[#7a4d8c] active:scale-[0.98] transition-transform cursor-pointer"
            @click="emit('navigate', '/play')"
          >
            Играть
          </button>
        </div>

        <div class="grid grid-cols-2 gap-2 sm:gap-2.5">
          <button
            class="home-btn home-btn-ghost w-full rounded-[1.15rem] text-sm sm:text-base font-extrabold text-[#6b5b7a] active:scale-[0.98] transition-transform cursor-pointer"
            @click="emit('navigate', '/library')"
          >
            Библиотека
          </button>
          <button
            class="home-btn home-btn-ghost home-btn-gift w-full rounded-[1.15rem] text-sm sm:text-base font-extrabold text-[#8a6a3d] active:scale-[0.98] transition-transform cursor-pointer"
            @click="emit('navigate', '/rewards')"
          >
            Подарки
          </button>
        </div>

        <button
          v-if="showLogout"
          class="text-xs font-bold text-[#9a7ab0] py-1 cursor-pointer"
          @click="emit('logout')"
        >
          Выйти из аккаунта
        </button>
      </div>
    </div>
  </div>
</template>
