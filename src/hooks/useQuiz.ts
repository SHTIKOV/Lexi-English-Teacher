import { useState, useCallback, useMemo } from 'react'
import type { Word } from '../types'

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export interface QuizQuestion {
  word: Word
  options: Word[]
  correctIndex: number
  reverse: boolean
}

export function useQuiz(words: Word[], allWords: Word[], questionCount?: number) {
  const questions = useMemo(() => {
    if (words.length === 0) return []
    const pool = shuffle(words).slice(0, questionCount ?? words.length)
    return shuffle(pool.map<QuizQuestion>((word, i) => {
      const others = shuffle(allWords.filter(w => w.en !== word.en)).slice(0, 3)
      const options = shuffle([word, ...others])
      return {
        word,
        options,
        correctIndex: options.findIndex(o => o.en === word.en),
        reverse: i % 2 === 1,
      }
    }))
  }, [words, allWords, questionCount])

  const [currentIndex, setCurrentIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [answered, setAnswered] = useState<number | null>(null)
  const [finished, setFinished] = useState(false)

  const current = questions[currentIndex] ?? null
  const total = questions.length

  const answer = useCallback((optionIndex: number) => {
    if (answered !== null || !current) return
    setAnswered(optionIndex)
    if (optionIndex === current.correctIndex) {
      setScore(s => s + 1)
    }
  }, [answered, current])

  const next = useCallback(() => {
    if (currentIndex + 1 >= total) {
      setFinished(true)
    } else {
      setCurrentIndex(i => i + 1)
      setAnswered(null)
    }
  }, [currentIndex, total])

  const reset = useCallback(() => {
    setCurrentIndex(0)
    setScore(0)
    setAnswered(null)
    setFinished(false)
  }, [])

  return { current, currentIndex, total, score, answered, finished, answer, next, reset }
}
