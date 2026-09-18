import { asc } from 'drizzle-orm'
import { useDb } from '../db/client'
import { userBlockProgress, users, wordBlocks } from '../db/schema'
import { isBlockCompleted } from './catalog'
import type { RankedUser } from '#shared/leaderboard'
import { selectLeaderboardSlice } from '#shared/leaderboard'

export async function buildLeaderboard(currentUserId: number) {
  const db = useDb()

  const [allUsers, blocks, progressRows] = await Promise.all([
    db.select().from(users).orderBy(asc(users.id)),
    db.select().from(wordBlocks),
    db.select().from(userBlockProgress),
  ])

  const wordsByBlock = new Map(blocks.map((b) => [b.id, b.words.length]))
  const progressByUser = new Map<number, typeof progressRows>()

  for (const row of progressRows) {
    const list = progressByUser.get(row.userId)
    if (list) list.push(row)
    else progressByUser.set(row.userId, [row])
  }

  const scored = allUsers.map((u) => {
    const rows = progressByUser.get(u.id) || []
    let learnedCount = 0
    for (const p of rows) {
      if (!isBlockCompleted(p)) continue
      learnedCount += wordsByBlock.get(p.blockId) || 0
    }
    return {
      userId: u.id,
      maxId: u.maxId,
      childName: u.childName,
      displayName: u.displayName,
      avatarUrl: u.avatarUrl,
      learnedCount,
    }
  })

  scored.sort((a, b) => {
    if (b.learnedCount !== a.learnedCount) return b.learnedCount - a.learnedCount
    return a.userId - b.userId
  })

  const ranked: RankedUser[] = scored.map((u, i) => ({
    ...u,
    rank: i + 1,
  }))

  const slice = selectLeaderboardSlice(ranked, currentUserId)

  return {
    ...slice,
    meUserId: currentUserId,
  }
}
