<script setup lang="ts">
import type { RankedUser } from '#shared/leaderboard'

const headers = maxAuthHeaders()

const board = await $fetch<{
  entries: RankedUser[]
  showGapAfterTop: boolean
  meUserId: number
  meRank: number
  totalUsers: number
}>('/api/leaderboard', { headers })

function goHome() {
  navigateTo('/')
}
</script>

<template>
  <RatingPanel
    :entries="board.entries"
    :show-gap-after-top="board.showGapAfterTop"
    :me-user-id="board.meUserId"
    :me-rank="board.meRank"
    :total-users="board.totalUsers"
    @back="goHome"
  />
</template>
