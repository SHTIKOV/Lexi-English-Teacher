import type { LessonStage, ProgressStage, Word } from '#shared/types'
import { rewards } from '#shared/rewards'

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

  async function refresh() {
    pending.value = true
    try {
      catalog.value = await $fetch<CurrentCatalog>('/api/catalog/current')
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
    return rewards.find((r) => count < r.words) ?? null
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
