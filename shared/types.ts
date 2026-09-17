export interface Word {
  en: string
  transcription: string
  ru: string
}

export interface RewardPhoto {
  src: string
  caption: string
  credit?: string
  license?: string
}

export interface Reward {
  id?: number
  words: number
  title: string
  emoji: string
  description: string
  details?: string
}

export interface LearnedBlock {
  id: number
  title: string
  words: Word[]
  sortOrder: number
}

export interface Level {
  words: number
  label: string
  emoji: string
}

export type LessonStage = 'learn' | 'quiz' | 'play' | 'done'

export type ProgressStage = 'learn' | 'quiz' | 'play'

export interface SessionUser {
  id: number
  maxId: string
  displayName: string
  avatarUrl: string | null
  childName: string
  onboardingCompleted: boolean
}

export interface MaxInitUser {
  id: number
  first_name?: string
  last_name?: string
  username?: string | null
  language_code?: string
  photo_url?: string | null
}
