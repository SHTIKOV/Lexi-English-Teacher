<script setup lang="ts">
import type { RewardPhoto } from '#shared/types'

const props = defineProps<{
  photos: RewardPhoto[]
  baseUrl?: string
}>()

const index = ref(0)
const lightbox = ref(false)
const base = computed(() => props.baseUrl ?? '/')

const current = computed(() => props.photos[index.value])
const src = computed(() => (current.value ? `${base.value}${current.value.src}` : ''))

function prev() {
  index.value = (index.value - 1 + props.photos.length) % props.photos.length
}
function next() {
  index.value = (index.value + 1) % props.photos.length
}

onMounted(() => {
  const onKey = (e: KeyboardEvent) => {
    if (!lightbox.value) return
    if (e.key === 'Escape') lightbox.value = false
    if (e.key === 'ArrowLeft') prev()
    if (e.key === 'ArrowRight') next()
  }
  window.addEventListener('keydown', onKey)
  onUnmounted(() => window.removeEventListener('keydown', onKey))
})
</script>

<template>
  <div v-if="photos.length && current" class="mt-3">
    <p class="text-xs font-bold text-amber-800/80 mb-2">
      Настоящие фото из Universal Beijing · нажми, чтобы увеличить
    </p>
    <div class="relative rounded-2xl overflow-hidden bg-black/5 shadow-inner">
      <button
        type="button"
        class="block w-full cursor-zoom-in"
        aria-label="Открыть фото на весь экран"
        @click="lightbox = true"
      >
        <img :src="src" :alt="current.caption" class="w-full h-40 sm:h-48 object-cover">
      </button>

      <button
        type="button"
        class="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 text-amber-900 font-bold shadow active:scale-95"
        aria-label="Предыдущее фото"
        @click="prev"
      >
        ‹
      </button>
      <button
        type="button"
        class="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 text-amber-900 font-bold shadow active:scale-95"
        aria-label="Следующее фото"
        @click="next"
      >
        ›
      </button>

      <div class="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/55 to-transparent px-3 py-2">
        <p class="text-white text-xs sm:text-sm font-bold leading-snug">{{ current.caption }}</p>
        <p class="text-white/80 text-[10px]">
          {{ index + 1 }} / {{ photos.length }}
        </p>
      </div>
    </div>

    <div class="flex gap-1.5 mt-2 overflow-x-auto pb-1">
      <button
        v-for="(photo, i) in photos"
        :key="photo.src"
        type="button"
        class="flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden border-2 transition-all"
        :class="i === index ? 'border-amber-500 scale-105' : 'border-transparent opacity-70'"
        :aria-label="photo.caption"
        @click="index = i"
      >
        <img :src="`${base}${photo.src}`" alt="" class="w-full h-full object-cover">
      </button>
    </div>

    <div
      v-if="lightbox"
      class="fixed inset-0 z-[70] bg-black/92 flex flex-col"
      role="dialog"
      aria-modal="true"
      :aria-label="current.caption"
    >
      <div class="flex items-center justify-between px-4 pt-3 pb-2 text-white">
        <div class="min-w-0 pr-3">
          <p class="font-bold text-sm sm:text-base truncate">{{ current.caption }}</p>
          <p class="text-xs text-white/70">
            {{ index + 1 }} / {{ photos.length }}
            <template v-if="current.credit"> · фото: {{ current.credit }}</template>
            <template v-if="current.license"> · {{ current.license }}</template>
          </p>
        </div>
        <button
          type="button"
          class="flex-shrink-0 w-10 h-10 rounded-full bg-white/15 text-white text-xl font-bold active:scale-95"
          aria-label="Закрыть"
          @click="lightbox = false"
        >
          ✕
        </button>
      </div>

      <div class="flex-1 min-h-0 relative flex items-center justify-center px-2">
        <button
          type="button"
          class="absolute left-2 z-10 w-10 h-10 rounded-full bg-white/20 text-white text-2xl font-bold active:scale-95"
          aria-label="Предыдущее фото"
          @click="prev"
        >
          ‹
        </button>
        <img
          :src="src"
          :alt="current.caption"
          class="max-h-full max-w-full object-contain"
          @click="lightbox = false"
        >
        <button
          type="button"
          class="absolute right-2 z-10 w-10 h-10 rounded-full bg-white/20 text-white text-2xl font-bold active:scale-95"
          aria-label="Следующее фото"
          @click="next"
        >
          ›
        </button>
      </div>
    </div>
  </div>
</template>
