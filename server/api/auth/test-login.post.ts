import { isTestAuthEnabled, loginTestUser, type TestPreset, TEST_PRESETS } from '../../utils/testLogin'

export default defineEventHandler(async (event) => {
  if (!isTestAuthEnabled()) {
    throw createError({ statusCode: 403, statusMessage: 'Test auth disabled' })
  }

  const body = await readBody<{ preset?: string }>(event).catch(() => ({} as { preset?: string }))
  const key = (body?.preset && body.preset in TEST_PRESETS ? body.preset : 'anon') as TestPreset
  const user = await loginTestUser(event, key)
  return { user }
})
