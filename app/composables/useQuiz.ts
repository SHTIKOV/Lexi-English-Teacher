import type { Word } from '#shared/types'

export interface QuizQuestion {
  word: Word
  options: Word[]
  correctIndex: number
  reverse: boolean
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function useQuiz(words: Ref<Word[]> | Word[], allWords: Ref<Word[]> | Word[], questionCount?: number) {
  const wordsRef = isRef(words) ? words : ref(words)
  const allWordsRef = isRef(allWords) ? allWords : ref(allWords)

  const questions = computed(() => {
    const list = wordsRef.value
    const poolAll = allWordsRef.value
    if (list.length === 0) return [] as QuizQuestion[]
    const pool = shuffle(list).slice(0, questionCount ?? list.length)
    return shuffle(pool.map<QuizQuestion>((word, i) => {
      const others = shuffle(poolAll.filter((w) => w.en !== word.en)).slice(0, 3)
      const options = shuffle([word, ...others])
      return {
        word,
        options,
        correctIndex: options.findIndex((o) => o.en === word.en),
        reverse: i % 2 === 1,
      }
    }))
  })

  const currentIndex = ref(0)
  const score = ref(0)
  const answered = ref<number | null>(null)
  const finished = ref(false)
  const roundKey = ref(0)

  const current = computed(() => questions.value[currentIndex.value] ?? null)
  const total = computed(() => questions.value.length)

  function answer(optionIndex: number) {
    if (answered.value !== null || !current.value) return
    answered.value = optionIndex
    if (optionIndex === current.value.correctIndex) {
      score.value += 1
    }
  }

  function next() {
    if (currentIndex.value + 1 >= total.value) {
      finished.value = true
    }
    else {
      currentIndex.value += 1
      answered.value = null
    }
  }

  function reset() {
    currentIndex.value = 0
    score.value = 0
    answered.value = null
    finished.value = false
    roundKey.value += 1
  }

  watch([wordsRef, allWordsRef], () => reset())

  return {
    questions,
    current,
    currentIndex,
    total,
    score,
    answered,
    finished,
    roundKey,
    answer,
    next,
    reset,
  }
}
