import { useState } from 'react'
import type { Word } from '../types'
import { WordCard } from './WordCard'
import { ExitConfirm } from './ExitConfirm'
import lexiBook from '../assets/lexi-book.png'

interface Props {
  words: Word[]
  blockNumber?: number
  totalBlocks?: number
  onBack: () => void
}

export function LearnWords({ words, blockNumber, totalBlocks, onBack }: Props) {
  const [index, setIndex] = useState(0)
  const [showExit, setShowExit] = useState(false)

  if (words.length === 0) {
    return (
      <div className="app-screen flex flex-col max-w-lg mx-auto">
        <div className="flex-1 flex flex-col items-center justify-center px-4">
          <img src={lexiBook} alt="Lexi" className="w-36 h-36 object-contain drop-shadow-lg mb-4" />
          <p className="text-2xl font-bold text-purple-600 text-center">
            Все слова выучены! Ты молодец!
          </p>
        </div>
        <div className="flex-shrink-0 app-screen-x app-screen-bottom">
          <button onClick={onBack} className="w-full py-4 rounded-2xl text-lg font-bold text-gray-600 bg-white/80 shadow active:scale-95 transition-transform cursor-pointer">
            🏠 Главное меню
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="app-screen flex flex-col max-w-lg mx-auto">
      {showExit && <ExitConfirm onConfirm={onBack} onCancel={() => setShowExit(false)} />}

      <div className="flex-shrink-0 flex items-center gap-2 sm:gap-3 app-screen-x pt-3 sm:pt-4 pb-1 sm:pb-2">
        <img src={lexiBook} alt="Lexi с книгой" className="w-14 h-14 sm:w-20 sm:h-20 object-contain drop-shadow-lg flex-shrink-0" />
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-purple-600">Учим слова!</h2>
          <p className="text-sm text-gray-500">
            {blockNumber && totalBlocks
              ? `Блок ${blockNumber} из ${totalBlocks} · ${words.length} слов`
              : `${words.length} слов · запоминай и повторяй вслух`}
          </p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center app-screen-x min-h-0 overflow-y-auto overscroll-contain">
        <WordCard word={words[index]} index={index} total={words.length} />
      </div>

      <div className="flex-shrink-0 app-screen-x app-screen-bottom pt-2 sm:pt-3 flex flex-col gap-2 sm:gap-3">
        <div className="flex gap-3">
          <button
            onClick={() => setIndex(i => Math.max(0, i - 1))}
            disabled={index === 0}
            className="flex-1 py-4 rounded-2xl text-lg font-bold text-white bg-gradient-to-r from-blue-400 to-blue-500 shadow-lg active:scale-95 transition-transform disabled:opacity-40 cursor-pointer disabled:cursor-default"
          >
            ← Назад
          </button>
          <button
            onClick={() => setIndex(i => Math.min(words.length - 1, i + 1))}
            disabled={index === words.length - 1}
            className="flex-1 py-4 rounded-2xl text-lg font-bold text-white bg-gradient-to-r from-blue-400 to-blue-500 shadow-lg active:scale-95 transition-transform disabled:opacity-40 cursor-pointer disabled:cursor-default"
          >
            Далее →
          </button>
        </div>
        <button onClick={() => setShowExit(true)} className="w-full py-3 rounded-2xl text-lg font-bold text-gray-600 bg-white/80 shadow active:scale-95 transition-transform cursor-pointer">
          🏠 Главное меню
        </button>
      </div>
    </div>
  )
}
