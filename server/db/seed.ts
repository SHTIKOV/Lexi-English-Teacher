import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import 'dotenv/config'
import { wordBlocks } from './schema'
import type { Word } from '#shared/types'

interface LearnedBlockJson {
  title: string
  words: Word[]
}

async function main() {
  const url = process.env.DATABASE_URL
  if (!url) {
    throw new Error('DATABASE_URL is required')
  }

  const client = postgres(url, { max: 1 })
  const db = drizzle(client)

  const root = resolve(process.cwd())
  const learnedPath = resolve(root, 'public/data/words-learned.json')
  const toLearnPath = resolve(root, 'public/data/words-to-learn.json')

  const learned = JSON.parse(readFileSync(learnedPath, 'utf-8')) as LearnedBlockJson[]
  const toLearn = JSON.parse(readFileSync(toLearnPath, 'utf-8')) as Word[][]

  const rows: { sortOrder: number; title: string | null; words: Word[] }[] = []
  let order = 1

  for (const block of learned) {
    rows.push({
      sortOrder: order++,
      title: block.title || `Блок ${order - 1}`,
      words: block.words,
    })
  }

  for (const words of toLearn) {
    rows.push({
      sortOrder: order++,
      title: `Блок ${order - 1}`,
      words,
    })
  }

  await db.delete(wordBlocks)
  await db.insert(wordBlocks).values(rows)

  console.log(`Seeded ${rows.length} word blocks (${rows.reduce((s, r) => s + r.words.length, 0)} words)`)
  await client.end()
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
