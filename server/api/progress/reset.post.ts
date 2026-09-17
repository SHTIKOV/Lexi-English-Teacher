import { and, asc, eq } from 'drizzle-orm'
import { useDb } from '../../db/client'
import { userBlockProgress, wordBlocks } from '../../db/schema'
import { requireUser } from '../../utils/auth'
import { isBlockCompleted } from '../../utils/catalog'

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const body = await readBody<{ blockId?: number }>(event)
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
  if (body?.blockId && body.blockId !== current.id) {
    throw createError({ statusCode: 400, statusMessage: 'blockId does not match current block' })
  }

  const existing = progressByBlock.get(current.id)
  if (existing) {
    await db
      .update(userBlockProgress)
      .set({
        learned: false,
        quizPassed: false,
        playPassed: false,
        completedAt: null,
      })
      .where(and(eq(userBlockProgress.userId, user.id), eq(userBlockProgress.blockId, current.id)))
  }

  return { blockId: current.id, stage: 'learn' as const }
})
