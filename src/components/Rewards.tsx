import { useMemo, useState } from 'react'
import type { Reward } from '../types'

interface Props {
  rewards: Reward[]
  learnedCount: number
  onBack: () => void
}

export function Rewards({ rewards, learnedCount, onBack }: Props) {
  const [activeReward, setActiveReward] = useState<Reward | null>(null)

  const superWords = useMemo(() => {
    if (!rewards.length) return 0
    return Math.max(...rewards.map(r => r.words))
  }, [rewards])

  return (
    <div className="app-screen flex flex-col max-w-lg mx-auto">
      {activeReward && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center px-6 animate-bounce-in">
          <div
            className={`rounded-3xl p-5 sm:p-6 shadow-2xl max-w-md w-full ${
              activeReward.words === superWords
                ? 'bg-gradient-to-r from-yellow-100 via-amber-200 to-yellow-100 border-2 border-amber-400 animate-pulse-glow'
                : 'bg-white border-2 border-white/40'
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex gap-4 items-center">
                <span className="text-4xl">{activeReward.words === superWords ? '👑' : ''}{activeReward.emoji}</span>
                <div>
                  <h3
                    className={`text-xl sm:text-2xl font-extrabold ${
                      activeReward.words === superWords ? 'text-amber-900' : 'text-amber-700'
                    }`}
                  >
                    {activeReward.title}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">Открывается на {activeReward.words} слов</p>
                </div>
              </div>

              <button
                onClick={() => setActiveReward(null)}
                className="text-2xl leading-none text-gray-600 bg-white/70 hover:bg-white rounded-full px-3 py-1 shadow active:scale-95 transition-transform"
                aria-label="Закрыть"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 bg-white/60 rounded-2xl p-4">
              <p className="text-gray-800 text-sm sm:text-base leading-snug">
                {activeReward.details ?? activeReward.description}
              </p>

              <div className="mt-4">
                {learnedCount >= activeReward.words ? (
                  <p className="text-emerald-700 font-extrabold">✅ Готово! Подарок твой!</p>
                ) : (
                  <p className="text-amber-700 font-extrabold">
                    До подарка осталось еще {activeReward.words - learnedCount} слов ({learnedCount}/{activeReward.words})
                  </p>
                )}
              </div>

              {activeReward.words === superWords && (
                <p className="mt-3 text-xs text-amber-900/80 font-semibold">
                  В Хогвартсе нужно говорить по-английски. Поэтому важно выучить ВСЕ 1000 слов.
                </p>
              )}
            </div>

            <div className="mt-5 flex gap-3">
              <button
                onClick={() => setActiveReward(null)}
                className="flex-1 py-3 rounded-2xl text-lg font-bold text-gray-600 bg-white/80 shadow active:scale-95 transition-transform cursor-pointer"
              >
                Поняла!
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex-shrink-0 app-screen-x pt-3 sm:pt-4 pb-1 sm:pb-2 text-center">
        <h2 className="text-xl sm:text-3xl font-extrabold text-amber-600">🎁 Мои подарки</h2>
        <p className="text-gray-500 text-sm">Учи слова и зарабатывай подарки!</p>
      </div>

      {/* Rewards list scrollable */}
      <div className="flex-1 overflow-y-auto app-screen-x min-h-0 overscroll-contain">
        <div className="flex flex-col gap-3 py-2">
          {rewards.map(r => {
            const unlocked = learnedCount >= r.words
            const progress = Math.min(100, (learnedCount / r.words) * 100)
            const isSuper = r.words === superWords

            return (
              <div
                key={r.words}
                onClick={() => setActiveReward(r)}
                className={`rounded-3xl p-4 shadow-lg transition-all cursor-pointer relative overflow-hidden ${
                  isSuper
                    ? unlocked
                      ? 'bg-gradient-to-r from-yellow-100 via-amber-200 to-yellow-100 border-2 border-amber-400 animate-pulse-glow'
                      : 'bg-gradient-to-r from-yellow-50 via-amber-100 to-yellow-50 border-2 border-amber-300'
                    : unlocked
                      ? 'bg-gradient-to-r from-yellow-100 to-amber-100 border-2 border-amber-300'
                      : 'bg-white/60 border-2 border-gray-200'
                }`}
              >
                {isSuper && (
                  <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute -left-1/3 top-0 h-full w-2/3 bg-gradient-to-r from-transparent via-yellow-200 to-transparent opacity-70 animate-coin-shimmer" />
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <span className={`text-3xl sm:text-4xl ${unlocked ? '' : 'grayscale opacity-70'}`}>
                    {isSuper ? '👑' : unlocked ? '' : '🔒'}{r.emoji}
                  </span>

                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-base sm:text-lg font-extrabold truncate ${
                        isSuper ? 'text-amber-900' : unlocked ? 'text-amber-700' : 'text-gray-400'
                      }`}
                    >
                      {r.title}
                    </p>
                    <p className={`text-sm ${unlocked ? 'text-amber-600' : 'text-gray-400'}`}>{r.description}</p>

                    {!unlocked && (
                      <div className="mt-2">
                        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-amber-300 to-yellow-400 rounded-full transition-all duration-500"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <p className="text-xs text-gray-400 mt-1">
                          {learnedCount}/{r.words} слов
                        </p>
                      </div>
                    )}
                  </div>

                  {unlocked && !isSuper && <span className="text-2xl animate-float">🎉</span>}
                  {unlocked && isSuper && <span className="text-2xl animate-float">⭐</span>}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Button pinned to bottom */}
      <div className="flex-shrink-0 app-screen-x app-screen-bottom pt-2 sm:pt-3">
        <button
          onClick={onBack}
          className="w-full py-4 rounded-2xl text-lg font-bold text-gray-600 bg-white/80 shadow active:scale-95 transition-transform cursor-pointer"
        >
          🏠 Главное меню
        </button>
      </div>
    </div>
  )
}
