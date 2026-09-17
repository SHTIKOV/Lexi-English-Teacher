import { asc, eq } from 'drizzle-orm'
import { useDb } from '../../db/client'
import { userBlockProgress, wordBlocks } from '../../db/schema'
import { requireUser } from '../../utils/auth'
import { blockTitle, isBlockCompleted, stageFromProgress } from '../../utils/catalog'

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const db = useDb()

  const blocks = await db.select().from(wordBlocks).orderBy(asc(wordBlocks.sortOrder))
  const progressRows = await db
    .select()
    .from(userBlockProgress)
    .where(eq(userBlockProgress.userId, user.id))

  const progressByBlock = new Map(progressRows.map((p) => [p.blockId, p]))

  const completedBlocks = blocks.filter((b) => isBlockCompleted(progressByBlock.get(b.id)))
  const current = blocks.find((b) => !isBlockCompleted(progressByBlock.get(b.id))) ?? null
  const remainingBlocks = blocks.filter((b) => !isBlockCompleted(progressByBlock.get(b.id)))

  const learnedCount = completedBlocks.reduce((sum, b) => sum + b.words.length, 0)
  const totalBlocks = blocks.length
  const currentIndex = current ? blocks.findIndex((b) => b.id === current.id) + 1 : null

  const progress = current ? progressByBlock.get(current.id) : null

  return {
    currentBlock: current
      ? {
          id: current.id,
          title: blockTitle(current, currentIndex ?? 1),
          words: current.words,
          sortOrder: current.sortOrder,
          blockNumber: currentIndex,
          totalBlocks,
        }
      : null,
    stage: stageFromProgress(progress),
    learnedCount,
    remainingCount: remainingBlocks.reduce((sum, b) => sum + b.words.length, 0),
    totalWords: blocks.reduce((sum, b) => sum + b.words.length, 0),
    totalBlocks,
    completedBlocks: completedBlocks.length,
  }
})
