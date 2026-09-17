import { and, asc, eq } from 'drizzle-orm'
import { useDb } from '../../db/client'
import { userBlockProgress, wordBlocks } from '../../db/schema'
import { requireUser } from '../../utils/auth'
import { isBlockCompleted, stageFromProgress } from '../../utils/catalog'
import type { ProgressStage } from '#shared/types'

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const body = await readBody<{ stage?: ProgressStage; blockId?: number }>(event)
  if (!body.stage || !['learn', 'quiz', 'play'].includes(body.stage)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid stage' })
  }

  const db = useDb()
  const blocks = await db.select().from(wordBlocks).orderBy(asc(wordBlocks.sortOrder))
  const progressRows = await db
    .select()
    .from(userBlockProgress)
    .where(eq(userBlockProgress.userId, user.id))
  const progressByBlock = new Map(progressRows.map((p) => [p.blockId, p]))

  const current = blocks.find((b) => !isBlockCompleted(progressByBlock.get(b.id)))
  if (!current) {
    throw createError({ statusCode: 400, statusMessage: 'No current block' })
  }
  if (body.blockId && body.blockId !== current.id) {
    throw createError({ statusCode: 400, statusMessage: 'blockId does not match current block' })
  }

  const existing = progressByBlock.get(current.id)
  const next = {
    learned: existing?.learned ?? false,
    quizPassed: existing?.quizPassed ?? false,
    playPassed: existing?.playPassed ?? false,
    completedAt: existing?.completedAt ?? null,
  }

  if (body.stage === 'learn') {
    next.learned = true
  }
  else if (body.stage === 'quiz') {
    if (!next.learned) {
      throw createError({ statusCode: 400, statusMessage: 'Learn stage required first' })
    }
    next.quizPassed = true
  }
  else if (body.stage === 'play') {
    if (!next.quizPassed) {
      throw createError({ statusCode: 400, statusMessage: 'Quiz stage required first' })
    }
    next.playPassed = true
    next.completedAt = new Date()
  }

  if (existing) {
    await db
      .update(userBlockProgress)
      .set(next)
      .where(and(eq(userBlockProgress.userId, user.id), eq(userBlockProgress.blockId, current.id)))
  }
  else {
    await db.insert(userBlockProgress).values({
      userId: user.id,
      blockId: current.id,
      ...next,
    })
  }

  const updated = {
    ...existing,
    ...next,
    userId: user.id,
    blockId: current.id,
  }

  return {
    blockId: current.id,
    stage: stageFromProgress(updated as typeof existing),
    completed: Boolean(next.completedAt),
  }
})
