import { useEffect, useState } from 'react'

const COLORS = ['#FFB6C1', '#87CEEB', '#FFE66D', '#77DD77', '#B19CD9', '#FFB347']

interface Particle {
  id: number
  x: number
  color: string
  delay: number
  size: number
}

export function Confetti() {
  const [particles] = useState<Particle[]>(() =>
    Array.from({ length: 40 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      delay: Math.random() * 2,
      size: 6 + Math.random() * 8,
    }))
  )
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const t = setTimeout(() => setVisible(false), 3000)
    return () => clearTimeout(t)
  }, [])

  if (!visible) return null

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {particles.map(p => (
        <div
          key={p.id}
          className="absolute rounded-sm"
          style={{
            left: `${p.x}%`,
            top: -20,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            animation: `confetti-fall ${2 + Math.random()}s linear ${p.delay}s forwards`,
          }}
        />
      ))}
    </div>
  )
}
