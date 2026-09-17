<script setup lang="ts">
import type { Reward, RewardPhoto } from '#shared/types'
import { rewards } from '#shared/rewards'
import hogwartsPhotosJson from '#shared/hogwarts-photos.json'

defineProps<{
  learnedCount: number
}>()

const emit = defineEmits<{ back: [] }>()

const activeReward = ref<Reward | null>(null)
const hogwartsPhotos = hogwartsPhotosJson as RewardPhoto[]
const superWords = Math.max(...rewards.map((r) => r.words))
const isSuperActive = computed(() => activeReward.value?.words === superWords)
</script>

<template>
  <div class="app-screen flex flex-col max-w-lg mx-auto">
    <div
      v-if="activeReward"
      class="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center px-4 sm:px-6 animate-bounce-in"
    >
      <div
        class="rounded-3xl p-4 sm:p-6 shadow-2xl max-w-md w-full max-h-[90svh] overflow-y-auto overscroll-contain"
        :class="isSuperActive
          ? 'bg-gradient-to-r from-yellow-100 via-amber-200 to-yellow-100 border-2 border-amber-400 animate-pulse-glow'
          : 'bg-white border-2 border-white/40'"
      >
        <div class="flex items-start justify-between gap-4">
          <div class="flex gap-4 items-center">
            <span class="text-4xl">{{ isSuperActive ? '👑' : '' }}{{ activeReward.emoji }}</span>
            <div>
              <h3
                class="text-xl sm:text-2xl font-extrabold"
                :class="isSuperActive ? 'text-amber-900' : 'text-amber-700'"
              >
                {{ activeReward.title }}
              </h3>
              <p class="text-sm text-gray-500 mt-1">Открывается на {{ activeReward.words }} слов</p>
            </div>
          </div>
          <button
            class="text-2xl leading-none text-gray-600 bg-white/70 hover:bg-white rounded-full px-3 py-1 shadow active:scale-95 transition-transform"
            aria-label="Закрыть"
            @click="activeReward = null"
          >
            ✕
          </button>
        </div>

        <div class="mt-4 bg-white/60 rounded-2xl p-4">
          <p class="text-gray-800 text-sm sm:text-base leading-snug">
            {{ activeReward.details ?? activeReward.description }}
          </p>

          <PhotoSlider
            v-if="isSuperActive && hogwartsPhotos.length"
            :photos="hogwartsPhotos"
            base-url="/"
          />

          <div class="mt-4">
            <p v-if="learnedCount >= activeReward.words" class="text-emerald-700 font-extrabold">
              ✅ Готово! Подарок твой!
            </p>
            <p v-else class="text-amber-700 font-extrabold">
              До подарка осталось еще {{ activeReward.words - learnedCount }} слов ({{ learnedCount }}/{{ activeReward.words }})
            </p>
          </div>

          <template v-if="isSuperActive">
            <p class="mt-3 text-xs text-amber-900/80 font-semibold">
              В Хогвартсе нужно говорить по-английски. Поэтому важно выучить ВСЕ 1000 слов.
            </p>
            <a
              href="https://www.universalbeijingresort.com/en/themelands/harrypotter"
              target="_blank"
              rel="noopener noreferrer"
              class="mt-3 inline-flex items-center gap-1.5 text-sm font-extrabold text-[#5b4db0] underline underline-offset-2"
            >
              Официальный сайт Universal Beijing →
            </a>
          </template>
        </div>

        <div class="mt-5 flex gap-3">
          <button
            class="flex-1 py-3 rounded-2xl text-lg font-bold text-gray-600 bg-white/80 shadow active:scale-95 transition-transform cursor-pointer"
            @click="activeReward = null"
          >
            Поняла!
          </button>
        </div>
      </div>
    </div>

    <div class="flex-shrink-0 app-screen-x pt-3 sm:pt-4 pb-1 sm:pb-2 text-center">
      <h2 class="text-xl sm:text-3xl font-extrabold text-amber-600">🎁 Мои подарки</h2>
      <p class="text-gray-500 text-sm">Учи слова и зарабатывай подарки!</p>
    </div>

    <div class="flex-1 overflow-y-auto app-screen-x min-h-0 overscroll-contain">
      <div class="flex flex-col gap-3 py-2">
        <div
          v-for="r in rewards"
          :key="r.words"
          class="rounded-3xl p-4 shadow-lg transition-all cursor-pointer relative overflow-hidden"
          :class="{
            'bg-gradient-to-r from-yellow-100 via-amber-200 to-yellow-100 border-2 border-amber-400 animate-pulse-glow': r.words === superWords && learnedCount >= r.words,
            'bg-gradient-to-r from-yellow-50 via-amber-100 to-yellow-50 border-2 border-amber-300': r.words === superWords && learnedCount < r.words,
            'bg-gradient-to-r from-yellow-100 to-amber-100 border-2 border-amber-300': r.words !== superWords && learnedCount >= r.words,
            'bg-white/60 border-2 border-gray-200': r.words !== superWords && learnedCount < r.words,
          }"
          @click="activeReward = r"
        >
          <div v-if="r.words === superWords" class="absolute inset-0 pointer-events-none">
            <div class="absolute -left-1/3 top-0 h-full w-2/3 bg-gradient-to-r from-transparent via-yellow-200 to-transparent opacity-70 animate-coin-shimmer" />
          </div>
          <div class="flex items-center gap-3">
            <span class="text-3xl sm:text-4xl" :class="learnedCount >= r.words ? '' : 'grayscale opacity-70'">
              {{ r.words === superWords ? '👑' : learnedCount >= r.words ? '' : '🔒' }}{{ r.emoji }}
            </span>
            <div class="flex-1 min-w-0">
              <p
                class="text-base sm:text-lg font-extrabold truncate"
                :class="r.words === superWords ? 'text-amber-900' : learnedCount >= r.words ? 'text-amber-700' : 'text-gray-400'"
              >
                {{ r.title }}
              </p>
              <p class="text-sm" :class="learnedCount >= r.words ? 'text-amber-600' : 'text-gray-400'">
                {{ r.description }}
              </p>
              <div v-if="learnedCount < r.words" class="mt-2">
                <div class="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div
                    class="h-full bg-gradient-to-r from-amber-300 to-yellow-400 rounded-full transition-all duration-500"
                    :style="{ width: `${Math.min(100, (learnedCount / r.words) * 100)}%` }"
                  />
                </div>
                <p class="text-xs text-gray-400 mt-1">{{ learnedCount }}/{{ r.words }} слов</p>
              </div>
            </div>
            <span v-if="learnedCount >= r.words" class="text-2xl animate-float">
              {{ r.words === superWords ? '⭐' : '🎉' }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <div class="flex-shrink-0 app-screen-x app-screen-bottom pt-2 sm:pt-3">
      <button
        class="w-full py-4 rounded-2xl text-lg font-bold text-gray-600 bg-white/80 shadow active:scale-95 transition-transform cursor-pointer"
        @click="emit('back')"
      >
        🏠 Главное меню
      </button>
    </div>
  </div>
</template>
