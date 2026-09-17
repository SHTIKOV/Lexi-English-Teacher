export default defineNuxtPlugin({
  name: 'max-fetch',
  enforce: 'pre',
  setup() {
    const previous = globalThis.$fetch
    globalThis.$fetch = previous.create({
      onRequest({ options }) {
        if (!import.meta.client) return
        const initData = window.WebApp?.initData?.trim()
        if (!initData) return

        const headers = new Headers(options.headers as HeadersInit)
        if (!headers.has('x-max-init-data')) {
          headers.set('x-max-init-data', encodeURIComponent(initData))
        }
        options.headers = headers
      },
    })
  },
})
