import { asc, eq } from 'drizzle-orm'
import { useDb } from '../../db/client'
import { userBlockProgress, wordBlocks } from '../../db/schema'
import { requireUser } from '../../utils/auth'
import { blockTitle, isBlockCompleted } from '../../utils/catalog'

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const db = useDb()

  const blocks = await db.select().from(wordBlocks).orderBy(asc(wordBlocks.sortOrder))
  const progressRows = await db
    .select()
    .from(userBlockProgress)
    .where(eq(userBlockProgress.userId, user.id))
  const progressByBlock = new Map(progressRows.map((p) => [p.blockId, p]))

  const learned = blocks
    .filter((b) => isBlockCompleted(progressByBlock.get(b.id)))
    .map((b, i) => ({
      id: b.id,
      title: blockTitle(b, i + 1),
      words: b.words,
      sortOrder: b.sortOrder,
    }))

  return { blocks: learned }
})
