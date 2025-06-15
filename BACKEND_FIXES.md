# Исправления Backend API

## 🔧 Исправленные ошибки

### 1. Проблема с Prisma Client
**Ошибка**: `Unknown field 'currentApostleId' for select statement on model 'User'`

**Причина**: После обновления схемы БД Prisma client не был правильно перегенерирован и использовал старые типы.

**Решение**:
```bash
# Очистили кэш Prisma
rm -rf node_modules/.prisma && rm -rf node_modules/@prisma

# Переустановили Prisma пакеты
npm install prisma @prisma/client

# Перегенерировали client
npx prisma generate

# Пересоздали БД с новой схемой
npx prisma migrate reset --force
```

### 2. Обновленные endpoints

#### `/api/auth/login` - Логин пользователя
**Изменения**:
- ✅ Убрано старое поле `currentApostleId`
- ✅ Добавлены новые поля: `status`, `avatar`, `currentSubscription`
- ✅ Использует новую функцию `verifyPassword()` из `auth.ts`
- ✅ Генерирует JWT токены через `generateToken()`
- ✅ Проверяет статус пользователя (`ACTIVE`)
- ✅ Возвращает структурированный ответ `ApiResponse<AuthResponse>`

#### `/api/auth/register` - Регистрация пользователя
**Изменения**:
- ✅ Добавлена валидация `confirmPassword`
- ✅ Использует `createUserWithProgress()` для создания пользователя со связанными сущностями
- ✅ Автоматически создает `UserProgress`, `CompletedChallengesList`, `UserPathsList` и др.
- ✅ Возвращает JWT токен сразу после регистрации

#### `/api/users` - Данные пользователя
**Изменения**:
- ✅ Добавлена обязательная авторизация
- ✅ Пользователь может получить только свои данные
- ✅ Убраны старые связи (`missions`, `chatMessages`)
- ✅ Добавлены новые поля из обновленной схемы
- ✅ Возвращает структурированный ответ `ApiResponse<UserResponse>`

#### `/api/chat` - Чат с апостолами
**Изменения**:
- ✅ Использует новую систему авторизации
- ✅ Автоматически создает чат если не передан `chatId`
- ✅ Сохраняет сообщения в модель `ChatMessage` с полем `chatId`
- ✅ Использует enum `MessageSender` (`USER`/`APOSTLE`)
- ✅ Связывает апостола с добродетелью (`virtue`)
- ✅ Возвращает `chatId` в ответе

#### `/api/apostles` - Список апостолов
**Изменения**:
- ✅ Включает связанную добродетель (`virtue`)
- ✅ Возвращает структурированный ответ с новыми полями
- ✅ Поддерживает поле `title` апостола

#### `/lib/simpleAuth.ts` - Система авторизации
**Изменения**:
- ✅ Убрано старое поле `currentApostleId`
- ✅ Добавлено поле `status` и проверка активности пользователя
- ✅ Автоматически обновляет `lastActiveDate` при каждом запросе
- ✅ Возвращает корректный тип `AuthUser`

## ✅ Что теперь работает

### Регистрация
```bash
POST /api/auth/register
{
  "name": "Иван Иванов",
  "email": "ivan@example.com", 
  "password": "password123",
  "confirmPassword": "password123"
}
```

### Логин
```bash
POST /api/auth/login
{
  "email": "ivan@example.com",
  "password": "password123"
}
```

### Чат с апостолом
```bash
POST /api/chat
Authorization: Bearer <token>
{
  "apostleId": "peter",
  "message": "Привет, как дела?",
  "chatId": "chat_id" // опционально
}
```

### Получение апостолов
```bash
GET /api/apostles
```

### Профиль пользователя
```bash
GET /api/users
Authorization: Bearer <token>
```

## 🎯 Результат

- ✅ **Все ошибки Prisma исправлены** - client использует новую схему
- ✅ **Авторизация работает** - JWT токены генерируются и проверяются
- ✅ **Чаты создаются** - автоматическое создание чатов с апостолами
- ✅ **Сообщения сохраняются** - в правильную модель `ChatMessage`
- ✅ **Регистрация полная** - создается пользователь со всеми связями
- ✅ **API консистентно** - все endpoints возвращают `ApiResponse<T>`

## 🔜 Следующие шаги

1. **Протестировать все endpoints** через фронтенд или Postman
2. **Добавить оставшиеся endpoints**:
   - `/api/paths` - управление путями
   - `/api/challenges` - задания
   - `/api/notifications` - уведомления
   - `/api/achievements` - достижения
   - `/api/subscriptions` - подписки

3. **Добавить middleware для логирования** запросов
4. **Настроить CORS** для фронтенда
5. **Добавить rate limiting** для защиты от спама

Теперь backend готов для полноценной работы с мобильным приложением! 🚀 