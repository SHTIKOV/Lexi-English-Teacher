import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import tailwindcss from '@tailwindcss/vite'

const rootDir = dirname(fileURLToPath(import.meta.url))

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['nuxt-auth-utils'],
  css: ['~/assets/css/main.css'],
  alias: {
    '#shared': join(rootDir, 'shared'),
  },
  vite: {
    plugins: [tailwindcss()],
  },
  runtimeConfig: {
    session: {
      password: '',
      cookie: {
        // false for local HTTP docker; set SESSION_COOKIE_SECURE=1 behind HTTPS
        secure: process.env.SESSION_COOKIE_SECURE === '1',
        sameSite: 'lax' as const,
      },
    },
    databaseUrl: '',
    maxBotToken: '',
    maxDevBypass: '0',
    maxTestAuth: '1',
    public: {
      // Defaults as strings so NUXT_PUBLIC_*="1" overrides cleanly at runtime
      maxDevBypass: '0',
      maxTestAuth: '1',
      maxBotUsername: '',
    },
  },
  app: {
    head: {
      title: 'Lexi — Учим английский!',
      htmlAttrs: { lang: 'ru' },
      meta: [
        { charset: 'utf-8' },
        {
          name: 'viewport',
          content: 'width=device-width, initial-scale=1.0, viewport-fit=cover, interactive-widget=resizes-content',
        },
        { name: 'mobile-web-app-capable', content: 'yes' },
        { name: 'theme-color', content: '#fce4ec' },
      ],
      link: [
        { rel: 'icon', href: '/favicon.svg', type: 'image/svg+xml' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap',
        },
      ],
      script: [
        {
          src: 'https://st.max.ru/js/max-web-app.js',
          defer: true,
        },
      ],
    },
  },
})
