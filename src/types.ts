export interface Word {
  en: string
  transcription: string
  ru: string
}

export interface Reward {
  words: number
  title: string
  emoji: string
  description: string
  details?: string
}

export interface AppConfig {
  childName: string
  wordsPerDay: number
}

export interface Level {
  words: number
  label: string
  emoji: string
}

export type Screen = 'home' | 'learn' | 'quiz' | 'play' | 'rewards'
