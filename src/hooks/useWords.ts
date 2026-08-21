import { useState, useEffect } from 'react'
import type { Word, WordBlock, LearnedBlock, AppConfig, Reward } from '../types'

const BASE = import.meta.env.BASE_URL

function normalizeLearned(data: unknown): LearnedBlock[] {
  if (!Array.isArray(data) || data.length === 0) return []

  const first = data[0]
  if (first && typeof first === 'object' && 'en' in first) {
    return [{ title: 'Выученные слова', words: data as Word[] }]
  }
  if (Array.isArray(first)) {
    return (data as Word[][]).map((words, i) => ({
      title: `Блок ${i + 1}`,
      words,
    }))
  }
  return (data as LearnedBlock[]).map((block, i) => ({
    title: block.title || `Блок ${i + 1}`,
    words: block.words ?? [],
  }))
}

export function useWords() {
  const [wordBlocks, setWordBlocks] = useState<WordBlock[]>([])
  const [learnedBlocks, setLearnedBlocks] = useState<LearnedBlock[]>([])
  const [config, setConfig] = useState<AppConfig>({ childName: '' })
  const [rewards, setRewards] = useState<Reward[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch(`${BASE}data/words-to-learn.json`).then(r => r.json()),
      fetch(`${BASE}data/words-learned.json`).then(r => r.json()),
      fetch(`${BASE}data/config.json`).then(r => r.json()),
      fetch(`${BASE}data/rewards.json`).then(r => r.json()),
    ]).then(([blocks, learned, cfg, rw]) => {
      setWordBlocks(blocks)
      setLearnedBlocks(normalizeLearned(learned))
      setConfig(cfg)
      setRewards(rw)
      setLoading(false)
    })
  }, [])

  const currentBlock = wordBlocks[0] ?? []
  const currentWords = currentBlock
  const wordsToLearn = wordBlocks.flat()
  const wordsLearned = learnedBlocks.flatMap(b => b.words)
  const allWords = [...wordsLearned, ...wordsToLearn]
  const totalLearned = wordsLearned.length

  return {
    wordBlocks,
    learnedBlocks,
    wordsToLearn,
    wordsLearned,
    currentBlock,
    currentWords,
    allWords,
    totalLearned,
    config,
    rewards,
    loading,
  }
}
