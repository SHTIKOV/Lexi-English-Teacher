import type { Reward } from '#shared/types'
import { maxAuthHeaders } from '~/utils/maxHeaders'

export function useRewards() {
  const rewards = useState<Reward[]>('user-rewards', () => [])
  const pending = useState('user-rewards-pending', () => false)
  const loaded = useState('user-rewards-loaded', () => false)

  async function refresh() {
    pending.value = true
    try {
      const res = await $fetch<{ rewards: Reward[] }>('/api/rewards', {
        headers: maxAuthHeaders(),
      })
      rewards.value = res.rewards
      loaded.value = true
    }
    finally {
      pending.value = false
    }
    return rewards.value
  }

  async function create(payload: Omit<Reward, 'id'>) {
    const res = await $fetch<{ reward: Reward }>('/api/rewards', {
      method: 'POST',
      body: payload,
      headers: maxAuthHeaders(),
    })
    await refresh()
    return res.reward
  }

  async function update(id: number, payload: Omit<Reward, 'id'>) {
    const res = await $fetch<{ reward: Reward }>(`/api/rewards/${id}`, {
      method: 'PATCH',
      body: payload,
      headers: maxAuthHeaders(),
    })
    await refresh()
    return res.reward
  }

  async function remove(id: number) {
    await $fetch(`/api/rewards/${id}`, {
      method: 'DELETE',
      headers: maxAuthHeaders(),
    })
    await refresh()
  }

  async function loadDefaults(replace = true) {
    const res = await $fetch<{ rewards: Reward[]; loaded: boolean }>('/api/rewards/load-defaults', {
      method: 'POST',
      body: { replace },
      headers: maxAuthHeaders(),
    })
    rewards.value = res.rewards
    loaded.value = true
    return res
  }

  return {
    rewards,
    pending,
    loaded,
    refresh,
    create,
    update,
    remove,
    loadDefaults,
  }
}
