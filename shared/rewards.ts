import type { Reward } from './types'
import rewardsJson from './rewards.json'

/** Built-in gift templates (not stored in DB until user loads them). */
export const defaultRewards = rewardsJson as Reward[]

/** @deprecated Prefer defaultRewards or user-specific /api/rewards */
export const rewards = defaultRewards
