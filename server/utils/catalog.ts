import type { LessonStage, Word } from '#shared/types'
import type { UserBlockProgress, WordBlockRow } from '../db/schema'

export function stageFromProgress(progress: UserBlockProgress | undefined | null): LessonStage {
  if (!progress) return 'learn'
  if (progress.playPassed || progress.completedAt) return 'done'
  if (progress.quizPassed) return 'play'
  if (progress.learned) return 'quiz'
  return 'learn'
}

export function isBlockCompleted(progress: UserBlockProgress | undefined | null): boolean {
  return Boolean(progress?.completedAt || progress?.playPassed)
}

export function blockTitle(block: WordBlockRow, fallbackIndex: number): string {
  return block.title || `Блок ${fallbackIndex}`
}

export function flattenWords(blocks: { words: Word[] }[]): Word[] {
  return blocks.flatMap((b) => b.words)
}
