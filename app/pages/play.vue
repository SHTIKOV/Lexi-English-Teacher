<script setup lang="ts">
import type { Word } from '#shared/types'

const wordsPayload = await $fetch<{ learned: Word[]; all: Word[] }>('/api/words/all', {
  headers: maxAuthHeaders(),
})
const words = computed(() => (
  wordsPayload.learned.length >= 2 ? wordsPayload.learned : wordsPayload.all
))
const allWords = computed(() => wordsPayload.all)

function goHome() {
  navigateTo('/')
}
</script>

<template>
  <QuizPanel
    :words="words"
    :all-words="allWords"
    title="🎮 Играем!"
    :question-count="15"
    @back="goHome"
  />
</template>
