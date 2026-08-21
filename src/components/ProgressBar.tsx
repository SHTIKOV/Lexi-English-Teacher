import type { Reward } from '../types'

interface Props {
  learnedCount: number
  rewards: Reward[]
}

export function ProgressBar({ learnedCount, rewards }: Props) {
  const nextReward = rewards.find(r => learnedCount < r.words)

  const progressPct = nextReward
    ? Math.min(100, (learnedCount / nextReward.words) * 100)
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
          style={{ width: `${Math.max(progressPct, learnedCount > 0 ? 8 : 0)}%` }}
        >
          <span className="text-[10px] sm:text-xs text-white font-bold drop-shadow">
            {learnedCount}
          </span>
        </div>
      </div>
    </div>
  )
}
