<script setup lang="ts">
import lexiHello from '~/assets/lexi-hello.png'
import lexiHappy from '~/assets/lexi-happy.png'
import lexiBook from '~/assets/lexi-book.png'

const emit = defineEmits<{ done: [] }>()

const { user, fetch: fetchSession } = useUserSession()
const { loadDefaults } = useRewards()

const step = ref(0)
const busy = ref(false)
const errorMsg = ref('')
const childName = ref(user.value?.childName && user.value.childName !== 'Малышка'
  ? user.value.childName
  : '')
const defaultsLoaded = ref(false)

const steps = computed(() => [
  {
    id: 'hello',
    image: lexiHello,
    title: 'Привет! Я Лекси',
    text: 'Я твой английский друг. Вместе мы будем учить слова, играть и открывать подарки. Готова к маленькому приключению?',
    cta: 'Конечно!',
  },
  {
    id: 'name',
    image: lexiHappy,
    title: 'Как тебя зовут?',
    text: 'Напиши имя — так я буду к тебе обращаться на уроках и в сообщениях.',
    cta: 'Дальше',
  },
  {
    id: 'lesson',
    image: lexiBook,
    title: 'Как устроен урок',
    text: 'Каждый блок слов — это три шага:\n1) Учим слова\n2) Проверка — нужно 100%\n3) Игра — нужно 90%\nПосле этого слова попадают в библиотеку!',
    cta: 'Понятно',
  },
  {
    id: 'library',
    image: lexiHappy,
    title: 'Библиотека',
    text: 'В «Библиотеке» живут все выученные слова. Туда же можно заглянуть, чтобы вспомнить, что уже знаешь, и посмотреть, что будет дальше.',
    cta: 'Дальше',
  },
  {
    id: 'gifts',
    image: lexiHello,
    title: 'Подарки за слова',
    text: 'Чем больше слов выучишь — тем ближе подарки! Можно взять готовый список Lexi или потом составить свой в разделе «Подарки».',
    cta: defaultsLoaded.value ? 'Дальше' : 'Загрузить подарки Lexi',
  },
  {
    id: 'ready',
    image: lexiHappy,
    title: `Отлично${childName.value.trim() ? `, ${childName.value.trim()}` : ''}!`,
    text: 'Нажимай «Учить слова» — и мы начнём первый урок. Я рядом, если что-то непонятно. Поехали?',
    cta: 'Начать!',
  },
])

const current = computed(() => steps.value[step.value]!)
const isLast = computed(() => step.value >= steps.value.length - 1)
const isNameStep = computed(() => current.value.id === 'name')
const isGiftsStep = computed(() => current.value.id === 'gifts')

async function saveName() {
  const name = childName.value.trim()
  if (!name) {
    errorMsg.value = 'Напиши, пожалуйста, имя'
    return false
  }
  if (name.length > 40) {
    errorMsg.value = 'Имя слишком длинное'
    return false
  }
  await $fetch('/api/profile', {
    method: 'PATCH',
    body: { childName: name },
    headers: maxAuthHeaders(),
  })
  await fetchSession()
  return true
}

async function ensureDefaults() {
  if (defaultsLoaded.value) return true
  await loadDefaults(true)
  defaultsLoaded.value = true
  return true
}

async function next() {
  if (busy.value) return
  busy.value = true
  errorMsg.value = ''
  try {
    if (isNameStep.value) {
      const ok = await saveName()
      if (!ok) return
    }
    if (isGiftsStep.value && !defaultsLoaded.value) {
      await ensureDefaults()
      // Stay on gifts step once so user sees "Дальше"
      return
    }
    if (isLast.value) {
      await $fetch('/api/onboarding/complete', { method: 'POST', headers: maxAuthHeaders() })
      await fetchSession()
      emit('done')
      return
    }
    step.value += 1
  }
  catch (e: unknown) {
    const err = e as { data?: { statusMessage?: string }; statusMessage?: string; message?: string }
    errorMsg.value = err?.data?.statusMessage || err?.statusMessage || err?.message || 'Что-то пошло не так'
  }
  finally {
    busy.value = false
  }
}

function skipGiftsLoad() {
  defaultsLoaded.value = true
  step.value += 1
}
</script>

<template>
  <div class="fixed inset-0 z-[60] flex flex-col max-w-lg mx-auto bg-gradient-to-b from-[#fff7fb] via-[#f7f0ff] to-[#fff8ef]">
    <div class="flex-1 min-h-0 flex flex-col items-center justify-center app-screen-x px-4 py-6">
      <p class="text-xs font-extrabold uppercase tracking-wide text-[#9a7ab0] mb-3">
        Знакомство · {{ step + 1 }} / {{ steps.length }}
      </p>

      <img
        :src="current.image"
        alt="Лекси"
        class="w-40 h-40 sm:w-48 sm:h-48 object-contain drop-shadow-xl animate-float mb-4"
      >

      <div class="home-bubble w-full rounded-[1.5rem] px-5 py-5 text-center shadow-lg">
        <h2 class="text-2xl sm:text-3xl font-extrabold text-[#6b4f8a] mb-2">
          {{ current.title }}
        </h2>
        <p class="text-sm sm:text-base text-[#7a6a8a] font-semibold whitespace-pre-line leading-relaxed">
          {{ current.text }}
        </p>

        <div v-if="isNameStep" class="mt-4">
          <input
            v-model="childName"
            type="text"
            maxlength="40"
            placeholder="Например, Ева"
            class="w-full rounded-2xl border-2 border-[#f0d8ea] bg-white px-4 py-3 text-center text-lg font-extrabold text-[#6b4f8a] outline-none focus:border-[#d4a8e8]"
            @keyup.enter="next"
          >
        </div>

        <div v-if="isGiftsStep && defaultsLoaded" class="mt-3 text-sm font-extrabold text-emerald-600">
          Стандартные подарки загружены
        </div>

        <p v-if="errorMsg" class="mt-3 text-sm font-bold text-red-500">
          {{ errorMsg }}
        </p>
      </div>
    </div>

    <div class="flex-shrink-0 app-screen-x app-screen-bottom flex flex-col gap-2 pb-4 pt-2">
      <button
        class="w-full py-4 rounded-2xl text-lg font-extrabold text-white bg-gradient-to-r from-[#f7a8c8] to-[#b794f6] shadow-lg active:scale-[0.98] transition-transform disabled:opacity-60"
        :disabled="busy"
        @click="next"
      >
        {{ current.cta }}
      </button>
      <button
        v-if="isGiftsStep && !defaultsLoaded"
        class="w-full py-3 rounded-2xl text-sm font-extrabold text-[#9a7ab0] bg-white/70 active:scale-[0.98]"
        :disabled="busy"
        @click="skipGiftsLoad"
      >
        Пропустить — настрою потом
      </button>
    </div>
  </div>
</template>
