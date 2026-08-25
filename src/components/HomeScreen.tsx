import { useMemo } from 'react'
import type { Screen, AppConfig, Reward } from '../types'
import { motivations } from '../data/levels'
import lexiHello from '../assets/lexi-hello.png'

interface Props {
  config: AppConfig
  learnedCount: number
  rewards: Reward[]
  onNavigate: (screen: Screen) => void
}

export function HomeScreen({ config, learnedCount, rewards, onNavigate }: Props) {
  const motivation = useMemo(
    () => motivations[Math.floor(Math.random() * motivations.length)],
    []
  )
  const nextReward = rewards.find(r => learnedCount < r.words)
  const progressPct = nextReward
    ? Math.min(100, (learnedCount / nextReward.words) * 100)
    : 100

  return (
    <div className="home-screen app-screen flex flex-col max-w-lg mx-auto relative">
      <div className="home-glow pointer-events-none absolute inset-0" aria-hidden />

      {/* Character + speech bubbles near Lexi */}
      <div className="flex-1 min-h-0 relative z-10 app-screen-x overflow-hidden">
        <div className="absolute top-[6%] left-0 right-0 z-10 flex flex-col gap-2 sm:gap-2.5 pointer-events-none">
          <div className="home-greeting self-start max-w-[78%] animate-bounce-in pointer-events-auto">
            <div className="home-bubble w-fit rounded-[1.25rem] px-3.5 py-2.5 relative">
              <p className="text-[0.95rem] sm:text-lg text-[#6b4f8a] font-extrabold leading-snug tracking-tight">
                Привет, {config.childName}!
              </p>
              <p className="text-xs sm:text-sm text-[#9a7ab0] font-semibold mt-0.5">
                Меня зовут Лекси
              </p>
              <div className="absolute -bottom-1.5 right-6 w-3 h-3 bg-white/90 border-b border-r border-pink-100/80 rotate-45" />
            </div>
          </div>

          <div
            className="home-motivation self-end max-w-[72%] animate-bounce-in pointer-events-auto"
            style={{ animationDelay: '0.25s' }}
          >
            <div className="home-bubble home-bubble-motivation w-fit ml-auto rounded-[1.25rem] px-3.5 py-2.5 relative">
              <p className="text-xs sm:text-sm font-bold text-[#c45d8a] leading-snug">
                {motivation}
              </p>
              <div className="absolute -bottom-1.5 left-6 w-3 h-3 bg-white/90 border-b border-l border-violet-100/80 rotate-45" />
            </div>
          </div>
        </div>

        <div className="absolute inset-x-0 bottom-0 top-[28%] flex items-end justify-center -mb-3">
          <img
            src={lexiHello}
            alt="Фея Lexi"
            className="home-lexi w-auto max-w-[92%] h-full object-contain object-bottom drop-shadow-xl animate-float"
          />
        </div>
      </div>

      {/* Bottom: progress + actions */}
      <div className="flex-shrink-0 app-screen-x app-screen-bottom relative z-20 flex flex-col gap-2.5 sm:gap-3 pt-1">
        <div className="home-stats rounded-2xl px-3.5 py-2.5 sm:px-4 sm:py-3">
          <div className="flex items-center justify-between gap-3 mb-2">
            <div className="min-w-0">
              <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wide text-[#9a7ab0]">
                Прогресс
              </p>
              <p className="text-sm sm:text-base font-extrabold text-[#5c4a6e] truncate">
                {nextReward ? (
                  <>
                    <span className="text-[#7c5cbf]">{learnedCount}</span>
                    <span className="text-[#b0a0c0] font-bold"> / {nextReward.words}</span>
                    <span className="text-[#9a7ab0] font-semibold"> · {nextReward.emoji} {nextReward.title}</span>
                  </>
                ) : (
                  <>Выучено {learnedCount} слов · все подарки открыты</>
                )}
              </p>
            </div>
            <div className="flex-shrink-0 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-[#ffd6e7] to-[#e8d5ff] flex items-center justify-center shadow-inner">
              <span className="text-sm sm:text-base font-black text-[#7c5cbf]">{learnedCount}</span>
            </div>
          </div>
          <div className="w-full h-2 rounded-full bg-[#f0e8f5] overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#f7a8c8] to-[#b794f6] transition-all duration-700 ease-out"
              style={{ width: `${Math.max(progressPct, learnedCount > 0 ? 6 : 0)}%` }}
            />
          </div>
        </div>

        <div className="home-buttons flex flex-col gap-2 sm:gap-2.5">
          <button
            onClick={() => onNavigate('learn')}
            className="home-btn home-btn-primary w-full rounded-[1.15rem] text-sm sm:text-base font-extrabold text-white active:scale-[0.98] transition-transform cursor-pointer"
          >
            Учить слова
          </button>

          <div className="grid grid-cols-2 gap-2 sm:gap-2.5">
            <button
              onClick={() => onNavigate('quiz')}
              className="home-btn home-btn-soft w-full rounded-[1.15rem] text-sm sm:text-base font-extrabold text-[#3d6b8a] active:scale-[0.98] transition-transform cursor-pointer"
            >
              Проверить
            </button>
            <button
              onClick={() => onNavigate('play')}
              className="home-btn home-btn-soft home-btn-play w-full rounded-[1.15rem] text-sm sm:text-base font-extrabold text-[#7a4d8c] active:scale-[0.98] transition-transform cursor-pointer"
            >
              Играть
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:gap-2.5">
            <button
              onClick={() => onNavigate('library')}
              className="home-btn home-btn-ghost w-full rounded-[1.15rem] text-sm sm:text-base font-extrabold text-[#6b5b7a] active:scale-[0.98] transition-transform cursor-pointer"
            >
              Библиотека
            </button>
            <button
              onClick={() => onNavigate('rewards')}
              className="home-btn home-btn-ghost home-btn-gift w-full rounded-[1.15rem] text-sm sm:text-base font-extrabold text-[#8a6a3d] active:scale-[0.98] transition-transform cursor-pointer"
            >
              Подарки
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
