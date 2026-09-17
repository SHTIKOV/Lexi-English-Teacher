import { isTestAuthEnabled } from '../../utils/testLogin'

export default defineEventHandler(() => {
  return {
    testAuth: isTestAuthEnabled(),
    maxConfigured: Boolean(process.env.MAX_BOT_TOKEN || useRuntimeConfig().maxBotToken),
  }
})
