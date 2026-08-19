import { useMemo } from 'react'
import type { Screen, AppConfig, Reward } from '../types'
import { ProgressBar } from './ProgressBar'
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
  const prevReward = rewards
    .slice()
    .reverse()
    .find(r => learnedCount >= r.words) ?? null
  const prevWords = prevReward?.words ?? 0
  const targetWords = nextReward ? nextReward.words - prevWords : 0
  const progressWords = nextReward ? learnedCount - prevWords : learnedCount

  return (
    <div className="app-screen flex flex-col max-w-lg mx-auto">
      <div className="home-character flex-1 flex items-end justify-center app-screen-x min-h-0 relative overflow-hidden">

        <div className="absolute inset-0 z-10 pointer-events-none">
          <div className="absolute top-1 left-1 sm:top-2 sm:left-2 animate-bounce-in pointer-events-auto max-w-[55%]">
            <div className="home-bubble bg-white rounded-2xl px-3 py-2 sm:px-4 sm:py-2.5 shadow-lg border-2 border-pink-200 relative">
              <p className="text-sm sm:text-lg text-purple-600 font-extrabold leading-snug">
                Привет, {config.childName}!<br />Меня зовут Лекси
              </p>
              <div className="absolute -bottom-2 right-6 w-4 h-4 bg-white border-b-2 border-r-2 border-pink-200 rotate-45" />
            </div>
          </div>

          <div
            className="home-motivation absolute top-[42%] right-1 sm:right-2 translate-y-[15px] animate-bounce-in pointer-events-auto max-w-[55%]"
            style={{ animationDelay: '0.3s' }}
          >
            <div className="home-bubble bg-white rounded-2xl px-3 py-2 sm:px-4 sm:py-2.5 shadow-lg border-2 border-purple-200 relative">
              <p className="text-xs sm:text-base text-pink-500 font-bold leading-snug">{motivation}</p>
              <div className="absolute -top-2 left-6 w-4 h-4 bg-white border-t-2 border-l-2 border-purple-200 rotate-45" />
            </div>
          </div>
        </div>

        <img
          src={lexiHello}
          alt="Фея Lexi"
          className="max-h-full w-auto object-contain drop-shadow-xl animate-float -mb-4 sm:-mb-6"
        />
      </div>

      <div className="flex-shrink-0 app-screen-x app-screen-bottom pt-0 flex flex-col gap-2 sm:gap-3 relative z-10">
        <div className="home-stats bg-white/70 backdrop-blur rounded-2xl p-2.5 sm:p-3 shadow-lg">
          {nextReward ? (
            <p className="text-center text-xs sm:text-base text-gray-600 mb-1.5 sm:mb-2 line-clamp-2">
              Прогресс к подарку «{nextReward.title}»:{' '}
              <span className="font-extrabold text-purple-600 text-base sm:text-xl">{Math.max(progressWords, 0)}</span>{' '}
              из <span className="font-bold text-gray-700">{targetWords}</span> слов
            </p>
          ) : (
            <p className="text-center text-xs sm:text-base text-gray-600 mb-1.5 sm:mb-2">
              Выучено <span className="font-extrabold text-purple-600 text-base sm:text-xl">{learnedCount}</span> слов
            </p>
          )}
          <ProgressBar learnedCount={learnedCount} rewards={rewards} />
          {!nextReward && (
            <p className="text-center text-xs sm:text-sm text-emerald-700 font-semibold mt-1.5 sm:mt-2">🏆 Ты открыла все подарки!</p>
          )}
        </div>

        <div className="home-buttons flex flex-col gap-2 sm:gap-3">
          <button
            onClick={() => onNavigate('learn')}
            className="btn-main w-full py-3.5 sm:py-5 rounded-3xl text-base sm:text-xl font-extrabold text-white bg-gradient-to-r from-green-400 to-emerald-500 shadow-xl ring-1 ring-white/30 active:scale-95 transition-transform cursor-pointer"
          >
            📚 Учить слова
          </button>
          <button
            onClick={() => onNavigate('quiz')}
            className="btn-main w-full py-3.5 sm:py-5 rounded-3xl text-base sm:text-xl font-extrabold text-white bg-gradient-to-r from-blue-400 to-cyan-500 shadow-xl ring-1 ring-white/30 active:scale-95 transition-transform cursor-pointer"
          >
            ✅ Проверить знания
          </button>
          <button
            onClick={() => onNavigate('play')}
            className="btn-main w-full py-3.5 sm:py-5 rounded-3xl text-base sm:text-xl font-extrabold text-white bg-gradient-to-r from-purple-400 to-pink-500 shadow-xl ring-1 ring-white/30 active:scale-95 transition-transform cursor-pointer"
          >
            🎮 Играть
          </button>
          <button
            onClick={() => onNavigate('rewards')}
            className="btn-rewards w-full py-3 sm:py-4 rounded-3xl text-sm sm:text-lg font-extrabold text-amber-800 bg-gradient-to-r from-yellow-100 to-amber-300 shadow-xl ring-1 ring-white/30 active:scale-95 transition-transform animate-pulse-glow cursor-pointer"
          >
            🎁 Мои подарки
          </button>
        </div>
      </div>
    </div>
  )
}
