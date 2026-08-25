import { useState } from 'react'
import type { Screen } from './types'
import { useWords } from './hooks/useWords'
import { HomeScreen } from './components/HomeScreen'
import { LearnWords } from './components/LearnWords'
import { Quiz } from './components/Quiz'
import { Library } from './components/Library'
import { Rewards } from './components/Rewards'

export default function App() {
  const [screen, setScreen] = useState<Screen>('home')
  const { currentWords, wordBlocks, learnedBlocks, wordsLearned, allWords, totalLearned, config, rewards, loading } = useWords()

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
          onNavigate={setScreen}
        />
      )}
      {screen === 'learn' && (
        <LearnWords
          words={currentWords}
          blockNumber={wordBlocks.length > 0 ? 1 : undefined}
          totalBlocks={wordBlocks.length > 0 ? wordBlocks.length : undefined}
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
