import { readFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'

const MAX_API = 'https://platform-api2.max.ru'

export type MaxSendResult =
  | { ok: true; messageId?: string }
  | { ok: false; status: number; error: string }

let cachedWelcomeImageToken: string | null = process.env.MAX_WELCOME_IMAGE_TOKEN?.trim() || null

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

function welcomeImagePath(): string | null {
  const candidates = [
    resolve(process.cwd(), '.output/public/lexi-welcome.jpg'),
    resolve(process.cwd(), 'public/lexi-welcome.jpg'),
    resolve(process.cwd(), 'app/assets/lexi-hello.png'),
  ]
  return candidates.find((p) => existsSync(p)) || null
}

/** Upload Lexi welcome image to Max and cache attachment token. */
export async function ensureWelcomeImageToken(): Promise<string | null> {
  if (cachedWelcomeImageToken) return cachedWelcomeImageToken

  const token = botToken()
  const path = welcomeImagePath()
  if (!token || !path) return null

  try {
    const metaRes = await fetch(`${MAX_API}/uploads?type=image`, {
      method: 'POST',
      headers: { Authorization: token },
    })
    const meta = await metaRes.json() as { url?: string }
    if (!meta.url) return null

    const buf = readFileSync(path)
    const form = new FormData()
    const mime = path.endsWith('.png') ? 'image/png' : 'image/jpeg'
    const name = path.endsWith('.png') ? 'lexi-welcome.png' : 'lexi-welcome.jpg'
    form.append('data', new Blob([buf], { type: mime }), name)

    const upRes = await fetch(meta.url, { method: 'POST', body: form })
    const upText = await upRes.text()
    const up = JSON.parse(upText) as {
      token?: string
      photos?: Record<string, { token?: string } | Array<{ token?: string }>>
    }

    let imgToken = up.token || null
    if (!imgToken && up.photos) {
      const first = Object.values(up.photos)[0]
      if (Array.isArray(first)) imgToken = first[0]?.token || null
      else imgToken = first?.token || null
    }
    if (!imgToken) {
      const m = upText.match(/"token"\s*:\s*"([^"]+)"/)
      imgToken = m?.[1] || null
    }

    if (imgToken) {
      cachedWelcomeImageToken = imgToken
      // give Max a moment to process on first upload
      await new Promise((r) => setTimeout(r, 1500))
    }
    return imgToken
  }
  catch (err) {
    console.error('[maxBot] welcome image upload failed', err)
    return null
  }
}

export async function sendMaxMessageToUser(
  userId: string | number,
  text: string,
  options?: {
    openAppText?: string
    botUsername?: string
    imageToken?: string
    imageUrl?: string
  },
): Promise<MaxSendResult> {
  const token = botToken()
  if (!token) {
    return { ok: false, status: 0, error: 'MAX_BOT_TOKEN is not configured' }
  }

  const attachments: unknown[] = []

  if (options?.imageToken) {
    attachments.push({
      type: 'image',
      payload: { token: options.imageToken },
    })
  }
  else if (options?.imageUrl) {
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

  const imageToken = await ensureWelcomeImageToken()

  return sendMaxMessageToUser(userId, text, {
    openAppText: 'Играть',
    imageToken: imageToken || undefined,
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
