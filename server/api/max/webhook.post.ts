import { sendWelcomeMessage } from '../../utils/maxBot'

interface MaxUser {
  user_id?: number
  id?: number
  first_name?: string
  name?: string
  username?: string | null
}

interface MaxUpdate {
  update_type?: string
  timestamp?: number
  chat_id?: number
  user?: MaxUser
  message?: {
    sender?: MaxUser
    body?: { text?: string | null }
    recipient?: { user_id?: number; chat_id?: number }
  }
}

function extractUserId(update: MaxUpdate): string | null {
  const id = update.user?.user_id
    ?? update.user?.id
    ?? update.message?.sender?.user_id
    ?? update.message?.sender?.id
    ?? update.message?.recipient?.user_id
  return id != null ? String(id) : null
}

function extractName(update: MaxUpdate): string | undefined {
  const u = update.user || update.message?.sender
  return u?.first_name || u?.name || u?.username || undefined
}

function isStartCommand(text: string | null | undefined): boolean {
  if (!text) return false
  const t = text.trim().toLowerCase()
  return (
    t === '/start'
    || t.startsWith('/start ')
    || t === 'start'
    || t === 'старт'
    || t === 'начать'
    || t === 'играть'
    || t === 'меню'
  )
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const expectedSecret = String(process.env.MAX_WEBHOOK_SECRET || config.maxWebhookSecret || '').trim()
  if (expectedSecret) {
    const got = getHeader(event, 'x-max-bot-api-secret')?.trim()
    if (got !== expectedSecret) {
      throw createError({ statusCode: 401, statusMessage: 'Invalid webhook secret' })
    }
  }

  const update = await readBody<MaxUpdate>(event).catch(() => null)
  if (!update?.update_type) {
    return { ok: true }
  }

  const type = update.update_type
  const shouldGreet = type === 'bot_started'
    || (type === 'message_created' && isStartCommand(update.message?.body?.text))

  if (!shouldGreet) {
    return { ok: true, skipped: type }
  }

  const userId = extractUserId(update)
  if (!userId) {
    console.error('[max-webhook] no user id', JSON.stringify(update).slice(0, 500))
    return { ok: true, skipped: 'no-user' }
  }

  const result = await sendWelcomeMessage(userId, extractName(update))
  if (!result.ok) {
    console.error('[max-webhook] welcome failed', userId, result)
  }

  return { ok: true, greeted: userId, sent: result.ok }
})
