# Lexi — English Teacher

Детское веб-приложение для изучения английских слов.

## Как управлять словами

Редактируйте JSON-файлы в `public/data/`:

- `words-to-learn.json` — слова для изучения
- `words-learned.json` — уже выученные слова
- `config.json` — имя ребенка и количество слов в день
- `rewards.json` — подарки за достижения

Формат слова:
```json
{ "en": "hello", "transcription": "хелоу", "ru": "привет" }
```

Когда ребенок выучил слова — перенесите их из `words-to-learn.json` в `words-learned.json`.

## Разработка

```bash
npm install
npm run dev
```

## Деплой

Push в `main` — GitHub Actions автоматически соберет и задеплоит на GitHub Pages.
