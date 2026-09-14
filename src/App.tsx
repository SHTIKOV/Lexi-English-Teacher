import { useState } from 'react'
import type { Screen } from './types'
import { useWords } from './hooks/useWords'
import { useProgress } from './hooks/useProgress'
import { HomeScreen } from './components/HomeScreen'
import { Lesson } from './components/Lesson'
import { Quiz } from './components/Quiz'
import { Library } from './components/Library'
import { Rewards } from './components/Rewards'

export default function App() {
  const [screen, setScreen] = useState<Screen>('home')
  const { currentWords, wordBlocks, learnedBlocks, wordsLearned, allWords, totalLearned, config, rewards, loading } = useWords()
  const { stage, complete, reset } = useProgress(currentWords)

  if (loading) {
    return (
      <div className="app-screen flex items-center justify-center">
        <p className="text-3xl animate-float">🌟</p>
      </div>
    )
  }

  return (
    <div className="app-screen overflow-hidden">
      {screen === 'home' && (
        <HomeScreen
          config={config}
          learnedCount={totalLearned}
          rewards={rewards}
          stage={stage}
          onNavigate={setScreen}
        />
      )}
      {screen === 'learn' && (
        <Lesson
          words={currentWords}
          learnedBlocks={learnedBlocks}
          allWords={allWords}
          blockNumber={wordBlocks.length > 0 ? 1 : undefined}
          totalBlocks={wordBlocks.length > 0 ? wordBlocks.length : undefined}
          stage={stage}
          onComplete={complete}
          onRestart={reset}
          onBack={() => setScreen('home')}
        />
      )}
      {screen === 'quiz' && (
        <Quiz
          words={currentWords}
          allWords={allWords}
          title="✅ Проверка знаний"
          onBack={() => setScreen('home')}
        />
      )}
      {screen === 'play' && (
        <Quiz
          words={wordsLearned}
          allWords={wordsLearned}
          title="🎮 Играем!"
          questionCount={15}
          onBack={() => setScreen('home')}
        />
      )}
      {screen === 'library' && (
        <Library
          learnedBlocks={learnedBlocks}
          upcomingBlocks={wordBlocks}
          onBack={() => setScreen('home')}
        />
      )}
      {screen === 'rewards' && (
        <Rewards
          rewards={rewards}
          learnedCount={totalLearned}
          onBack={() => setScreen('home')}
        />
      )}
    </div>
  )
}
