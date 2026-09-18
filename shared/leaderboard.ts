export interface RankedUser {
  userId: number
  maxId: string
  childName: string
  displayName: string
  avatarUrl: string | null
  learnedCount: number
  rank: number
}

export interface LeaderboardSlice {
  entries: RankedUser[]
  /** Ellipsis between top-9 and the neighborhood around the current user */
  showGapAfterTop: boolean
  meRank: number
  totalUsers: number
}

const LIMIT = 20
const TOP_COUNT = 9
const NEIGHBOR_BEFORE = 5
const NEIGHBOR_AFTER = 5
const BOTTOM_BEFORE = 10

/**
 * Pick ≤20 rows for the rating screen.
 * ≤20 users → everyone.
 * >20 and me in top 20 → top 20.
 * >20 and me below → top 9 + window around me (5+1+5, or 10+1 at the bottom).
 */
export function selectLeaderboardSlice(
  ranked: RankedUser[],
  currentUserId: number,
  limit = LIMIT,
): LeaderboardSlice {
  const totalUsers = ranked.length
  const meIndex = ranked.findIndex((u) => u.userId === currentUserId)
  const meRank = meIndex >= 0 ? meIndex + 1 : 0

  if (totalUsers <= limit) {
    return { entries: ranked, showGapAfterTop: false, meRank, totalUsers }
  }

  if (meIndex < 0) {
    return { entries: ranked.slice(0, limit), showGapAfterTop: false, meRank: 0, totalUsers }
  }

  // Already among the first `limit` — just show that prefix
  if (meIndex < limit) {
    return { entries: ranked.slice(0, limit), showGapAfterTop: false, meRank, totalUsers }
  }

  const top = ranked.slice(0, TOP_COUNT)
  const seen = new Set(top.map((u) => u.userId))

  let before = NEIGHBOR_BEFORE
  let after = NEIGHBOR_AFTER

  if (meIndex >= totalUsers - 1) {
    before = BOTTOM_BEFORE
    after = 0
  }
  else {
    after = Math.min(NEIGHBOR_AFTER, totalUsers - 1 - meIndex)
    if (after < NEIGHBOR_AFTER) {
      // Near the bottom: grow "ahead" so the window stays ~11 people
      before = Math.min(meIndex, BOTTOM_BEFORE - after)
    }
    else {
      before = Math.min(meIndex, NEIGHBOR_BEFORE)
    }
  }

  const windowStart = Math.max(0, meIndex - before)
  const windowEnd = Math.min(totalUsers - 1, meIndex + after)

  const entries = [...top]
  let showGapAfterTop = false

  for (let i = windowStart; i <= windowEnd; i++) {
    const u = ranked[i]!
    if (seen.has(u.userId)) continue
    if (entries.length === TOP_COUNT && i > TOP_COUNT) {
      showGapAfterTop = true
    }
    entries.push(u)
    seen.add(u.userId)
  }

  // Fill to `limit` if overlap shrunk the list
  for (let i = windowEnd + 1; i < totalUsers && entries.length < limit; i++) {
    const u = ranked[i]!
    if (seen.has(u.userId)) continue
    entries.push(u)
    seen.add(u.userId)
  }

  return {
    entries: entries.slice(0, limit),
    showGapAfterTop,
    meRank,
    totalUsers,
  }
}
