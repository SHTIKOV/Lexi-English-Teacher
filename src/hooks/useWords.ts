import { useState, useEffect } from 'react'
import type { Word, AppConfig, Reward } from '../types'

const BASE = import.meta.env.BASE_URL

export function useWords() {
  const [wordsToLearn, setWordsToLearn] = useState<Word[]>([])
  const [wordsLearned, setWordsLearned] = useState<Word[]>([])
  const [config, setConfig] = useState<AppConfig>({ childName: '', wordsPerDay: 5 })
  const [rewards, setRewards] = useState<Reward[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch(`${BASE}data/words-to-learn.json`).then(r => r.json()),
      fetch(`${BASE}data/words-learned.json`).then(r => r.json()),
      fetch(`${BASE}data/config.json`).then(r => r.json()),
      fetch(`${BASE}data/rewards.json`).then(r => r.json()),
    ]).then(([toLearn, learned, cfg, rw]) => {
      setWordsToLearn(toLearn)
      setWordsLearned(learned)
      setConfig(cfg)
      setRewards(rw)
      setLoading(false)
    })
  }, [])

  const currentWords = wordsToLearn.slice(0, config.wordsPerDay)
  const allWords = [...wordsLearned, ...wordsToLearn]
  const totalLearned = wordsLearned.length

  return {
    wordsToLearn,
    wordsLearned,
    currentWords,
    allWords,
    totalLearned,
    config,
    rewards,
    loading,
  }
}
