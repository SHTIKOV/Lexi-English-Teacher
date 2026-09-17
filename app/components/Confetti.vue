<script setup lang="ts">
const COLORS = ['#FFB6C1', '#87CEEB', '#FFE66D', '#77DD77', '#B19CD9', '#FFB347']

interface Particle {
  id: number
  x: number
  color: string
  delay: number
  size: number
}

const particles = Array.from({ length: 40 }, (_, i): Particle => ({
  id: i,
  x: Math.random() * 100,
  color: COLORS[Math.floor(Math.random() * COLORS.length)]!,
  delay: Math.random() * 2,
  size: 6 + Math.random() * 8,
}))

const visible = ref(true)

onMounted(() => {
  setTimeout(() => {
    visible.value = false
  }, 3000)
})
</script>

<template>
  <div v-if="visible" class="fixed inset-0 pointer-events-none z-50 overflow-hidden">
    <div
      v-for="p in particles"
      :key="p.id"
      class="absolute rounded-sm"
      :style="{
        left: `${p.x}%`,
        top: '-20px',
        width: `${p.size}px`,
        height: `${p.size}px`,
        backgroundColor: p.color,
        animation: `confetti-fall ${2 + Math.random()}s linear ${p.delay}s forwards`,
      }"
    />
  </div>
</template>
