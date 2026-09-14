import { useMemo, useState } from 'react'
import type { Word, LearnedBlock, LessonStage } from '../types'
import { LearnWords } from './LearnWords'
import { Quiz } from './Quiz'
import { Confetti } from './Confetti'
import lexiHappy from '../assets/lexi-happy.png'

const QUIZ_PASS = 100
const PLAY_PASS = 90

interface Props {
  words: Word[]
  learnedBlocks: LearnedBlock[]
  allWords: Word[]
  blockNumber?: number
  totalBlocks?: number
  stage: LessonStage
  onComplete: (stage: Exclude<LessonStage, 'done'>) => void
  onRestart: () => void
  onBack: () => void
}

function pickFromBlock(words: Word[]): Word[] {
  if (words.length <= 1) return words
  const count = Math.min(words.length, 1 + Math.round(Math.random()))
  return [...words].sort(() => Math.random() - 0.5).slice(0, count)
}

const STAGE_LABEL: Record<LessonStage, string> = {
  learn: 'шаг 1: учим слова',
  quiz: 'шаг 2: проверка',
  play: 'шаг 3: игра',
  done: 'урок пройден',
}

export function Lesson({ words, learnedBlocks, allWords, blockNumber, totalBlocks, stage, onComplete, onRestart, onBack }: Props) {
  // Урок уже начат — спрашиваем, продолжить с текущего шага или пройти заново.
  const [askResume, setAskResume] = useState(stage !== 'learn')

  // Закрепление: по 1-2 слова из каждого изученного блока плюс из только что выученного.
  const playWords = useMemo(() => {
    const blocks = [...learnedBlocks.map(b => b.words), words].filter(b => b.length > 0)
    return blocks.flatMap(pickFromBlock)
  }, [learnedBlocks, words])

  if (askResume) {
    return (
      <div className="app-screen flex flex-col max-w-lg mx-auto">
        <div className="flex-1 flex flex-col items-center justify-center px-4 text-center">
          <img src={lexiHappy} alt="Lexi" className="w-32 h-32 sm:w-40 sm:h-40 object-contain drop-shadow-lg mb-4" />
          <h2 className="text-2xl sm:text-3xl font-extrabold text-purple-600 mb-2">
            Продолжить или заново?
          </h2>
          <p className="text-lg text-gray-600">
            Ты остановилась на этом: <span className="font-bold text-purple-500">{STAGE_LABEL[stage]}</span>
          </p>
        </div>
        <div className="flex-shrink-0 app-screen-x app-screen-bottom pt-2 sm:pt-3 flex flex-col gap-2 sm:gap-3">
          <button
            onClick={() => setAskResume(false)}
            className="w-full py-4 rounded-2xl text-lg font-bold text-white bg-gradient-to-r from-green-400 to-emerald-500 shadow-lg active:scale-95 transition-transform cursor-pointer"
          >
            ▶️ Продолжить
          </button>
          <button
            onClick={() => {
              onRestart()
              setAskResume(false)
            }}
            className="w-full py-4 rounded-2xl text-lg font-bold text-white bg-gradient-to-r from-blue-400 to-purple-500 shadow-lg active:scale-95 transition-transform cursor-pointer"
          >
            🔄 Начать заново
          </button>
          <button onClick={onBack} className="w-full py-3 rounded-2xl text-lg font-bold text-gray-600 bg-white/80 shadow active:scale-95 transition-transform cursor-pointer">
            🏠 Главное меню
          </button>
        </div>
      </div>
    )
  }

  if (stage === 'learn') {
    return (
      <LearnWords
        words={words}
        blockNumber={blockNumber}
        totalBlocks={totalBlocks}
        onLearned={() => onComplete('learn')}
        onBack={onBack}
      />
    )
  }

  if (stage === 'quiz') {
    return (
      <Quiz
        words={words}
        allWords={allWords}
        title="✅ Шаг 2: проверка"
        passThreshold={QUIZ_PASS}
        onContinue={{ label: '🎮 Дальше: игра', action: () => onComplete('quiz') }}
        onBack={onBack}
      />
    )
  }

  if (stage === 'play') {
    return (
      <Quiz
        words={playWords}
        allWords={allWords}
        title="🎮 Шаг 3: закрепляем"
        passThreshold={PLAY_PASS}
        onContinue={{ label: '🎉 Урок пройден!', action: () => onComplete('play') }}
        onBack={onBack}
      />
    )
  }

  return (
    <div className="app-screen flex flex-col max-w-lg mx-auto">
      <div className="flex-1 flex flex-col items-center justify-center px-4 text-center">
        <Confetti />
        <img src={lexiHappy} alt="Lexi радуется" className="w-40 h-40 sm:w-48 sm:h-48 object-contain drop-shadow-lg mb-4" />
        <h2 className="text-2xl sm:text-3xl font-extrabold text-purple-600 mb-2">Урок пройден! 🎉</h2>
        <p className="text-lg text-gray-600">
          Ты выучила все слова блока, прошла проверку и игру.
        </p>
        <p className="text-base text-gray-500 mt-2">
          Скоро эти слова появятся в библиотеке, а Лекси приготовит новый блок!
        </p>
      </div>
      <div className="flex-shrink-0 app-screen-x app-screen-bottom pt-2 sm:pt-3">
        <button onClick={onBack} className="w-full py-4 rounded-2xl text-lg font-bold text-white bg-gradient-to-r from-pink-400 to-purple-500 shadow-lg active:scale-95 transition-transform cursor-pointer">
          🏠 Главное меню
        </button>
      </div>
    </div>
  )
}
