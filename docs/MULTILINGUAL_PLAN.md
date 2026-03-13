# План: поддержка переводов и мультиязычность

## 1. Обновлённая Prisma schema

- **Sura** — без изменений.
- **Ayah** — убрать поле `text`. Добавить связь `texts AyahText[]`. Добавить `@@unique([suraId, ayahNumber])`. Убрать `@@index([text])`.
- **AyahText** (новая модель): `id`, `ayahId`, `languageCode` (ar|ru|uz|tr), `text`, связь с Ayah. `@@unique([ayahId, languageCode])`, `@@index([languageCode])`, при необходимости `@@index([languageCode, text])` для поиска (SQLite LIKE через raw или Prisma contains).
- **UserState, Favorite, History** — без изменений (работают с ayahId).

## 2. План миграции

- Текущая БД содержит `Ayah` с полем `text`. Новая схема удаляет `text` и вводит таблицу `AyahText`.
- **Рекомендация:** SQLite не умеет мигрировать «удалить колонку + добавить таблицу» без потери данных. Варианты:
  1. **Полный сброс (для разработки):** удалить `prisma/dev.db`, выполнить `npx prisma db push`, заново запустить `import:quran` и `import:translation` для всех языков.
  2. **Миграция с сохранением данных:** написать одноразовый скрипт, который прочитает все `Ayah`, создаст записи `AyahText(ayahId, "ar", text)`, затем применить новую схему (например, через миграцию с переименованием таблицы и копированием). Для MVP проще вариант 1.
- В README указать: после обновления схемы выполнить `db:push`, затем заново импортировать арабский текст и переводы.

## 3. Какие файлы будут изменены

| Файл | Изменения |
|------|-----------|
| `prisma/schema.prisma` | Новая модель AyahText, у Ayah убрать text, добавить texts, @@unique |
| `scripts/import-quran.ts` | Парсинг `--file=...`, создание Ayah без text, AyahText(ar) |
| `scripts/import-translation.ts` | Новый скрипт: `--file=... --lang=ru|uz|tr|ar`, upsert AyahText |
| `package.json` | Добавить `import:translation` |
| `app/api/ayah/[sura]/[ayah]/route.ts` | Query `lang`, выборка arabicText + translationText из AyahText |
| `app/api/suras/[id]/route.ts` | Query `lang`, список аятов с arabicText + translationText |
| `app/api/search/route.ts` | Query `lang`, парсинг ссылок (2:255, 2.255, 2 255, sura 2 ayah 255), поиск по AyahText (ar + lang) |
| `app/api/user/last-read/route.ts` | Опционально query `lang`, вернуть last ayah с текстами |
| `app/api/user/favorites/route.ts` | Опционально query `lang`, вернуть избранные с текстами |
| `types/index.ts` | arabicText, translationText в типах, AppLanguage, TranslationLanguage |
| `store/useAppStore.ts` | appLanguage, translationLanguage, persist (localStorage) |
| `lib/i18n.ts` или `locales/*.json` | Словари ru, uz, tr, ar |
| `components/Header.tsx` | Переключатель языка интерфейса (и/или переводов) |
| `components/AyahCard.tsx` | Показ arabicText + translationText |
| `app/ayah/[sura]/[ayah]/page.tsx` | Запрос с lang, отображение арабский + перевод, переключатели |
| Остальные страницы и компоненты | Использование t(), передача lang в API |
| `README.md` | Миграция, импорт переводов, примеры команд |

## 4. Устройство import-скриптов

### import-quran.ts

- Аргументы: `--file=./data/quran.txt` (обязательный). Парсинг через простой цикл по process.argv или мини-парсер.
- Формат файла: одна строка = `sura|ayah|text` (арабский текст).
- Логика:
  1. Парсить файл (как сейчас), валидация сура 1–114, аят ≥ 1.
  2. В транзакции: удалить все AyahText и Ayah и Sura (или только AyahText для араба и Ayah, если хотим сохранить суры). По ТЗ — полный импорт: суры + аяты + арабский текст.
  3. Создать Sura по счётчикам аятов.
  4. Создать Ayah (id, suraId, ayahNumber, globalIndex), без text.
  5. Для каждого аята создать AyahText(ayahId, "ar", text).

### import-translation.ts

- Аргументы: `--file=./data/ru.txt` и `--lang=ru` (допустимы ru, uz, tr, ar).
- Формат файла: тот же `sura|ayah|text`.
- Логика:
  1. Валидация lang из набора [ar, ru, uz, tr].
  2. Читать файл, парсить строки.
  3. Для каждой строки: найти Ayah по (suraId, ayahNumber) или по id = `${sura}:${ayah}`. Если аят не найден — логировать и пропускать.
  4. upsert AyahText: где ayahId + languageCode = lang, обновить text или создать запись.
  5. Логировать количество созданных/обновленных и ошибки.

## 5. Поиск по translationLanguage

- **Параметр:** `GET /api/search?q=...&lang=ru` (lang по умолчанию можно ru или ar).
- **Парсинг ссылки на аят:**
  - Регулярки: `(\d+):(\d+)`, `(\d+)\.(\d+)`, `(\d+)\s+(\d+)`, `sura\s*(\d+)\s*ayat?\s*(\d+)` (и т.п.). При совпадении — искать один аят по id = `${sura}:${ayah}`, вернуть его с arabicText и translationText для выбранного lang.
- **Текстовый поиск:**
  - Найти все AyahText, где (languageCode = 'ar' AND text LIKE %q%) OR (languageCode = lang AND text LIKE %q%) (для SQLite без insensitive).
  - Получить уникальные ayahId.
  - Загрузить эти аяты с AyahText для ar и для lang, вернуть список с arabicText и translationText.
  - Лимит 50.
- **Итог:** один endpoint возвращает единый формат: массив элементов с ayahId, suraId, ayahNumber, arabicText, translationText (и при необходимости sura name).

После этого переходим к реализации.
