import type { Word } from '../types'

interface Props {
  word: Word
  index: number
  total: number
}

export function WordCard({ word, index, total }: Props) {
  return (
    <div className="word-card animate-bounce-in bg-white rounded-3xl shadow-xl p-5 sm:p-8 w-full text-center">
      <p className="text-sm text-gray-400 mb-2">
        {index + 1} / {total}
      </p>
      <p className="text-4xl sm:text-5xl font-extrabold text-blue-500 mb-2 capitalize">
        {word.en}
      </p>
      <p className="text-xl sm:text-2xl text-purple-400 mb-2 font-medium">
        [ {word.transcription} ]
      </p>
      <div className="w-16 h-1 bg-gradient-to-r from-pink-300 to-blue-300 rounded mx-auto mb-2" />
      <p className="text-2xl sm:text-3xl font-bold text-gray-700">
        {word.ru}
      </p>
    </div>
  )
}
