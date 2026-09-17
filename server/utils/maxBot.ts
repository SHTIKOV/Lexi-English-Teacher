const MAX_API = 'https://platform-api2.max.ru'

export type MaxSendResult =
  | { ok: true; messageId?: string }
  | { ok: false; status: number; error: string }

function botToken(): string {
  const config = useRuntimeConfig()
  return String(process.env.MAX_BOT_TOKEN || config.maxBotToken || '').trim()
}

export function isRealMaxUserId(maxId: string): boolean {
  return /^\d+$/.test(maxId.trim())
}

function botUsername(): string {
  return String(useRuntimeConfig().public.maxBotUsername || '').trim().replace(/^@/, '')
}

function appPublicUrl(): string {
  const config = useRuntimeConfig()
  return String(process.env.NUXT_PUBLIC_APP_URL || config.public.appUrl || '')
    .trim()
    .replace(/\/$/, '')
}

export async function sendMaxMessageToUser(
  userId: string | number,
  text: string,
  options?: {
    openAppText?: string
    botUsername?: string
    imageUrl?: string
  },
): Promise<MaxSendResult> {
  const token = botToken()
  if (!token) {
    return { ok: false, status: 0, error: 'MAX_BOT_TOKEN is not configured' }
  }

  const attachments: unknown[] = []

  if (options?.imageUrl) {
    attachments.push({
      type: 'image',
      payload: { url: options.imageUrl },
    })
  }

  const username = options?.botUsername || botUsername()
  if (username) {
    attachments.push({
      type: 'inline_keyboard',
      payload: {
        buttons: [[
          {
            type: 'open_app',
            text: options?.openAppText || 'Играть',
            web_app: username,
          },
        ]],
      },
    })
  }

  const url = `${MAX_API}/messages?user_id=${encodeURIComponent(String(userId))}`
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: token,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        notify: true,
        ...(attachments.length ? { attachments } : {}),
      }),
    })

    const raw = await res.text()
    if (!res.ok) {
      return { ok: false, status: res.status, error: raw.slice(0, 500) || res.statusText }
    }

    let messageId: string | undefined
    try {
      const parsed = JSON.parse(raw) as { message?: { body?: { mid?: string }; mid?: string } }
      messageId = parsed.message?.body?.mid || parsed.message?.mid
    }
    catch {
      // ignore
    }

    return { ok: true, messageId }
  }
  catch (err) {
    return {
      ok: false,
      status: 0,
      error: err instanceof Error ? err.message : String(err),
    }
  }
}

export function welcomeLexiImageUrl(): string | undefined {
  const base = appPublicUrl()
  if (!base) return undefined
  return `${base}/lexi-welcome.jpg`
}

export async function sendWelcomeMessage(
  userId: string | number,
  displayName?: string,
): Promise<MaxSendResult> {
  const name = displayName?.trim() || 'друг'
  const text = [
    `Привет, ${name}! 👋`,
    '',
    'Я Лекси — твой английский друг.',
    'Давай учить слова, играть и открывать подарки!',
    '',
    'Нажми «Играть», чтобы начать ✨',
  ].join('\n')

  return sendMaxMessageToUser(userId, text, {
    openAppText: 'Играть',
    imageUrl: welcomeLexiImageUrl(),
  })
}

export async function subscribeMaxWebhook(webhookUrl: string, secret: string): Promise<{ ok: boolean; raw: string }> {
  const token = botToken()
  if (!token) return { ok: false, raw: 'no token' }

  const res = await fetch(`${MAX_API}/subscriptions`, {
    method: 'POST',
    headers: {
      Authorization: token,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      url: webhookUrl,
      update_types: ['bot_started', 'message_created'],
      secret,
    }),
  })
  const raw = await res.text()
  return { ok: res.ok, raw }
}
