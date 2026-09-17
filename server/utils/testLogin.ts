import { eq } from 'drizzle-orm'
import type { H3Event } from 'h3'
import { useDb } from '../db/client'
import { users } from '../db/schema'
import { toSessionUser } from './auth'

export const TEST_PRESETS = {
  anon: { maxId: 'anon-guest', displayName: 'Аноним', childName: 'Малышка' },
  default: { maxId: 'test-user', displayName: 'Тестовый ученик', childName: 'Малышка' },
  '1': { maxId: 'test-user-1', displayName: 'Тест 1', childName: 'Малышка' },
  '2': { maxId: 'test-user-2', displayName: 'Тест 2', childName: 'Умница' },
} as const

export type TestPreset = keyof typeof TEST_PRESETS

export function isTestAuthEnabled() {
  const config = useRuntimeConfig()
  const truthy = (v: unknown) => v === true || v === '1' || v === 'true'
  return (
    truthy(process.env.MAX_TEST_AUTH)
    || truthy(process.env.MAX_DEV_BYPASS)
    || truthy(config.maxTestAuth)
    || truthy(config.maxDevBypass)
  )
}

export async function loginTestUser(event: H3Event, presetKey: TestPreset = 'anon') {
  if (!isTestAuthEnabled()) {
    throw createError({ statusCode: 403, statusMessage: 'Test auth disabled' })
  }

  const preset = TEST_PRESETS[presetKey] ?? TEST_PRESETS.anon
  const db = useDb()
  const existing = await db.select().from(users).where(eq(users.maxId, preset.maxId)).limit(1)

  let row = existing[0]
  if (!row) {
    const [created] = await db
      .insert(users)
      .values({
        maxId: preset.maxId,
        displayName: preset.displayName,
        childName: preset.childName,
      })
      .returning()
    row = created
  }

  const sessionUser = toSessionUser(row)
  await setUserSession(event, { user: sessionUser })
  return sessionUser
}
