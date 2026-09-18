<script setup lang="ts">
import type { RankedUser } from '#shared/leaderboard'

defineProps<{
  entries: RankedUser[]
  showGapAfterTop: boolean
  meUserId: number
  meRank: number
  totalUsers: number
  pending?: boolean
}>()

const emit = defineEmits<{ back: [] }>()

const MEDALS = ['🥇', '🥈', '🥉'] as const

function wordsLabel(count: number): string {
  const mod10 = count % 10
  const mod100 = count % 100
  if (mod10 === 1 && mod100 !== 11) return 'слово'
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return 'слова'
  return 'слов'
}

function initial(name: string): string {
  const t = name.trim()
  return t ? t.charAt(0).toUpperCase() : '?'
}

function gapAfterIndex(entries: RankedUser[], showGap: boolean): number {
  if (!showGap || entries.length < 9) return -1
  return 8
}
</script>

<template>
  <div class="app-screen flex flex-col max-w-lg mx-auto">
    <div class="flex-shrink-0 app-screen-x pt-3 sm:pt-4 pb-2 text-center">
      <h2 class="text-xl sm:text-3xl font-extrabold text-[#7c5cbf]">
        🏆 Рейтинг
      </h2>
      <p class="mt-1 text-xs sm:text-sm font-bold text-[#9a7ab0]">
        <template v-if="meRank > 0">
          Ты на {{ meRank }} месте из {{ totalUsers }}
        </template>
        <template v-else>
          {{ totalUsers }} {{ totalUsers === 1 ? 'ученик' : 'учеников' }}
        </template>
      </p>
    </div>

    <div class="flex-1 overflow-y-auto app-screen-x min-h-0 overscroll-contain pb-2">
      <div
        v-if="pending"
        class="flex items-center justify-center py-16"
      >
        <p class="text-3xl animate-float">🌟</p>
      </div>

      <ul
        v-else-if="entries.length"
        class="flex flex-col gap-2"
      >
        <template
          v-for="(entry, index) in entries"
          :key="entry.userId"
        >
          <li
            class="rating-row flex items-center gap-2.5 rounded-2xl px-3 py-2.5 transition-colors"
            :class="entry.userId === meUserId
              ? 'rating-row-me'
              : 'bg-white/75 border border-white/90 shadow-sm'"
          >
            <div class="w-8 flex-shrink-0 text-center">
              <span
                v-if="entry.rank <= 3"
                class="text-lg leading-none"
              >{{ MEDALS[entry.rank - 1] }}</span>
              <span
                v-else
                class="text-sm font-black text-[#9a7ab0]"
              >{{ entry.rank }}</span>
            </div>

            <div
              class="flex-shrink-0 w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-[#ffd6e7] to-[#e8d5ff] flex items-center justify-center border border-white shadow-inner"
            >
              <img
                v-if="entry.avatarUrl"
                :src="entry.avatarUrl"
                :alt="entry.childName"
                class="w-full h-full object-cover"
                loading="lazy"
                referrerpolicy="no-referrer"
              >
              <span
                v-else
                class="text-sm font-black text-[#7c5cbf]"
              >{{ initial(entry.childName || entry.displayName) }}</span>
            </div>

            <div class="min-w-0 flex-1">
              <p class="text-sm font-extrabold text-[#5c4a6e] truncate">
                {{ entry.childName || entry.displayName }}
                <span
                  v-if="entry.userId === meUserId"
                  class="ml-1 text-[10px] font-black uppercase tracking-wide text-[#c45d8a]"
                >ты</span>
              </p>
              <p class="text-[11px] font-bold text-[#9a7ab0] truncate">
                {{ entry.displayName }}
              </p>
            </div>

            <div class="flex-shrink-0 text-right">
              <p class="text-sm font-black text-[#7c5cbf]">
                {{ entry.learnedCount }}
              </p>
              <p class="text-[10px] font-bold text-[#b0a0c0]">
                {{ wordsLabel(entry.learnedCount) }}
              </p>
            </div>
          </li>

          <li
            v-if="index === gapAfterIndex(entries, showGapAfterTop)"
            class="flex justify-center py-0.5"
            aria-hidden="true"
          >
            <span class="text-[#b0a0c0] font-black tracking-[0.35em] text-sm">···</span>
          </li>
        </template>
      </ul>

      <p
        v-else
        class="text-center text-sm font-bold text-[#9a7ab0] py-16"
      >
        Пока никого нет в рейтинге
      </p>
    </div>

    <div class="flex-shrink-0 app-screen-x app-screen-bottom pt-2">
      <button
        class="home-btn home-btn-ghost w-full rounded-[1.15rem] text-sm sm:text-base font-extrabold text-[#6b5b7a] active:scale-[0.98] transition-transform cursor-pointer"
        @click="emit('back')"
      >
        Назад
      </button>
    </div>
  </div>
</template>

<style scoped>
.rating-row-me {
  background: linear-gradient(135deg, rgba(255, 214, 232, 0.95), rgba(232, 213, 255, 0.95));
  border: 1.5px solid rgba(196, 93, 138, 0.35);
  box-shadow: 0 8px 20px rgba(124, 92, 191, 0.12);
}
</style>
