import { sendDailyReminders } from '../../utils/dailyReminders'

function cronAuthorized(event: Parameters<typeof getHeader>[0]): boolean {
  const config = useRuntimeConfig()
  const expected = String(process.env.CRON_SECRET || config.cronSecret || '').trim()
  if (!expected) return false

  const auth = getHeader(event, 'authorization') || ''
  const bearer = auth.match(/^Bearer\s+(.+)$/i)?.[1]?.trim()
  const headerSecret = getHeader(event, 'x-cron-secret')?.trim()
  return bearer === expected || headerSecret === expected
}

export default defineEventHandler(async (event) => {
  if (!cronAuthorized(event)) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const query = getQuery(event)
  const force = query.force === '1' || query.force === 'true'

  const report = await sendDailyReminders({ force })
  return {
    ok: true,
    force,
    ...report,
  }
})
