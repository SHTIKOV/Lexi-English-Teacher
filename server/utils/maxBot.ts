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

export async function sendMaxMessageToUser(
  userId: string | number,
  text: string,
  options?: {
    openAppText?: string
    botUsername?: string
  },
): Promise<MaxSendResult> {
  const token = botToken()
  if (!token) {
    return { ok: false, status: 0, error: 'MAX_BOT_TOKEN is not configured' }
  }

  const attachments: unknown[] = []
  const botUsername = options?.botUsername || String(useRuntimeConfig().public.maxBotUsername || '').trim()
  if (botUsername) {
    attachments.push({
      type: 'inline_keyboard',
      payload: {
        buttons: [[
          {
            type: 'open_app',
            text: options?.openAppText || 'Учить слова',
            web_app: botUsername.replace(/^@/, ''),
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
      // ignore parse errors for successful sends
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
