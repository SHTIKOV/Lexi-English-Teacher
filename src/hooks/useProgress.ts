import { useCallback, useState } from 'react'
import type { Word, LessonProgress, LessonStage } from '../types'

const STORAGE_KEY = 'lexi-lesson-progress-v1'

const EMPTY: LessonProgress = { blockKey: '', learned: false, quizPassed: false, playPassed: false }

export function blockKeyOf(words: Word[]): string {
  return words.map(w => w.en).join('|')
}

function read(): LessonProgress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return EMPTY
    return { ...EMPTY, ...JSON.parse(raw) } as LessonProgress
  } catch {
    return EMPTY
  }
}

/**
 * Прогресс текущего урока: учим → проверка (100%) → игра (90%) → урок пройден.
 * Сбрасывается сам, когда родитель переносит блок в изученные и текущим становится новый.
 */
export function useProgress(currentWords: Word[]) {
  const [stored, setStored] = useState<LessonProgress>(read)

  const blockKey = blockKeyOf(currentWords)
  // Прогресс от другого блока не в счёт: родитель перенёс слова — урок начинается заново.
  const progress = stored.blockKey === blockKey ? stored : { ...EMPTY, blockKey }

  const save = useCallback((next: LessonProgress) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    setStored(next)
  }, [])

  const complete = useCallback((stage: Exclude<LessonStage, 'done'>) => {
    setStored(s => {
      const p = s.blockKey === blockKey ? s : { ...EMPTY, blockKey }
      const next =
        stage === 'learn' ? { ...p, learned: true }
        : stage === 'quiz' ? { ...p, quizPassed: true }
        : { ...p, playPassed: true }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      return next
    })
  }, [blockKey])

  const reset = useCallback(() => save({ ...EMPTY, blockKey }), [save, blockKey])

  const learned = progress.learned
  const quizPassed = learned && progress.quizPassed
  const playPassed = quizPassed && progress.playPassed

  const stage: LessonStage = playPassed ? 'done' : quizPassed ? 'play' : learned ? 'quiz' : 'learn'

  return { stage, learned, quizPassed, playPassed, complete, reset }
}
