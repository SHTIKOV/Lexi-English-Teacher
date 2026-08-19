# Lexi — English Teacher

Детское веб-приложение для изучения английских слов.

## Как управлять словами

Редактируйте JSON-файлы в `public/data/`:

- `words-to-learn.json` — блоки слов для изучения (один блок = одно занятие)
- `words-learned.json` — уже выученные слова
- `config.json` — имя ребенка
- `rewards.json` — подарки за достижения

Формат слова:
```json
{ "en": "hello", "transcription": "хелоу", "ru": "привет" }
```

Формат блока в `words-to-learn.json` — массив массивов (5–10 слов по смыслу):
```json
[
  [
    { "en": "yes", "transcription": "йес", "ru": "да" },
    { "en": "no", "transcription": "ноу", "ru": "нет" }
  ],
  [
    { "en": "mom", "transcription": "мам", "ru": "мама" }
  ]
]
```

Когда ребенок выучил блок — перенесите все слова первого блока из `words-to-learn.json` в `words-learned.json` и удалите этот блок.

## Разработка

```bash
npm install
npm run dev
```

## Деплой

Push в `main` — GitHub Actions автоматически соберет и задеплоит на GitHub Pages.
