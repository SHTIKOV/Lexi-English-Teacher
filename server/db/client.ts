import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

let _db: ReturnType<typeof drizzle<typeof schema>> | null = null

export function useDb() {
  const config = useRuntimeConfig()
  const url = process.env.DATABASE_URL || (config.databaseUrl as string)
  if (!url) {
    throw createError({ statusCode: 500, statusMessage: 'DATABASE_URL is not configured' })
  }
  if (!_db) {
    const client = postgres(url, { max: 10 })
    _db = drizzle(client, { schema })
  }
  return _db
}
