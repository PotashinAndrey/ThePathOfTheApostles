# Обновление Backend API для новой схемы БД

## ✅ Что сделано

### 1. Обновлена схема БД (`backend/prisma/schema.prisma`)

**Новые сущности:**
- `Path` - пути развития
- `Challenge` - задания от апостолов  
- `Skill` - навыки/добродетели апостолов
- `Chat` - чаты пользователей с апостолами
- `Subscription` - планы подписки
- `Achievement` - достижения пользователей
- `Feature` - функции для фичатоглинга
- `PhraseSet` - наборы фраз для апостолов
- `ChatPreset` - пресеты для настройки чатов
- `ChallengeResult` - результаты выполнения заданий
- `UserProgress` - метаинформация о прогрессе пользователя
- `UserApostleRelation` - отношения с апостолами
- `Phrase` - цитаты и фразы апостолов
- `UserNote` - заметки пользователей
- `CompletedChallengesList` - списки выполненных заданий
- `UserPathsList` - активные и завершенные пути  
- `UserAchievementsList` - достижения пользователей

**Обновленные сущности:**
- `User` - добавлены поля avatar, status, currentSubscription, связь с UserProgress
- `Apostle` - добавлены поля title, virtueId, phraseSetsId, обновлены связи
- `ChatMessage` - добавлены поля voiceUrl, metadata, apostleId, relatedChallengeId

### 2. Создан файл типов (`backend/src/types/api.ts`)

Определены TypeScript интерфейсы для:
- API responses (UserResponse, ApostleResponse, ChatInfo, etc.)
- Request types (LoginRequest, RegisterRequest, etc.)
- API wrapper (ApiResponse<T>)

### 3. Обновлены утилиты авторизации (`backend/src/lib/auth.ts`)

- Добавлена работа с JWT токенами
- Функции валидации email и пароля
- Утилита создания пользователя с прогрессом
- Middleware для проверки авторизации

### 4. Созданы заглушки новых endpoints

Структура новых API endpoints:
```
/api/user/profile     - GET, PUT (профиль пользователя)
/api/user/stats       - GET (статистика пользователя)
/api/chats           - GET, POST (список чатов)
/api/chats/[id]      - GET (конкретный чат с сообщениями)
```

## 🔄 Следующие шаги для завершения

### 1. Исправить Prisma Client

Проблема: после обновления схемы Prisma client не видит новые поля и модели.

**Решение:**
```bash
cd backend
rm -rf node_modules/.prisma
rm -rf node_modules/@prisma
npm install
npx prisma generate
npx prisma migrate reset --force
```

### 2. Завершить API endpoints

**Необходимые endpoints для приложения:**

#### Авторизация
- ✅ `POST /api/auth/login` - логин
- ✅ `POST /api/auth/register` - регистрация (требует обновления)
- ❌ `POST /api/auth/logout` - выход
- ❌ `POST /api/auth/forgot-password` - забыл пароль
- ❌ `POST /api/auth/reset-password` - сброс пароля

#### Пользователь
- ❌ `GET /api/user/profile` - получить профиль
- ❌ `PUT /api/user/profile` - обновить профиль
- ❌ `POST /api/user/change-password` - сменить пароль
- ❌ `GET /api/user/stats` - статистика пользователя

#### Апостолы
- ✅ `GET /api/apostles` - список апостолов (требует обновления)
- ❌ `GET /api/apostles/[id]` - конкретный апостол

#### Чаты
- ❌ `GET /api/chats` - список чатов пользователя
- ❌ `POST /api/chats` - создать чат
- ❌ `GET /api/chats/[id]` - получить чат с сообщениями
- ❌ `POST /api/chats/[id]/messages` - отправить сообщение

#### Пути и задания
- ❌ `GET /api/paths` - список путей
- ❌ `GET /api/paths/[id]` - конкретный путь
- ❌ `GET /api/challenges` - задания пользователя
- ❌ `GET /api/challenges/[id]` - конкретное задание
- ❌ `POST /api/challenges/[id]/complete` - завершить задание

#### Достижения
- ❌ `GET /api/achievements` - список достижений
- ❌ `GET /api/user/achievements` - достижения пользователя

#### Подписки
- ❌ `GET /api/subscriptions` - планы подписки
- ❌ `POST /api/user/subscription` - обновить подписку

#### Уведомления  
- ❌ `GET /api/notifications` - список уведомлений
- ❌ `PUT /api/notifications/[id]/read` - отметить как прочитанное

### 3. Структура экранов мобильного приложения

**Основные экраны:**

1. **Авторизация**
   - Логин (email, password)
   - Регистрация (name, email, password, confirmPassword)
   - Восстановление пароля

2. **Главный экран**
   - Приветствие + переключатель темы
   - Стрик дней и общие дни
   - Прогресс текущего пути
   - Текущие задания (до 3)
   - Кнопка "Поговорить с апостолом"

3. **Навигация (5 элементов)**
   - Главная
   - Путь  
   - Беседы
   - Задания
   - Профиль (дропдаун: профиль, уведомления, настройки)

4. **Профиль**
   - Аватар, имя, дата регистрации
   - Стрик дней обучения
   - Количество заданий/путей
   - Достижения

5. **Остальные экраны**
   - Уведомления
   - Настройки
   - Планы подписки  
   - Достижения
   - Задания
   - Страница задания
   - Беседы (список чатов)
   - Конкретная беседа
   - Страница пути
   - Онбординг чат

### 4. Дополнительные функции

- Поддержка темной/светлой темы
- Push уведомления
- Поддержка голосовых сообщений
- Адаптивная верстка iPhone/Android
- Фичатоглинг

## 📝 Примеры запросов

### Получение статистики пользователя
```
GET /api/user/stats
Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": {
    "streak": 7,
    "totalDays": 14,
    "challengesCompleted": 5,
    "pathsCompleted": 1,
    "currentPath": {...},
    "activeChallenges": [...]
  }
}
```

### Создание чата
```
POST /api/chats
Authorization: Bearer <token>
Content-Type: application/json

{
  "apostleId": "peter",
  "pathId": "discipline-path", // optional
  "challengeId": "daily-discipline" // optional
}
```

### Отправка сообщения
```
POST /api/chats/[chatId]/messages
Authorization: Bearer <token>
Content-Type: application/json

{
  "content": "Привет, как дела?",
  "voiceUrl": "https://..." // optional
}
``` 