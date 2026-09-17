import {
  pgTable,
  serial,
  text,
  integer,
  boolean,
  timestamp,
  jsonb,
  uniqueIndex,
} from 'drizzle-orm/pg-core'
import type { Word } from '#shared/types'

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  maxId: text('max_id').notNull().unique(),
  displayName: text('display_name').notNull(),
  avatarUrl: text('avatar_url'),
  childName: text('child_name').notNull().default('Малышка'),
  lastReminderAt: timestamp('last_reminder_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export const wordBlocks = pgTable('word_blocks', {
  id: serial('id').primaryKey(),
  sortOrder: integer('sort_order').notNull(),
  title: text('title'),
  words: jsonb('words').$type<Word[]>().notNull(),
})

export const userBlockProgress = pgTable(
  'user_block_progress',
  {
    id: serial('id').primaryKey(),
    userId: integer('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    blockId: integer('block_id')
      .notNull()
      .references(() => wordBlocks.id, { onDelete: 'cascade' }),
    learned: boolean('learned').notNull().default(false),
    quizPassed: boolean('quiz_passed').notNull().default(false),
    playPassed: boolean('play_passed').notNull().default(false),
    completedAt: timestamp('completed_at', { withTimezone: true }),
  },
  (table) => [
    uniqueIndex('user_block_progress_user_block_uidx').on(table.userId, table.blockId),
  ],
)

export type User = typeof users.$inferSelect
export type WordBlockRow = typeof wordBlocks.$inferSelect
export type UserBlockProgress = typeof userBlockProgress.$inferSelect
