# Lexi — English Teacher

Детское веб-приложение для изучения английских слов.

## Как управлять словами

Редактируйте JSON-файлы в `public/data/`:

- `words-to-learn.json` — блоки слов для изучения (один блок = одно занятие)
- `words-learned.json` — уже выученные слова (по блокам с названиями)
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

Формат `words-learned.json` — блоки с названиями (для «Моей библиотеки»):
```json
[
  {
    "title": "Приветствия",
    "words": [
      { "en": "yes", "transcription": "йес", "ru": "да" }
    ]
  }
]
```

Когда ребенок выучил блок — перенесите первый блок из `words-to-learn.json` в `words-learned.json` как объект с `title` и `words`, и удалите этот блок из списка обучения.

## Разработка

```bash
npm install
npm run dev
```

## Деплой

Push в `main` — GitHub Actions автоматически соберет и задеплоит на GitHub Pages.
