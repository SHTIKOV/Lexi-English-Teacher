import { asc, eq } from 'drizzle-orm'
import { useDb } from '../../db/client'
import { userBlockProgress, wordBlocks } from '../../db/schema'
import { requireUser } from '../../utils/auth'
import { flattenWords, isBlockCompleted } from '../../utils/catalog'

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const db = useDb()

  const blocks = await db.select().from(wordBlocks).orderBy(asc(wordBlocks.sortOrder))
  const progressRows = await db
    .select()
    .from(userBlockProgress)
    .where(eq(userBlockProgress.userId, user.id))
  const progressByBlock = new Map(progressRows.map((p) => [p.blockId, p]))

  const learnedBlocks = blocks.filter((b) => isBlockCompleted(progressByBlock.get(b.id)))
  const remainingBlocks = blocks.filter((b) => !isBlockCompleted(progressByBlock.get(b.id)))

  return {
    learned: flattenWords(learnedBlocks),
    remaining: flattenWords(remainingBlocks),
    all: flattenWords(blocks),
  }
})
