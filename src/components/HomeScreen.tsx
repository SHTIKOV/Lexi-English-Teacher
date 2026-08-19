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
    <div className="flex flex-col h-dvh max-w-lg mx-auto">
      {/* Top: Lexi takes all available space */}
      <div className="flex-1 flex items-end justify-center px-4 min-h-0 relative overflow-hidden">

        {/* Speech bubbles */}
        <div className="absolute inset-0 z-10 pointer-events-none">
          {/* Greeting bubble (fixed text) */}
          <div className="absolute top-2 left-2 animate-bounce-in pointer-events-auto">
            <div className="bg-white rounded-2xl px-4 py-2.5 shadow-lg border-2 border-pink-200 relative">
              <p className="text-base sm:text-lg text-purple-600 font-extrabold leading-snug">
                Привет, {config.childName}!<br />Меня зовут Лекси
              </p>
              <div className="absolute -bottom-2 right-6 w-4 h-4 bg-white border-b-2 border-r-2 border-pink-200 rotate-45" />
            </div>
          </div>

          {/* Motivation bubble pinned below the head */}
          <div
            className="absolute top-[42%] right-2 translate-y-[15px] animate-bounce-in pointer-events-auto"
            style={{ animationDelay: '0.3s' }}
          >
            <div className="bg-white rounded-2xl px-4 py-2.5 shadow-lg border-2 border-purple-200 relative">
              <p className="text-sm sm:text-base text-pink-500 font-bold leading-snug">{motivation}</p>
              {/* Tail points upward to Lexi head */}
              <div className="absolute -top-2 left-6 w-4 h-4 bg-white border-t-2 border-l-2 border-purple-200 rotate-45" />
            </div>
          </div>
        </div>

        {/* Character */}
        <img
          src={lexiHello}
          alt="Фея Lexi"
          className="max-h-full w-auto object-contain drop-shadow-xl animate-float -mb-6"
        />
      </div>

      {/* Bottom pinned section */}
      <div className="flex-shrink-0 px-4 pb-5 pt-0 flex flex-col gap-3 relative z-10">
        {/* Stats widget */}
        <div className="bg-white/70 backdrop-blur rounded-2xl p-3 shadow-lg">
          {nextReward ? (
            <p className="text-center text-sm sm:text-base text-gray-600 mb-2">
              Прогресс к подарку «{nextReward.title}»:{" "}
              <span className="font-extrabold text-purple-600 text-lg sm:text-xl">{Math.max(progressWords, 0)}</span>{" "}
              из <span className="font-bold text-gray-700">{targetWords}</span> слов
            </p>
          ) : (
            <p className="text-center text-sm sm:text-base text-gray-600 mb-2">
              Выучено <span className="font-extrabold text-purple-600 text-lg sm:text-xl">{learnedCount}</span> слов
            </p>
          )}
          <ProgressBar learnedCount={learnedCount} rewards={rewards} />
          {!nextReward && (
            <p className="text-center text-sm text-emerald-700 font-semibold mt-2">🏆 Ты открыла все подарки!</p>
          )}
        </div>

        {/* Navigation buttons */}
        <button
          onClick={() => onNavigate('learn')}
          className="w-full py-5 rounded-3xl text-lg sm:text-xl font-extrabold text-white bg-gradient-to-r from-green-400 to-emerald-500 shadow-xl ring-1 ring-white/30 active:scale-95 transition-transform cursor-pointer"
        >
          📚 Учить слова
        </button>
        <button
          onClick={() => onNavigate('quiz')}
          className="w-full py-5 rounded-3xl text-lg sm:text-xl font-extrabold text-white bg-gradient-to-r from-blue-400 to-cyan-500 shadow-xl ring-1 ring-white/30 active:scale-95 transition-transform cursor-pointer"
        >
          ✅ Проверить знания
        </button>
        <button
          onClick={() => onNavigate('play')}
          className="w-full py-5 rounded-3xl text-lg sm:text-xl font-extrabold text-white bg-gradient-to-r from-purple-400 to-pink-500 shadow-xl ring-1 ring-white/30 active:scale-95 transition-transform cursor-pointer"
        >
          🎮 Играть
        </button>
        <button
          onClick={() => onNavigate('rewards')}
          className="w-full py-4 rounded-3xl text-base sm:text-lg font-extrabold text-amber-800 bg-gradient-to-r from-yellow-100 to-amber-300 shadow-xl ring-1 ring-white/30 active:scale-95 transition-transform animate-pulse-glow cursor-pointer"
        >
          🎁 Мои подарки
        </button>
      </div>
    </div>
  )
}
