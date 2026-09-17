import { asc, eq } from 'drizzle-orm'
import { useDb } from '../db/client'
import { userBlockProgress, users, wordBlocks } from '../db/schema'
import { isBlockCompleted } from './catalog'
import { isRealMaxUserId, sendMaxMessageToUser } from './maxBot'
import { listUserRewards, nextRewardFromList } from './rewards'

type ReminderContext = {
  childName: string
  learnedCount: number
  nextGiftTitle: string | null
  nextGiftEmoji: string | null
  wordsLeft: number | null
}

const TEMPLATES: Array<(ctx: ReminderContext) => string> = [
  (c) => c.nextGiftTitle
    ? `Привет, ${c.childName}! Давай сегодня выучим новые слова? У тебя уже ${c.learnedCount} ${wordsLabel(c.learnedCount)}, до подарка «${c.nextGiftTitle}»${c.nextGiftEmoji ? ` ${c.nextGiftEmoji}` : ''} осталось совсем немного!`
    : `Привет, ${c.childName}! У тебя уже ${c.learnedCount} ${wordsLabel(c.learnedCount)} — круто! Давай сегодня выучим ещё немного?`,
  (c) => c.nextGiftTitle && c.wordsLeft != null
    ? `${c.childName}, Лекси зовёт на урок! Выучено: ${c.learnedCount}. До «${c.nextGiftTitle}» осталось ${c.wordsLeft} ${wordsLabel(c.wordsLeft)}. Загляни на минутку?`
    : `${c.childName}, Лекси зовёт на урок! Уже ${c.learnedCount} ${wordsLabel(c.learnedCount)} за плечами. Продолжим?`,
  (c) => `Эй, ${c.childName}! Новые английские слова ждут. Сейчас у тебя ${c.learnedCount} ${wordsLabel(c.learnedCount)}${c.nextGiftTitle ? `, а впереди подарок «${c.nextGiftTitle}»` : ''}. Поехали!`,
  (c) => c.nextGiftTitle
    ? `Доброе утро, ${c.childName}! Чуть-чуть практики — и подарок «${c.nextGiftTitle}» станет ближе. У тебя уже ${c.learnedCount} ${wordsLabel(c.learnedCount)}.`
    : `Доброе утро, ${c.childName}! Чуть-чуть практики сегодня? У тебя уже ${c.learnedCount} ${wordsLabel(c.learnedCount)}.`,
  (c) => `Лекси скучает, ${c.childName}! Давай выучим пару слов? Прогресс: ${c.learnedCount}${c.wordsLeft != null && c.nextGiftTitle ? ` · до «${c.nextGiftTitle}» ещё ${c.wordsLeft}` : ''}.`,
  (c) => c.nextGiftTitle
    ? `${c.childName}, сегодня отличный день для английского! У тебя ${c.learnedCount} ${wordsLabel(c.learnedCount)}, следующий подарок — «${c.nextGiftTitle}». Почти рядом!`
    : `${c.childName}, сегодня отличный день для английского! У тебя уже ${c.learnedCount} ${wordsLabel(c.learnedCount)}. Все подарки открыты — просто поддержим форму!`,
  (c) => `Привет-привет, ${c.childName}! Сделаем маленький шажок? Уже выучено ${c.learnedCount} ${wordsLabel(c.learnedCount)}${c.nextGiftTitle ? `, цель — «${c.nextGiftTitle}»` : ''}.`,
  (c) => c.wordsLeft != null && c.nextGiftTitle
    ? `${c.childName}, осталось всего ${c.wordsLeft} ${wordsLabel(c.wordsLeft)} до «${c.nextGiftTitle}»! Сейчас у тебя ${c.learnedCount}. Занимаемся?`
    : `${c.childName}, ты уже выучила ${c.learnedCount} ${wordsLabel(c.learnedCount)}! Давай добавим ещё немного сегодня?`,
  (c) => `Лекси приготовила новые слова, ${c.childName}! Твой счёт: ${c.learnedCount}${c.nextGiftTitle ? `. Дальше ждёт «${c.nextGiftTitle}»` : ''}. Заходи!`,
  (c) => `Йо-хо, ${c.childName}! Время английского приключения. Выучено ${c.learnedCount} ${wordsLabel(c.learnedCount)}${c.nextGiftTitle ? `, до «${c.nextGiftTitle}» рукой подать` : ''}. Погнали?`,
]

function wordsLabel(n: number): string {
  const abs = Math.abs(n) % 100
  const last = abs % 10
  if (abs > 10 && abs < 20) return 'слов'
  if (last === 1) return 'слово'
  if (last >= 2 && last <= 4) return 'слова'
  return 'слов'
}

export function pickReminderText(ctx: ReminderContext): string {
  const tpl = TEMPLATES[Math.floor(Math.random() * TEMPLATES.length)]!
  return tpl(ctx)
}

export function nextRewardForCount(learnedCount: number, rewardsList: { words: number; title: string; emoji: string }[]) {
  return nextRewardFromList(rewardsList, learnedCount)
}

async function learnedCountForUser(userId: number): Promise<number> {
  const db = useDb()
  const blocks = await db.select().from(wordBlocks).orderBy(asc(wordBlocks.sortOrder))
  const progressRows = await db
    .select()
    .from(userBlockProgress)
    .where(eq(userBlockProgress.userId, userId))

  const progressByBlock = new Map(progressRows.map((p) => [p.blockId, p]))
  return blocks
    .filter((b) => isBlockCompleted(progressByBlock.get(b.id)))
    .reduce((sum, b) => sum + b.words.length, 0)
}

function startOfTodayUtc(): Date {
  const d = new Date()
  d.setUTCHours(0, 0, 0, 0)
  return d
}

export type DailyReminderReport = {
  total: number
  sent: number
  skipped: number
  failed: Array<{ userId: number; maxId: string; error: string }>
}

export async function sendDailyReminders(options?: {
  force?: boolean
}): Promise<DailyReminderReport> {
  const db = useDb()
  const allUsers = await db.select().from(users)
  const realUsers = allUsers.filter((u) => isRealMaxUserId(u.maxId))
  const today = startOfTodayUtc()

  const report: DailyReminderReport = {
    total: realUsers.length,
    sent: 0,
    skipped: 0,
    failed: [],
  }

  for (const user of realUsers) {
    if (!options?.force && user.lastReminderAt && user.lastReminderAt >= today) {
      report.skipped += 1
      continue
    }

    const learnedCount = await learnedCountForUser(user.id)
    const userGiftList = await listUserRewards(user.id)
    const next = nextRewardForCount(learnedCount, userGiftList)
    const wordsLeft = next ? next.words - learnedCount : null
    const text = pickReminderText({
      childName: user.childName || 'друг',
      learnedCount,
      nextGiftTitle: next?.title ?? null,
      nextGiftEmoji: next?.emoji ?? null,
      wordsLeft,
    })

    const result = await sendMaxMessageToUser(user.maxId, text, {
      openAppText: 'Открыть Lexi',
    })

    if (!result.ok) {
      report.failed.push({
        userId: user.id,
        maxId: user.maxId,
        error: `${result.status}: ${result.error}`,
      })
      // Don't stamp lastReminderAt on failure — retry next run
      await new Promise((r) => setTimeout(r, 400))
      continue
    }

    await db
      .update(users)
      .set({ lastReminderAt: new Date() })
      .where(eq(users.id, user.id))

    report.sent += 1
    // Max limit: ~2 msg/sec per dialog; stay under global 30 rps
    await new Promise((r) => setTimeout(r, 400))
  }

  return report
}
