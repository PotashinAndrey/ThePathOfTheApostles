# Настройка PostgreSQL для проекта "Путь Апостолов"

## Опция 1: Используя Docker (рекомендуется)

1. Установите Docker Desktop с официального сайта
2. Запустите PostgreSQL контейнер:
```bash
docker compose up -d postgres
```

## Опция 2: Локальная установка PostgreSQL

1. Установите PostgreSQL:
   - **macOS**: `brew install postgresql`
   - **Ubuntu**: `sudo apt-get install postgresql postgresql-contrib`
   - **Windows**: Скачайте с официального сайта PostgreSQL

2. Создайте базу данных:
```bash
createdb apostles
```

3. Создайте пользователя (опционально):
```bash
createuser -s postgres
```

## Настройка переменных окружения

Создайте файл `.env` в папке `backend/` с содержимым:

```env
# Database Configuration
DATABASE_URL="postgresql://postgres:password@localhost:5432/apostles?schema=public"
DIRECT_URL="postgresql://postgres:password@localhost:5432/apostles?schema=public"

# Next.js Configuration
NEXTAUTH_SECRET="your-secret-key-here-change-this-in-production"
NEXTAUTH_URL="http://localhost:3000"

# Development
NODE_ENV="development"
```

## Выполнение миграций

После настройки базы данных выполните:

```bash
# Создание и применение миграций
npx prisma migrate dev --name init

# Генерация Prisma клиента
npx prisma generate

# Заполнение тестовыми данными
npm run seed
```

## Проверка подключения

Проверьте подключение к базе данных:
```bash
npx prisma studio
```

Это откроет веб-интерфейс для просмотра данных в браузере на `http://localhost:5555` 