import type { LessonStage, ProgressStage, Reward, Word } from '#shared/types'

export interface CurrentCatalog {
  currentBlock: {
    id: number
    title: string
    words: Word[]
    sortOrder: number
    blockNumber: number | null
    totalBlocks: number
  } | null
  stage: LessonStage
  learnedCount: number
  remainingCount: number
  totalWords: number
  totalBlocks: number
  completedBlocks: number
}

export function useCatalog() {
  const catalog = useState<CurrentCatalog | null>('catalog', () => null)
  const pending = useState('catalog-pending', () => false)
  const { rewards, refresh: refreshRewards } = useRewards()

  async function refresh() {
    pending.value = true
    try {
      const [cat] = await Promise.all([
        $fetch<CurrentCatalog>('/api/catalog/current'),
        refreshRewards(),
      ])
      catalog.value = cat
    }
    finally {
      pending.value = false
    }
    return catalog.value
  }

  async function completeStage(stage: ProgressStage) {
    const blockId = catalog.value?.currentBlock?.id
    await $fetch('/api/progress', {
      method: 'PATCH',
      body: { stage, blockId },
    })
    return refresh()
  }

  async function resetProgress() {
    const blockId = catalog.value?.currentBlock?.id
    await $fetch('/api/progress/reset', {
      method: 'POST',
      body: { blockId },
    })
    return refresh()
  }

  const nextReward = computed(() => {
    const count = catalog.value?.learnedCount ?? 0
    return rewards.value.find((r: Reward) => count < r.words) ?? null
  })

  return {
    catalog,
    pending,
    rewards,
    nextReward,
    refresh,
    completeStage,
    resetProgress,
  }
}
