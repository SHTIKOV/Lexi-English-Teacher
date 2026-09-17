import { subscribeMaxWebhook } from '../../utils/maxBot'

/**
 * Registers Max webhook subscription.
 * POST /api/max/subscribe-webhook  Authorization: Bearer $CRON_SECRET
 */
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const expected = String(process.env.CRON_SECRET || config.cronSecret || '').trim()
  const auth = getHeader(event, 'authorization') || ''
  const bearer = auth.match(/^Bearer\s+(.+)$/i)?.[1]?.trim()
  if (!expected || bearer !== expected) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const appUrl = String(process.env.NUXT_PUBLIC_APP_URL || config.public.appUrl || '')
    .trim()
    .replace(/\/$/, '')
  if (!appUrl.startsWith('https://')) {
    throw createError({ statusCode: 400, statusMessage: 'NUXT_PUBLIC_APP_URL must be https://...' })
  }

  const secret = String(process.env.MAX_WEBHOOK_SECRET || config.maxWebhookSecret || '').trim()
  if (!secret || secret.length < 5) {
    throw createError({ statusCode: 400, statusMessage: 'MAX_WEBHOOK_SECRET required (5+ chars)' })
  }

  const webhookUrl = `${appUrl}/api/max/webhook`
  const result = await subscribeMaxWebhook(webhookUrl, secret)
  if (!result.ok) {
    throw createError({
      statusCode: 502,
      statusMessage: `Subscription failed: ${result.raw.slice(0, 300)}`,
    })
  }

  return { ok: true, webhookUrl, response: result.raw }
})
