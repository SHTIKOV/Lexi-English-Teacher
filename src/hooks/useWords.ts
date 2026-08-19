import { useState, useEffect } from 'react'
import type { Word, WordBlock, AppConfig, Reward } from '../types'

const BASE = import.meta.env.BASE_URL

export function useWords() {
  const [wordBlocks, setWordBlocks] = useState<WordBlock[]>([])
  const [wordsLearned, setWordsLearned] = useState<Word[]>([])
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
      setWordsLearned(learned)
      setConfig(cfg)
      setRewards(rw)
      setLoading(false)
    })
  }, [])

  const currentBlock = wordBlocks[0] ?? []
  const currentWords = currentBlock
  const wordsToLearn = wordBlocks.flat()
  const allWords = [...wordsLearned, ...wordsToLearn]
  const totalLearned = wordsLearned.length

  return {
    wordBlocks,
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
