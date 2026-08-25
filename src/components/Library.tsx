import type { LearnedBlock, Word, WordBlock } from '../types'

interface Props {
  learnedBlocks: LearnedBlock[]
  upcomingBlocks: WordBlock[]
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

function WordRow({
  word,
  index,
  learned,
}: {
  word: Word
  index: number
  learned: boolean
}) {
  return (
    <div
      className={`rounded-2xl px-3 py-2 sm:px-4 sm:py-2.5 shadow-md flex items-center gap-3 ${
        learned ? 'bg-white/80' : 'bg-white/50 border border-dashed border-gray-300'
      }`}
    >
      <span
        className={`flex-shrink-0 w-6 h-6 sm:w-7 sm:h-7 rounded-full text-[10px] sm:text-xs font-extrabold flex items-center justify-center ${
          learned ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-400'
        }`}
      >
        {learned ? '✓' : index + 1}
      </span>
      <div className="flex-1 min-w-0">
        <p
          className={`text-sm sm:text-base font-extrabold capitalize truncate ${
            learned ? 'text-blue-500' : 'text-gray-500'
          }`}
        >
          {word.en}
        </p>
        <p
          className={`text-[11px] sm:text-xs font-medium truncate ${
            learned ? 'text-purple-400' : 'text-gray-400'
          }`}
        >
          [ {word.transcription} ]
        </p>
      </div>
      <p
        className={`flex-shrink-0 text-sm sm:text-base font-bold text-right ${
          learned ? 'text-gray-700' : 'text-gray-400'
        }`}
      >
        {word.ru}
      </p>
    </div>
  )
}

function BlockSection({
  title,
  badge,
  words,
  learned,
  accent,
}: {
  title: string
  badge: string
  words: Word[]
  learned: boolean
  accent: string
}) {
  return (
    <section className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2 px-1">
        <h3 className={`text-base sm:text-lg font-extrabold ${accent}`}>{title}</h3>
        <span
          className={`text-xs sm:text-sm font-bold rounded-full px-2.5 py-0.5 ${
            learned ? 'text-emerald-700 bg-emerald-50' : 'text-amber-700 bg-amber-50'
          }`}
        >
          {badge}
        </span>
      </div>
      <div className="flex flex-col gap-1.5">
        {words.map((word, i) => (
          <WordRow key={`${title}-${word.en}-${i}`} word={word} index={i} learned={learned} />
        ))}
      </div>
    </section>
  )
}

export function Library({ learnedBlocks, upcomingBlocks, onBack }: Props) {
  const learnedCount = learnedBlocks.reduce((sum, b) => sum + b.words.length, 0)
  const upcomingCount = upcomingBlocks.reduce((sum, b) => sum + b.length, 0)
  const totalCount = learnedCount + upcomingCount

  return (
    <div className="app-screen flex flex-col max-w-lg mx-auto">
      <div className="flex-shrink-0 app-screen-x pt-3 sm:pt-4 pb-2 text-center">
        <h2 className="text-xl sm:text-3xl font-extrabold text-indigo-600">📖 Моя библиотека</h2>
        <div className="mt-2 bg-white/70 rounded-2xl p-3 shadow-md">
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <p className="text-lg sm:text-xl font-extrabold text-emerald-600">{learnedCount}</p>
              <p className="text-[10px] sm:text-xs text-gray-500 font-bold">выучено</p>
            </div>
            <div>
              <p className="text-lg sm:text-xl font-extrabold text-amber-600">{upcomingCount}</p>
              <p className="text-[10px] sm:text-xs text-gray-500 font-bold">впереди</p>
            </div>
            <div>
              <p className="text-lg sm:text-xl font-extrabold text-indigo-600">{totalCount}</p>
              <p className="text-[10px] sm:text-xs text-gray-500 font-bold">всего</p>
            </div>
          </div>
          <p className="text-center text-xs text-gray-500 mt-2">
            {learnedBlocks.length} {blocksLabel(learnedBlocks.length)} выучено ·{' '}
            {upcomingBlocks.length} {blocksLabel(upcomingBlocks.length)} впереди
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto app-screen-x min-h-0 overscroll-contain">
        <div className="flex flex-col gap-5 py-2 pb-3">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 px-1">
              <span className="text-sm font-extrabold text-emerald-700 bg-emerald-100 rounded-full px-3 py-1">
                ✅ Выученные
              </span>
              <span className="text-xs text-gray-400">
                {learnedCount} {wordsLabel(learnedCount)}
              </span>
            </div>

            {learnedBlocks.length === 0 ? (
              <p className="text-center text-sm text-gray-400 py-4">Пока нет выученных слов</p>
            ) : (
              learnedBlocks.map((block, blockIndex) => (
                <BlockSection
                  key={`learned-${block.title}-${blockIndex}`}
                  title={`${blockIndex + 1}. ${block.title}`}
                  badge={`${block.words.length} ${wordsLabel(block.words.length)}`}
                  words={block.words}
                  learned
                  accent="text-emerald-700"
                />
              ))
            )}
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 px-1">
              <span className="text-sm font-extrabold text-amber-700 bg-amber-100 rounded-full px-3 py-1">
                ⏳ Предстоит изучить
              </span>
              <span className="text-xs text-gray-400">
                {upcomingCount} {wordsLabel(upcomingCount)}
              </span>
            </div>

            {upcomingBlocks.length === 0 ? (
              <p className="text-center text-sm text-emerald-600 font-bold py-4">
                Все слова выучены! 🎉
              </p>
            ) : (
              upcomingBlocks.map((words, blockIndex) => {
                const isCurrent = blockIndex === 0
                const number = learnedBlocks.length + blockIndex + 1
                return (
                  <BlockSection
                    key={`upcoming-${blockIndex}-${words[0]?.en ?? blockIndex}`}
                    title={
                      isCurrent
                        ? `${number}. Сейчас учим`
                        : `${number}. Скоро · блок ${blockIndex + 1}`
                    }
                    badge={
                      isCurrent
                        ? `сейчас · ${words.length}`
                        : `${words.length} ${wordsLabel(words.length)}`
                    }
                    words={words}
                    learned={false}
                    accent={isCurrent ? 'text-amber-700' : 'text-gray-500'}
                  />
                )
              })
            )}
          </div>
        </div>
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
