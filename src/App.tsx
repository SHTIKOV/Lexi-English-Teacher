import { useState } from 'react'
import type { Screen } from './types'
import { useWords } from './hooks/useWords'
import { HomeScreen } from './components/HomeScreen'
import { LearnWords } from './components/LearnWords'
import { Quiz } from './components/Quiz'
import { Rewards } from './components/Rewards'

export default function App() {
  const [screen, setScreen] = useState<Screen>('home')
  const { currentWords, allWords, totalLearned, config, rewards, loading } = useWords()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-3xl animate-float">🌟</p>
      </div>
    )
  }

  return (
    <div className="min-h-dvh">
      {screen === 'home' && (
        <HomeScreen
          config={config}
          learnedCount={totalLearned}
          rewards={rewards}
          onNavigate={setScreen}
        />
      )}
      {screen === 'learn' && (
        <LearnWords words={currentWords} onBack={() => setScreen('home')} />
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
          words={allWords}
          allWords={allWords}
          title="🎮 Играем!"
          questionCount={15}
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
