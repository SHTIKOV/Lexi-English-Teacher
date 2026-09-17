/** Headers for Max mini-app API auth (cookies often blocked in WebView). */
export function maxAuthHeaders(): Record<string, string> {
  if (!import.meta.client) return {}
  const initData = window.WebApp?.initData?.trim()
  if (!initData) return {}
  // encodeURIComponent — initData has & = % that are fine, but keep header-safe
  return { 'x-max-init-data': encodeURIComponent(initData) }
}
