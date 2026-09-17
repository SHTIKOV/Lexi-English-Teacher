# Lexi — English Teacher

Детское веб-приложение для изучения английских слов.  
Стек: **Nuxt 4 + PostgreSQL + MAX mini-app auth**. Запуск через Docker.

## Быстрый старт (Docker)

```bash
cp .env.example .env
# Заполни NUXT_SESSION_PASSWORD и MAX_BOT_TOKEN

make up          # production: app + Postgres
# или
make dev         # hot reload
```

### Makefile

| Команда | Описание |
|---------|----------|
| `make up` | Production-стек |
| `make dev` | Dev + hot reload |
| `make down` | Остановить |
| `make logs` | Логи |
| `make seed` | Перезалить словарь |
| `make migrate` | Применить схему |
| `make shell` / `make db-shell` | Shell / psql |
| `make remind` | Ручная рассылка напоминаний |
| `make deploy` | Деплой на `shtikoff` (rsync + rebuild) |
| `make clean` | Удалить volumes |

## Вход только через MAX

Приложение — **мини-приложение** внутри мессенджера MAX.

1. Верифицируй профиль на [business.max.ru](https://business.max.ru) (ИП / самозанятый / юрлицо).
2. Создай бота → дождись модерации → скопируй токен.
3. В настройках бота укажи HTTPS URL Lexi и кнопку мини-приложения.
4. В `.env`:
   - `MAX_BOT_TOKEN=` токен бота
   - `NUXT_SESSION_PASSWORD=` ≥ 32 символа
   - `NUXT_PUBLIC_MAX_BOT_USERNAME=` ник бота (для подсказки на экране)
5. `make up`

Пользователи открывают: `https://max.ru/<ник>?startapp`

### Безопасность

- Браузер без MAX **не пускает** (нет валидного `initData`).
- Сервер проверяет подпись `initData` через HMAC-SHA256 и `MAX_BOT_TOKEN` ([документация](https://dev.max.ru/docs/webapps/validation)).
- Подделать чужой `user.id` без токена бота нельзя.
- `initData` старше 24 часов отклоняется.
- Сессия — httpOnly cookie (`nuxt-auth-utils`).

Для локальной отладки в браузере: `MAX_TEST_AUTH=1` — на `/login` появятся кнопки тестового входа (Тест 1 / Тест 2). В проде держи `0`.

## Слова и прогресс

Общий каталог в `word_blocks` (seed из `public/data/*.json`).  
У каждого пользователя свой `user_block_progress`: учим → проверка 100% → игра 90% → блок в «выученные».

## Деплой

Прод: `lexi.shtikoff.ru` на хосте `shtikoff` (Docker + nginx).

```bash
make deploy
# или: make deploy DEPLOY_HOST=shtikoff DEPLOY_PATH=/home/profipark/lexi.shtikoff.ru
```

Скрипт `scripts/deploy.sh`: rsync кода (без `.env`) → `docker compose up -d --build --force-recreate app` → проверка `/api/auth/features`.

Первый раз на сервере: `.env` с `MAX_BOT_TOKEN`, `NUXT_SESSION_PASSWORD`, `SESSION_COOKIE_SECURE=1`, `APP_PORT=3010`, nginx + HTTPS.

## Ежедневные напоминания в MAX

Раз в день бот пишет каждому реальному пользователю (пропускает `anon-*` / `test-*`) случайное сообщение из ~10 шаблонов с числом выученных слов и следующим подарком.

- Эндпоинт: `POST /api/cron/daily-reminders` (заголовок `Authorization: Bearer $CRON_SECRET`)
- На сервере cron (**08:00 MSK**): `/etc/cron.d/lexi-daily-reminders`
- Ручной запуск: `make remind`
- `?force=1` — повторно сегодня

## Приветствие бота (картинка + «Играть»)

При `bot_started` и командах вроде `/start` бот шлёт фото Лекси и кнопку **Играть** (`open_app`).

- Webhook: `POST /api/max/webhook`
- Подписка: `make webhook` (или автоматически в конце `make deploy`)
- Нужны env: `NUXT_PUBLIC_APP_URL`, `MAX_WEBHOOK_SECRET`, `NUXT_PUBLIC_MAX_BOT_USERNAME`
