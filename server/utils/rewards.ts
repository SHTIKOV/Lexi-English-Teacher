import { asc, eq } from 'drizzle-orm'
import type { Reward } from '#shared/types'
import { defaultRewards } from '#shared/rewards'
import { useDb } from '../db/client'
import { userRewards, type UserReward } from '../db/schema'

export function toReward(row: UserReward): Reward {
  return {
    id: row.id,
    words: row.words,
    title: row.title,
    emoji: row.emoji,
    description: row.description,
    details: row.details ?? undefined,
  }
}

export async function listUserRewards(userId: number): Promise<Reward[]> {
  const db = useDb()
  const rows = await db
    .select()
    .from(userRewards)
    .where(eq(userRewards.userId, userId))
    .orderBy(asc(userRewards.words))
  return rows.map(toReward)
}

export function nextRewardFromList(rewards: Reward[], learnedCount: number): Reward | null {
  return rewards.find((r) => learnedCount < r.words) ?? null
}

export function getDefaultRewardTemplates(): Reward[] {
  return defaultRewards.map((r) => ({
    words: r.words,
    title: r.title,
    emoji: r.emoji,
    description: r.description,
    details: r.details,
  }))
}

export function parseRewardInput(body: Partial<Reward>): {
  words: number
  title: string
  emoji: string
  description: string
  details: string | null
} {
  const words = Number(body.words)
  const title = String(body.title ?? '').trim()
  const emoji = String(body.emoji ?? '🎁').trim() || '🎁'
  const description = String(body.description ?? '').trim()
  const detailsRaw = body.details == null ? '' : String(body.details).trim()

  if (!Number.isInteger(words) || words < 1 || words > 100_000) {
    throw createError({ statusCode: 400, statusMessage: 'words must be an integer from 1 to 100000' })
  }
  if (!title || title.length > 80) {
    throw createError({ statusCode: 400, statusMessage: 'title is required (max 80)' })
  }
  if (emoji.length > 16) {
    throw createError({ statusCode: 400, statusMessage: 'emoji is too long' })
  }
  if (description.length > 200) {
    throw createError({ statusCode: 400, statusMessage: 'description max 200' })
  }
  if (detailsRaw.length > 2000) {
    throw createError({ statusCode: 400, statusMessage: 'details max 2000' })
  }

  return {
    words,
    title,
    emoji,
    description: description || title,
    details: detailsRaw || null,
  }
}
