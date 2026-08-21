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
}

export type WordBlock = Word[]

export interface LearnedBlock {
  title: string
  words: Word[]
}

export interface Level {
  words: number
  label: string
  emoji: string
}

export type Screen = 'home' | 'learn' | 'quiz' | 'play' | 'rewards' | 'library'
