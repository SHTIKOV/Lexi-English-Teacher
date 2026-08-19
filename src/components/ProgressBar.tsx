import type { Reward } from '../types'

interface Props {
  learnedCount: number
  rewards: Reward[]
}

export function ProgressBar({ learnedCount, rewards }: Props) {
  const nextReward = rewards.find(r => learnedCount < r.words)
  const prevReward = rewards
    .slice()
    .reverse()
    .find(r => learnedCount >= r.words) ?? null

  const prevWords = prevReward?.words ?? 0
  const nextWords = nextReward?.words ?? prevWords
  const targetWords = nextReward ? nextWords - prevWords : 0
  const progressWords = learnedCount - prevWords

  const progressPct = nextReward
    ? (progressWords / targetWords) * 100
    : 100

  const label = nextReward
    ? `${nextReward.emoji} ${nextReward.title}`
    : rewards.length
      ? `🏆 Все подарки открыты!`
      : ``

  return (
    <div className="w-full">
      {label && (
        <p className="text-center text-base sm:text-lg font-bold text-purple-600 mb-1">
          {label}
        </p>
      )}

      <div className="w-full bg-white/60 rounded-full h-5 sm:h-6 overflow-hidden shadow-inner">
        <div
          className="h-full bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 rounded-full transition-all duration-1000 ease-out flex items-center justify-end pr-2"
          style={{ width: `${Math.max(progressPct, 8)}%` }}
        >
          <span className="text-[10px] sm:text-xs text-white font-bold drop-shadow">
            {nextReward ? `${Math.max(progressWords, 0)}` : learnedCount}
          </span>
        </div>
      </div>
    </div>
  )
}
