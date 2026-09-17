#!/bin/sh
set -e

if [ ! -d node_modules/nuxt ]; then
  echo "Installing dependencies..."
  npm ci
fi

echo "Waiting for Postgres..."
i=0
until node <<'NODE'
const postgres = require('postgres')
const sql = postgres(process.env.DATABASE_URL, { max: 1, connect_timeout: 2 })
sql`select 1`
  .then(() => sql.end({ timeout: 1 }))
  .then(() => process.exit(0))
  .catch(async () => {
    try { await sql.end({ timeout: 1 }) } catch {}
    process.exit(1)
  })
NODE
do
  i=$((i + 1))
  if [ "$i" -gt 60 ]; then
    echo "Postgres did not become ready in time"
    exit 1
  fi
  sleep 1
done

echo "Applying schema..."
npx drizzle-kit push --force

COUNT=$(node <<'NODE'
const postgres = require('postgres')
const sql = postgres(process.env.DATABASE_URL, { max: 1 })
sql`select count(*)::int as c from word_blocks`
  .then(async (rows) => {
    process.stdout.write(String(rows[0]?.c ?? 0))
    await sql.end({ timeout: 1 })
  })
  .catch(async (err) => {
    console.error(err)
    try { await sql.end({ timeout: 1 }) } catch {}
    process.exit(1)
  })
NODE
)

if [ "$COUNT" = "0" ]; then
  echo "Catalog empty — seeding..."
  npx tsx server/db/seed.ts
else
  echo "Catalog already has $COUNT blocks"
fi

echo "Starting Nuxt dev server..."
exec npx nuxt dev --host 0.0.0.0 --port 3000
