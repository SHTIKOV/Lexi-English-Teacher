import type { LearnedBlock } from '../types'

interface Props {
  blocks: LearnedBlock[]
  onBack: () => void
}

function wordsLabel(count: number): string {
  const mod10 = count % 10
  const mod100 = count % 100
  if (mod10 === 1 && mod100 !== 11) return 'слово'
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return 'слова'
  return 'слов'
}

function blocksLabel(count: number): string {
  const mod10 = count % 10
  const mod100 = count % 100
  if (mod10 === 1 && mod100 !== 11) return 'блок'
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return 'блока'
  return 'блоков'
}

export function Library({ blocks, onBack }: Props) {
  const totalWords = blocks.reduce((sum, b) => sum + b.words.length, 0)

  return (
    <div className="app-screen flex flex-col max-w-lg mx-auto">
      <div className="flex-shrink-0 app-screen-x pt-3 sm:pt-4 pb-2 text-center">
        <h2 className="text-xl sm:text-3xl font-extrabold text-indigo-600">📖 Моя библиотека</h2>
        {totalWords > 0 ? (
          <div className="mt-2 bg-white/70 rounded-2xl p-3 shadow-md text-left">
            <p className="text-sm sm:text-base text-gray-700 font-bold text-center">
              Всего выучено{' '}
              <span className="text-indigo-600 text-lg sm:text-xl font-extrabold">{totalWords}</span>{' '}
              {wordsLabel(totalWords)}
            </p>
            <p className="text-center text-xs sm:text-sm text-gray-500 mt-0.5">
              {blocks.length} {blocksLabel(blocks.length)} · в среднем{' '}
              {Math.round(totalWords / blocks.length)} слов в блоке
            </p>
          </div>
        ) : (
          <p className="text-gray-500 text-sm mt-1">Пока пусто — давай учить слова!</p>
        )}
      </div>

      <div className="flex-1 overflow-y-auto app-screen-x min-h-0 overscroll-contain">
        {totalWords === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-8">
            <p className="text-5xl mb-3">📚</p>
            <p className="text-center text-purple-600 font-bold">
              Здесь появятся слова, которые ты выучишь
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4 py-2 pb-3">
            {blocks.map((block, blockIndex) => (
              <section key={`${block.title}-${blockIndex}`} className="flex flex-col gap-2">
                <div className="flex items-center justify-between gap-2 px-1">
                  <h3 className="text-base sm:text-lg font-extrabold text-indigo-700">
                    {blockIndex + 1}. {block.title}
                  </h3>
                  <span className="text-xs sm:text-sm font-bold text-indigo-400 bg-indigo-50 rounded-full px-2.5 py-0.5">
                    {block.words.length} {wordsLabel(block.words.length)}
                  </span>
                </div>

                <div className="flex flex-col gap-1.5">
                  {block.words.map((word, i) => (
                    <div
                      key={`${block.title}-${word.en}-${i}`}
                      className="bg-white/80 rounded-2xl px-3 py-2 sm:px-4 sm:py-2.5 shadow-md flex items-center gap-3"
                    >
                      <span className="flex-shrink-0 w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-indigo-100 text-indigo-600 text-[10px] sm:text-xs font-extrabold flex items-center justify-center">
                        {i + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm sm:text-base font-extrabold text-blue-500 capitalize truncate">
                          {word.en}
                        </p>
                        <p className="text-[11px] sm:text-xs text-purple-400 font-medium truncate">
                          [ {word.transcription} ]
                        </p>
                      </div>
                      <p className="flex-shrink-0 text-sm sm:text-base font-bold text-gray-700 text-right">
                        {word.ru}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>

      <div className="flex-shrink-0 app-screen-x app-screen-bottom pt-2 sm:pt-3">
        <button
          onClick={onBack}
          className="w-full py-3 sm:py-4 rounded-2xl text-base sm:text-lg font-bold text-gray-600 bg-white/80 shadow active:scale-95 transition-transform cursor-pointer"
        >
          🏠 Главное меню
        </button>
      </div>
    </div>
  )
}
