# 🚀 Настройка чата с апостолом

## Шаг 1: Настройка Backend

1. Создайте файл `backend/.env.local` с переменными окружения:

```env
# OpenAI API Key для чата с апостолами  
OPENAI_API_KEY=your_openai_api_key_here

# PostgreSQL Database URLs (для Postgres.app)
DATABASE_URL="postgresql://postgres@localhost:5432/apostles_db"
DIRECT_URL="postgresql://postgres@localhost:5432/apostles_db"

# App settings
NODE_ENV=development
```

2. Убедитесь что PostgreSQL запущен (откройте Postgres.app) и создайте базу данных:

```bash
# База данных уже создана: apostles_db
/Applications/Postgres.app/Contents/Versions/17/bin/psql -d apostles_db -c "SELECT version();"
```

3. Установите зависимости и настройте базу данных:

```bash
cd backend
npm install
npx prisma generate
npx prisma db push
npx prisma db seed
```

## Шаг 2: Запуск серверов

1. Запустите Backend API (в одном терминале):
```bash
cd backend
npm run dev
```

2. Запустите Mobile приложение (в другом терминале):
```bash  
cd mobile
npm install
npm start
```

## Шаг 3: Получение OpenAI API ключа

1. Зайдите на https://platform.openai.com/
2. Создайте аккаунт или войдите 
3. Перейдите в раздел API Keys
4. Создайте новый ключ
5. Вставьте его в файл `.env.local` вместо `your_openai_api_key_here`

## Проверка работы

После запуска:
- Backend API будет доступен на http://localhost:3000
- Mobile приложение откроется в Expo
- В приложении выберите апостола и начните диалог
- Сообщения теперь будут обрабатываться через OpenAI API

## Если что-то не работает

1. Убедитесь что Postgres.app запущен
2. Проверьте что Backend запущен на порту 3000
3. Убедитесь что OpenAI API ключ корректный
4. Проверьте логи в терминале Backend на наличие ошибок
5. В mobile приложении откройте DevTools для просмотра сетевых запросов

## Offline режим

Если нужно вернуться к offline режиму, измените в `mobile/src/constants/config.ts`:
```typescript
USE_OFFLINE_MODE: true
``` 