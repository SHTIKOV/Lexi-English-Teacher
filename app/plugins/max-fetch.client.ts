export default defineNuxtPlugin(() => {
  // Attach Max initData to API calls — WebView often blocks session cookies.
  const previous = globalThis.$fetch
  globalThis.$fetch = previous.create({
    onRequest({ options }) {
      if (!import.meta.client) return
      const initData = window.WebApp?.initData
      if (!initData) return

      const headers = new Headers(options.headers as HeadersInit)
      if (!headers.has('x-max-init-data')) {
        headers.set('x-max-init-data', initData)
      }
      options.headers = headers
    },
  })
})
