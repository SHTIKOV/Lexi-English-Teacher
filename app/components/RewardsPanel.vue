<script setup lang="ts">
import type { Reward, RewardPhoto } from '#shared/types'
import hogwartsPhotosJson from '#shared/hogwarts-photos.json'

const props = defineProps<{
  learnedCount: number
  rewards: Reward[]
}>()

const emit = defineEmits<{
  back: []
  changed: []
}>()

const {
  create,
  update,
  remove,
  loadDefaults,
} = useRewards()

const activeReward = ref<Reward | null>(null)
const managing = ref(false)
const editing = ref<Reward | null>(null)
const formOpen = ref(false)
const busy = ref(false)
const errorMsg = ref('')

const form = reactive({
  words: 30,
  title: '',
  emoji: '🎁',
  description: '',
  details: '',
})

const hogwartsPhotos = hogwartsPhotosJson as RewardPhoto[]
const superWords = computed(() =>
  props.rewards.length ? Math.max(...props.rewards.map((r) => r.words)) : 0,
)
const isSuperActive = computed(() =>
  Boolean(activeReward.value && activeReward.value.words === superWords.value && superWords.value > 0),
)

function resetForm() {
  form.words = 30
  form.title = ''
  form.emoji = '🎁'
  form.description = ''
  form.details = ''
  editing.value = null
  errorMsg.value = ''
}

function openCreate() {
  resetForm()
  formOpen.value = true
}

function openEdit(r: Reward) {
  editing.value = r
  form.words = r.words
  form.title = r.title
  form.emoji = r.emoji
  form.description = r.description
  form.details = r.details || ''
  errorMsg.value = ''
  formOpen.value = true
}

async function saveForm() {
  busy.value = true
  errorMsg.value = ''
  try {
    const payload = {
      words: Number(form.words),
      title: form.title.trim(),
      emoji: form.emoji.trim() || '🎁',
      description: form.description.trim(),
      details: form.details.trim() || undefined,
    }
    if (editing.value?.id) {
      await update(editing.value.id, payload)
    }
    else {
      await create(payload)
    }
    formOpen.value = false
    resetForm()
    emit('changed')
  }
  catch (e: unknown) {
    const err = e as { data?: { statusMessage?: string }; statusMessage?: string; message?: string }
    errorMsg.value = err?.data?.statusMessage || err?.statusMessage || err?.message || 'Не удалось сохранить'
  }
  finally {
    busy.value = false
  }
}

async function deleteReward(r: Reward) {
  if (!r.id) return
  if (!confirm(`Удалить подарок «${r.title}»?`)) return
  busy.value = true
  try {
    await remove(r.id)
    if (activeReward.value?.id === r.id) activeReward.value = null
    emit('changed')
  }
  catch (e: unknown) {
    const err = e as { data?: { statusMessage?: string }; statusMessage?: string; message?: string }
    errorMsg.value = err?.data?.statusMessage || err?.statusMessage || err?.message || 'Не удалось удалить'
  }
  finally {
    busy.value = false
  }
}

async function onLoadDefaults() {
  const hasAny = props.rewards.length > 0
  if (hasAny && !confirm('Заменить текущий список стандартными подарками Lexi?')) {
    return
  }
  busy.value = true
  errorMsg.value = ''
  try {
    await loadDefaults(true)
    emit('changed')
  }
  catch (e: unknown) {
    const err = e as { data?: { statusMessage?: string }; statusMessage?: string; message?: string }
    errorMsg.value = err?.data?.statusMessage || err?.statusMessage || err?.message || 'Не удалось загрузить'
  }
  finally {
    busy.value = false
  }
}
</script>

<template>
  <div class="app-screen flex flex-col max-w-lg mx-auto">
    <div
      v-if="activeReward && !managing"
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

    <!-- Edit / create form -->
    <div
      v-if="formOpen"
      class="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center px-3 sm:px-6"
    >
      <div class="bg-white rounded-t-3xl sm:rounded-3xl p-5 w-full max-w-md max-h-[90svh] overflow-y-auto shadow-2xl">
        <h3 class="text-xl font-extrabold text-amber-700 mb-3">
          {{ editing ? 'Изменить подарок' : 'Новый подарок' }}
        </h3>
        <div class="flex flex-col gap-3">
          <label class="text-sm font-bold text-gray-600">
            Эмодзи
            <input v-model="form.emoji" class="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-2xl" maxlength="8">
          </label>
          <label class="text-sm font-bold text-gray-600">
            Название
            <input v-model="form.title" class="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 font-semibold" maxlength="80" placeholder="Кинотеатр">
          </label>
          <label class="text-sm font-bold text-gray-600">
            Слов нужно
            <input v-model.number="form.words" type="number" min="1" max="100000" class="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 font-semibold">
          </label>
          <label class="text-sm font-bold text-gray-600">
            Коротко
            <input v-model="form.description" class="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2" maxlength="200" placeholder="Смотрим мультики!">
          </label>
          <label class="text-sm font-bold text-gray-600">
            Подробности
            <textarea v-model="form.details" rows="3" class="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 resize-none" maxlength="2000" placeholder="Что будет, когда откроем подарок…" />
          </label>
          <p v-if="errorMsg" class="text-sm text-red-500 font-bold">{{ errorMsg }}</p>
          <div class="flex gap-2 mt-1">
            <button
              class="flex-1 py-3 rounded-2xl font-bold text-gray-600 bg-gray-100 active:scale-95"
              :disabled="busy"
              @click="formOpen = false; resetForm()"
            >
              Отмена
            </button>
            <button
              class="flex-1 py-3 rounded-2xl font-bold text-white bg-gradient-to-r from-amber-400 to-yellow-500 shadow active:scale-95 disabled:opacity-60"
              :disabled="busy || !form.title.trim()"
              @click="saveForm"
            >
              Сохранить
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="flex-shrink-0 app-screen-x pt-3 sm:pt-4 pb-1 sm:pb-2 text-center">
      <h2 class="text-xl sm:text-3xl font-extrabold text-amber-600">🎁 Мои подарки</h2>
      <p class="text-gray-500 text-sm">
        {{ managing ? 'Редактируй список подарков' : 'Учи слова и зарабатывай подарки!' }}
      </p>
      <div class="mt-2 flex gap-2 justify-center flex-wrap">
        <button
          class="px-3 py-1.5 rounded-full text-xs font-extrabold active:scale-95 transition-transform"
          :class="managing ? 'bg-amber-500 text-white' : 'bg-white/80 text-amber-700 shadow'"
          @click="managing = !managing; activeReward = null"
        >
          {{ managing ? 'Готово' : 'Управлять' }}
        </button>
        <button
          v-if="managing"
          class="px-3 py-1.5 rounded-full text-xs font-extrabold bg-emerald-500 text-white active:scale-95"
          :disabled="busy"
          @click="openCreate"
        >
          + Добавить
        </button>
        <button
          v-if="managing || rewards.length === 0"
          class="px-3 py-1.5 rounded-full text-xs font-extrabold bg-purple-500 text-white active:scale-95 disabled:opacity-60"
          :disabled="busy"
          @click="onLoadDefaults"
        >
          Загрузить стандартные
        </button>
      </div>
      <p v-if="errorMsg && !formOpen" class="text-sm text-red-500 font-bold mt-2">{{ errorMsg }}</p>
    </div>

    <div class="flex-1 overflow-y-auto app-screen-x min-h-0 overscroll-contain">
      <div v-if="rewards.length === 0" class="py-10 text-center">
        <p class="text-gray-500 font-semibold mb-3">Подарков пока нет</p>
        <p class="text-sm text-gray-400 mb-4">Загрузи стандартный список Lexi или добавь свои.</p>
        <button
          class="px-4 py-3 rounded-2xl font-extrabold text-white bg-gradient-to-r from-purple-400 to-pink-500 shadow active:scale-95"
          :disabled="busy"
          @click="onLoadDefaults"
        >
          Загрузить стандартные
        </button>
      </div>

      <div v-else class="flex flex-col gap-3 py-2">
        <div
          v-for="r in rewards"
          :key="r.id ?? r.words"
          class="rounded-3xl p-4 shadow-lg transition-all relative overflow-hidden"
          :class="{
            'cursor-pointer': !managing,
            'bg-gradient-to-r from-yellow-100 via-amber-200 to-yellow-100 border-2 border-amber-400 animate-pulse-glow': r.words === superWords && learnedCount >= r.words,
            'bg-gradient-to-r from-yellow-50 via-amber-100 to-yellow-50 border-2 border-amber-300': r.words === superWords && learnedCount < r.words,
            'bg-gradient-to-r from-yellow-100 to-amber-100 border-2 border-amber-300': r.words !== superWords && learnedCount >= r.words,
            'bg-white/60 border-2 border-gray-200': r.words !== superWords && learnedCount < r.words,
          }"
          @click="!managing && (activeReward = r)"
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
            <span v-if="!managing && learnedCount >= r.words" class="text-2xl animate-float">
              {{ r.words === superWords ? '⭐' : '🎉' }}
            </span>
          </div>

          <div v-if="managing" class="mt-3 flex gap-2" @click.stop>
            <button
              class="flex-1 py-2 rounded-xl text-sm font-extrabold text-amber-800 bg-amber-100 active:scale-95"
              :disabled="busy"
              @click="openEdit(r)"
            >
              Изменить
            </button>
            <button
              class="flex-1 py-2 rounded-xl text-sm font-extrabold text-red-700 bg-red-100 active:scale-95"
              :disabled="busy"
              @click="deleteReward(r)"
            >
              Удалить
            </button>
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
