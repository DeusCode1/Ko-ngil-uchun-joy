# Ko'ngil uchun joy

Telegram Mini App для чтения и поиска аятов Корана. Поддержка переводов (ru, uz, tr) и мультиязычного интерфейса (ru, uz, tr, ar).

## Стек

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Prisma** + **SQLite**
- **Zustand** (с persist для языка и перевода)
- **Telegram Mini App SDK**

## Требования

- Node.js 18+
- npm

## Установка и запуск

### 1. Установить зависимости

```bash
cd kongil-uchun-joy
npm install
```

### 2. База данных (Prisma)

Создать файл `.env` в корне проекта (или скопировать из `.env.example`):

```env
DATABASE_URL="file:./dev.db"
```

Сгенерировать Prisma Client и применить схему:

```bash
npm run db:generate
npm run db:push
```

### 3. Миграция с предыдущей версии (если был MVP с полем Ayah.text)

Новая схема хранит тексты в таблице **AyahText** (арабский и переводы по `languageCode`). Рекомендуется:

1. Удалить старую БД: `rm prisma/dev.db` (или переименовать для бэкапа).
2. Выполнить `npm run db:push`.
3. Заново импортировать арабский текст и нужные переводы (см. ниже).

### 4. Импорт арабского текста (основной)

Формат файла: одна строка — один аят: `sura|ayah|text`

Пример:

```
1|1|بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
1|2|الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ
2|1|الم
```

Команда:

```bash
npm run import:quran -- --file=./data/quran.txt
```

Скрипт создаёт суры, аяты и записи **AyahText** с `languageCode = "ar"`.

### 5. Импорт переводов

Формат того же файла: `sura|ayah|text`. Переводы привязываются к существующим аятам по (sura, ayah).

Поддерживаемые языки: `ar`, `ru`, `uz`, `tr`.

Примеры:

```bash
npm run import:translation -- --file=./data/ru.abuadel.txt --lang=ru
npm run import:translation -- --file=./data/uz.sodik.txt --lang=uz
npm run import:translation -- --file=./data/tr.bulac.txt --lang=tr
```

Скрипт создаёт или обновляет **AyahText** для выбранного `--lang`, пропускает пустые строки и логирует ошибки.

### 6. Запуск локально

```bash
npm run dev
```

Приложение: [http://localhost:3000](http://localhost:3000).

### 7. Тестирование без Telegram

В обычном браузере приложение работает в **fallback-режиме**:

- Нет Telegram WebApp — используется mock user id (`dev-user`).
- Язык интерфейса и перевод аятов выбираются в шапке (иконка Aa) и сохраняются в localStorage.
- Все функции (поиск по номеру и тексту, суры, избранное, последний прочитанный) доступны.

## Переменные окружения

| Переменная       | Описание                         |
|------------------|----------------------------------|
| `DATABASE_URL`   | URL БД (SQLite: `file:./dev.db`) |

## Структура проекта

```
kongil-uchun-joy/
├── app/
│   ├── api/              # API (suras, ayah, search, user)
│   ├── ayah/[sura]/[ayah]/
│   ├── favorites/
│   ├── search/
│   ├── suras/[id]/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
├── lib/                   # prisma, telegram, ayah-text, i18n
├── locales/               # ru, uz, tr, ar (UI)
├── prisma/
│   └── schema.prisma
├── scripts/
│   ├── import-quran.ts
│   └── import-translation.ts
├── store/
└── types/
```

## Маршруты

| Путь                      | Описание           |
|---------------------------|--------------------|
| `/`                       | Главная            |
| `/suras`                  | Список сур         |
| `/suras/[id]`             | Сура и аяты        |
| `/ayah/[sura]/[ayah]`     | Один аят           |
| `/search`                 | Поиск              |
| `/favorites`              | Избранное          |

## API

- `GET /api/suras` — все суры
- `GET /api/suras/:id?lang=ru` — сура и аяты (arabicText + translationText для `lang`)
- `GET /api/ayah/:sura/:ayah?lang=ru` — аят с prev/next, arabicText, translationText
- `GET /api/search?q=...&lang=ru` — поиск по номеру (2:255, 2.255, 2 255, sura 2 ayat 255) или по тексту (арабский + выбранный перевод)
- `GET /api/user/last-read?telegramUserId=...&lang=ru`
- `POST /api/user/last-read` — body: `{ telegramUserId, ayahId }`
- `GET /api/user/favorites?telegramUserId=...&lang=ru`
- `POST /api/user/favorites` — body: `{ telegramUserId, ayahId }` (toggle)

## Языки

- **Язык интерфейса (appLanguage):** ru, uz, tr, ar — меню, кнопки, подписи.
- **Язык перевода аятов (translationLanguage):** ar, ru, uz, tr — какой перевод показывать под арабским текстом. При `ar` показывается только арабский.

Оба выбора хранятся в Zustand и в localStorage.

## Деплой

1. Подключить репозиторий к Vercel (или другому хостингу).
2. Добавить `DATABASE_URL`. Для продакшена с SQLite рассмотреть Turso или перейти на PostgreSQL.
3. После деплоя выполнить импорт данных отдельно (скрипты на Node).
4. В BotFather указать URL Mini App.

## Дальнейшее развитие

- Тафсир, аудио
- Валидация Telegram `initData` на сервере
- Дополнительные переводы и языки интерфейса
