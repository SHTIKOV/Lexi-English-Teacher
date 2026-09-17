<script setup lang="ts">
import lexiHello from '~/assets/lexi-hello.png'

const {
  status,
  errorMessage,
  loginFromMax,
  loginAsTest,
  loginAsAnonymous,
  loggedIn,
  testAuthEnabled,
  loadFeatures,
  isInsideMax,
} = useMaxAuth()
const config = useRuntimeConfig()
const testBusy = ref(false)

onMounted(async () => {
  await loadFeatures()

  if (loggedIn.value) {
    await navigateTo('/')
    return
  }

  if (isInsideMax()) {
    const ok = await loginFromMax()
    if (ok) await navigateTo('/')
    return
  }

  if (testAuthEnabled.value) {
    const ok = await loginAsAnonymous()
    if (ok) {
      await navigateTo('/')
      return
    }
  }

  status.value = 'outside'
})

async function onTestLogin(preset: 'anon' | 'default' | '1' | '2' = 'anon') {
  testBusy.value = true
  const ok = await loginAsTest(preset)
  testBusy.value = false
  if (ok) await navigateTo('/')
}
</script>

<template>
  <div class="app-screen flex flex-col max-w-lg mx-auto items-center justify-center px-6">
    <img :src="lexiHello" alt="Lexi" class="w-40 h-40 object-contain drop-shadow-xl animate-float mb-4">
    <h1 class="text-3xl font-extrabold text-purple-600 text-center mb-2">Lexi</h1>

    <template v-if="status === 'loading' || status === 'idle'">
      <p class="text-gray-600 text-center">
        {{ testAuthEnabled ? 'Входим как аноним…' : 'Входим…' }}
      </p>
    </template>

    <template v-else>
      <p v-if="status === 'outside' && !testAuthEnabled" class="text-gray-700 text-center font-bold mb-2">
        Открой Lexi внутри мессенджера MAX
      </p>
      <p v-if="status === 'outside' && !testAuthEnabled" class="text-gray-500 text-center text-sm mb-4">
        Из обычного браузера обычный вход закрыт.
      </p>
      <p v-if="config.public.maxBotUsername" class="text-sm text-purple-600 font-semibold text-center mb-4">
        Ссылка: https://max.ru/{{ config.public.maxBotUsername }}?startapp
      </p>

      <p v-if="status === 'error'" class="text-red-500 text-sm font-bold mb-4 text-center">
        {{ errorMessage || 'Ошибка входа' }}
      </p>

      <button
        v-if="status === 'error' && isInsideMax()"
        class="w-full py-4 rounded-2xl text-lg font-bold text-white bg-gradient-to-r from-purple-400 to-pink-500 shadow-lg mb-3"
        @click="loginFromMax().then((ok) => ok && navigateTo('/'))"
      >
        Попробовать снова
      </button>

      <div
        v-if="testAuthEnabled"
        class="w-full mt-2 rounded-3xl bg-white/80 border border-amber-200 p-4 shadow-md"
      >
        <p class="text-center text-amber-800 font-extrabold text-sm mb-1">
          Тестовая авторизация
        </p>
        <p class="text-center text-amber-700/80 text-xs mb-3">
          Без MAX — можно войти прямо здесь
        </p>
        <div class="flex flex-col gap-2">
          <button
            class="w-full py-3 rounded-2xl text-base font-bold text-white bg-gradient-to-r from-amber-400 to-orange-500 shadow active:scale-95 transition-transform disabled:opacity-50"
            :disabled="testBusy"
            @click="onTestLogin('anon')"
          >
            Войти анонимом
          </button>
          <div class="grid grid-cols-2 gap-2">
            <button
              class="py-3 rounded-2xl text-sm font-bold text-amber-900 bg-amber-100 active:scale-95 transition-transform disabled:opacity-50"
              :disabled="testBusy"
              @click="onTestLogin('1')"
            >
              Тест 1
            </button>
            <button
              class="py-3 rounded-2xl text-sm font-bold text-amber-900 bg-amber-100 active:scale-95 transition-transform disabled:opacity-50"
              :disabled="testBusy"
              @click="onTestLogin('2')"
            >
              Тест 2
            </button>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
