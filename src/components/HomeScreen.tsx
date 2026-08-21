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

  return (
    <div className="home-screen app-screen flex flex-col max-w-lg mx-auto">
      {/* Greeting — fixed at top */}
      <div className="flex-shrink-0 app-screen-x pt-2 pb-1">
        <div className="home-bubble bg-white rounded-2xl px-3 py-2 shadow-lg border-2 border-pink-200 relative max-w-[90%] animate-bounce-in">
          <p className="text-sm sm:text-lg text-purple-600 font-extrabold leading-snug">
            Привет, {config.childName}!<br />Меня зовут Лекси
          </p>
          <div className="absolute -bottom-2 left-8 w-3.5 h-3.5 bg-white border-b-2 border-r-2 border-pink-200 rotate-45" />
        </div>
      </div>

      {/* Hero — motivation bubble sits right above the character */}
      <div className="flex-1 min-h-0 flex flex-col items-center justify-end app-screen-x">
        <div
          className="flex-shrink-0 self-end max-w-[78%] mb-1 animate-bounce-in"
          style={{ animationDelay: '0.3s' }}
        >
          <div className="home-bubble bg-white rounded-2xl px-3 py-2 shadow-lg border-2 border-purple-200 relative">
            <p className="text-xs sm:text-base text-pink-500 font-bold leading-snug">{motivation}</p>
            <div className="absolute -bottom-2 right-8 w-3.5 h-3.5 bg-white border-b-2 border-r-2 border-purple-200 rotate-45" />
          </div>
        </div>

        <img
          src={lexiHello}
          alt="Фея Lexi"
          className="home-lexi w-auto max-w-full object-contain object-bottom drop-shadow-xl animate-float flex-shrink min-h-0"
        />
      </div>

      {/* Bottom panel — stats + buttons */}
      <div className="flex-shrink-0 app-screen-x app-screen-bottom flex flex-col gap-1.5 sm:gap-3">
        <div className="home-stats bg-white/70 backdrop-blur rounded-2xl p-2 sm:p-3 shadow-lg">
          {nextReward ? (
            <p className="text-center text-xs sm:text-base text-gray-600 mb-1 sm:mb-2 line-clamp-2">
              Выучено{' '}
              <span className="font-extrabold text-purple-600 text-sm sm:text-xl">{learnedCount}</span>
              {' '}из{' '}
              <span className="font-bold text-gray-700">{nextReward.words}</span>
              {' '}слов до подарка «{nextReward.title}»
            </p>
          ) : (
            <p className="text-center text-xs sm:text-base text-gray-600 mb-1 sm:mb-2">
              Выучено <span className="font-extrabold text-purple-600 text-sm sm:text-xl">{learnedCount}</span> слов
            </p>
          )}
          <ProgressBar learnedCount={learnedCount} rewards={rewards} />
          {!nextReward && (
            <p className="text-center text-xs sm:text-sm text-emerald-700 font-semibold mt-1 sm:mt-2">🏆 Ты открыла все подарки!</p>
          )}
        </div>

        <div className="home-buttons flex flex-col gap-1.5 sm:gap-3">
          <button
            onClick={() => onNavigate('learn')}
            className="w-full py-2.5 sm:py-5 rounded-2xl sm:rounded-3xl text-sm sm:text-xl font-extrabold text-white bg-gradient-to-r from-green-400 to-emerald-500 shadow-lg sm:shadow-xl ring-1 ring-white/30 active:scale-95 transition-transform cursor-pointer"
          >
            📚 Учить слова
          </button>
          <button
            onClick={() => onNavigate('quiz')}
            className="w-full py-2.5 sm:py-5 rounded-2xl sm:rounded-3xl text-sm sm:text-xl font-extrabold text-white bg-gradient-to-r from-blue-400 to-cyan-500 shadow-lg sm:shadow-xl ring-1 ring-white/30 active:scale-95 transition-transform cursor-pointer"
          >
            ✅ Проверить знания
          </button>
          <button
            onClick={() => onNavigate('play')}
            className="w-full py-2.5 sm:py-5 rounded-2xl sm:rounded-3xl text-sm sm:text-xl font-extrabold text-white bg-gradient-to-r from-purple-400 to-pink-500 shadow-lg sm:shadow-xl ring-1 ring-white/30 active:scale-95 transition-transform cursor-pointer"
          >
            🎮 Играть
          </button>
          <button
            onClick={() => onNavigate('rewards')}
            className="w-full py-2 sm:py-4 rounded-2xl sm:rounded-3xl text-sm sm:text-lg font-extrabold text-amber-800 bg-gradient-to-r from-yellow-100 to-amber-300 shadow-lg sm:shadow-xl ring-1 ring-white/30 active:scale-95 transition-transform animate-pulse-glow cursor-pointer"
          >
            🎁 Мои подарки
          </button>
        </div>
      </div>
    </div>
  )
}
