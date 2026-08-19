import { useEffect, useState } from 'react'
import type { Word } from '../types'
import { useQuiz } from '../hooks/useQuiz'
import { Confetti } from './Confetti'
import { ExitConfirm } from './ExitConfirm'
import lexiHappy from '../assets/lexi-happy.png'

interface Props {
  words: Word[]
  allWords: Word[]
  title: string
  questionCount?: number
  onBack: () => void
}

export function Quiz({ words, allWords, title, questionCount, onBack }: Props) {
  const [showExit, setShowExit] = useState(false)
  const { current, currentIndex, total, score, answered, finished, answer, next, reset } =
    useQuiz(words, allWords, questionCount)

  useEffect(() => {
    reset()
  }, [words, reset])

  if (words.length < 2) {
    return (
      <div className="flex flex-col h-dvh max-w-lg mx-auto">
        <div className="flex-1 flex flex-col items-center justify-center px-4">
          <p className="text-5xl mb-4">😅</p>
          <p className="text-xl font-bold text-purple-600 text-center">
            Нужно хотя бы 2 слова для проверки!
          </p>
        </div>
        <div className="flex-shrink-0 px-4 pb-5">
          <button onClick={onBack} className="w-full py-4 rounded-2xl text-lg font-bold text-white bg-gradient-to-r from-pink-400 to-purple-500 shadow-lg active:scale-95 transition-transform cursor-pointer">
            🏠 Главное меню
          </button>
        </div>
      </div>
    )
  }

  if (finished) {
    const percent = Math.round((score / total) * 100)
    const great = percent >= 80
    return (
      <div className="flex flex-col h-dvh max-w-lg mx-auto">
        <div className="flex-1 flex flex-col items-center justify-center px-4">
          {great && <Confetti />}
          {great ? (
            <img src={lexiHappy} alt="Lexi радуется" className="w-40 h-40 sm:w-48 sm:h-48 object-contain drop-shadow-lg mb-4" />
          ) : (
            <p className="text-6xl mb-4">💪</p>
          )}
          <h2 className="text-2xl sm:text-3xl font-extrabold text-purple-600 mb-2">
            {great ? 'Отлично!' : 'Хорошая попытка!'}
          </h2>
          <div className="bg-white/70 rounded-3xl p-6 shadow-lg text-center w-full">
            <p className="text-5xl font-extrabold text-green-500 mb-1">
              {score}/{total}
            </p>
            <p className="text-lg text-gray-600">
              {great ? 'Ты настоящая звезда! ⭐' : 'Попробуй ещё разок! 🌈'}
            </p>
          </div>
        </div>
        <div className="flex-shrink-0 px-4 pb-5 pt-3 flex flex-col gap-3">
          <button onClick={reset} className="w-full py-4 rounded-2xl text-lg font-bold text-white bg-gradient-to-r from-green-400 to-emerald-500 shadow-lg active:scale-95 transition-transform cursor-pointer">
            🔄 Ещё раз
          </button>
          <button onClick={onBack} className="w-full py-3 rounded-2xl text-lg font-bold text-gray-600 bg-white/80 shadow active:scale-95 transition-transform cursor-pointer">
            🏠 Главное меню
          </button>
        </div>
      </div>
    )
  }

  if (!current) return null
  
  const exitButton = (
    <button onClick={() => setShowExit(true)} className="w-full py-3 rounded-2xl text-lg font-bold text-gray-600 bg-white/80 shadow active:scale-95 transition-transform cursor-pointer">
      🏠 Главное меню
    </button>
  )

  const isCorrect = answered === current.correctIndex
  const isWrong = answered !== null && !isCorrect

  return (
    <div className="flex flex-col h-dvh max-w-lg mx-auto">
      {showExit && <ExitConfirm onConfirm={onBack} onCancel={() => setShowExit(false)} />}
      {/* Header */}
      <div className="flex-shrink-0 flex items-center justify-between px-4 pt-4 pb-2">
        <h2 className="text-xl sm:text-2xl font-extrabold text-purple-600">{title}</h2>
        <span className="text-sm text-gray-400 bg-white/60 rounded-full px-3 py-1">
          {currentIndex + 1}/{total}
        </span>
      </div>

      {/* Question pinned to top */}
      <div className="flex-shrink-0 px-4 pt-2 pb-3">
        <div className="bg-white/70 rounded-3xl p-5 sm:p-6 shadow-lg text-center w-full">
          {current.reverse ? (
            <>
              <p className="text-sm text-gray-400 mb-1">Как будет по-русски:</p>
              <p className="text-3xl sm:text-4xl font-extrabold text-blue-500">{current.word.en}</p>
              <p className="text-lg text-purple-400 font-medium mt-1">[ {current.word.transcription} ]</p>
            </>
          ) : (
            <>
              <p className="text-sm text-gray-400 mb-1">Как будет по-английски:</p>
              <p className="text-3xl sm:text-4xl font-extrabold text-gray-700">{current.word.ru}</p>
            </>
          )}
        </div>
      </div>

      {/* Options */}
      <div className="flex-1 flex flex-col justify-center px-4 min-h-0 overflow-hidden">
        <div className="relative w-full flex-shrink-0">
          <div className="grid grid-cols-1 gap-3 w-full">
            {current.options.map((opt, i) => {
              let classes =
                'w-full py-4 px-5 rounded-2xl text-center shadow-md transition-colors cursor-pointer '
              if (answered === null) {
                classes += 'bg-white active:scale-95 text-gray-700'
              } else if (i === current.correctIndex) {
                classes += 'bg-green-400 text-white'
              } else if (i === answered) {
                classes += 'bg-red-400 text-white animate-shake'
              } else {
                classes += 'bg-white/50 text-gray-400'
              }
              return (
                <button key={i} onClick={() => answer(i)} disabled={answered !== null} className={classes}>
                  {current.reverse ? (
                    <span className="text-xl sm:text-2xl font-bold block">{opt.ru}</span>
                  ) : (
                    <>
                      <span className="text-xl sm:text-2xl font-bold block">{opt.en}</span>
                      <span className="text-sm sm:text-base font-medium opacity-70 block">[ {opt.transcription} ]</span>
                    </>
                  )}
                </button>
              )
            })}
          </div>

          {answered !== null && (
            <div className="absolute inset-0 flex items-center justify-center animate-bounce-in">
              <div className={`rounded-3xl px-8 py-6 shadow-2xl text-center ${isCorrect ? 'bg-green-500' : 'bg-red-500'}`}>
                <p className="text-3xl font-extrabold text-white mb-1">
                  {isCorrect ? '✅ Правильно!' : '❌ Неправильно'}
                </p>
                {isWrong && (
                  <p className="text-lg text-white/90">
                    Ответ: <span className="font-bold">{current.reverse ? current.word.ru : current.word.en}</span>
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Buttons pinned to bottom */}
      <div className="flex-shrink-0 px-4 pb-5 pt-3 flex flex-col gap-3">
        <button
          onClick={next}
          disabled={answered === null}
          className={`w-full py-4 rounded-2xl text-lg font-bold text-white bg-gradient-to-r from-blue-400 to-purple-500 shadow-lg active:scale-95 transition-all cursor-pointer ${answered === null ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
        >
          Далее →
        </button>
        {exitButton}
      </div>
    </div>
  )
}
