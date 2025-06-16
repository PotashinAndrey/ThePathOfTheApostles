# API Endpoints Documentation

## Chat API

### 1. GET /api/chats
Получить все чаты пользователя

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "chat_id",
      "name": "Беседа с Петром",
      "apostle": {
        "id": "peter",
        "name": "Пётр",
        "title": "Нерушимый",
        "description": "...",
        "archetype": "Стойкость",
        "personality": "...",
        "icon": "🗿",
        "color": "#8B4513",
        "virtue": {
          "id": "virtue_id",
          "name": "Стойкость",
          "description": "..."
        }
      },
      "lastMessage": {
        "id": "msg_id",
        "sender": "APOSTLE",
        "content": "Последнее сообщение...",
        "createdAt": "2024-01-01T00:00:00Z"
      },
      "unreadCount": 0
    }
  ]
}
```

### 2. POST /api/chats
Создать новый чат

**Headers:**
```
Authorization: Bearer <token>
```

**Body:**
```json
{
  "apostleId": "peter",
  "pathId": "path_id", // optional
  "challengeId": "challenge_id" // optional
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "new_chat_id",
    "name": "Беседа с Петром",
    "apostle": { /* apostle object */ },
    "unreadCount": 0
  },
  "message": "Чат успешно создан"
}
```

### 3. GET /api/chats/[id] ✨ NEW
Получить конкретный чат с сообщениями (с пагинацией)

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` (optional, default: 1) - номер страницы
- `limit` (optional, default: 10) - количество сообщений на странице

**Example:** `/api/chats/chat_123?page=1&limit=10`

**Response:**
```json
{
  "success": true,
  "data": {
    "chat": {
      "id": "chat_123",
      "name": "Беседа с Петром",
      "apostle": { /* apostle object */ }
    },
    "messages": [
      {
        "id": "msg_1",
        "sender": "USER",
        "content": "Привет!",
        "createdAt": "2024-01-01T00:00:00Z"
      },
      {
        "id": "msg_2",
        "sender": "APOSTLE",
        "content": "Мир тебе, искатель!",
        "createdAt": "2024-01-01T00:01:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "hasMore": true
    }
  }
}
```

### 4. POST /api/chats/[id]/messages ✨ NEW
Отправить сообщение в чат

**Headers:**
```
Authorization: Bearer <token>
```

**Body:**
```json
{
  "content": "Текст сообщения",
  "voiceUrl": "https://example.com/voice.mp3" // optional
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "new_msg_id",
    "sender": "APOSTLE",
    "content": "Ответ апостола на сообщение",
    "createdAt": "2024-01-01T00:02:00Z"
  },
  "message": "Сообщение отправлено"
}
```

### 5. POST /api/chat (Legacy)
Старый эндпоинт для отправки сообщений (для обратной совместимости)

**Headers:**
```
Authorization: Bearer <token>
```

**Body:**
```json
{
  "apostleId": "peter",
  "message": "Текст сообщения",
  "context": ["previous messages..."], // optional
  "additionalContext": "extra context", // optional
  "chatId": "existing_chat_id" // optional
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Ответ апостола",
    "apostleId": "peter",
    "chatId": "chat_id",
    "timestamp": "2024-01-01T00:00:00Z"
  }
}
```

## Auth API

### 1. POST /api/auth/register
Регистрация нового пользователя

**Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "confirmPassword": "password123",
  "name": "Имя пользователя"
}
```

### 2. POST /api/auth/login
Вход пользователя

**Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "jwt_token_here",
    "user": {
      "id": "user_id",
      "name": "Имя",
      "email": "user@example.com",
      // ... other user fields
    },
    "message": "Успешная авторизация"
  }
}
```

## Apostles API

### 1. GET /api/apostles
Получить всех апостолов (без авторизации)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "peter",
      "name": "Пётр",
      "title": "Нерушимый",
      "description": "...",
      "archetype": "Стойкость",
      "personality": "...",
      "icon": "🗿",
      "color": "#8B4513",
      "virtue": { /* virtue object */ }
    }
  ]
}
```

## Error Responses

Все эндпоинты могут возвращать ошибки в следующем формате:

```json
{
  "success": false,
  "error": "Описание ошибки"
}
```

**Коды ошибок:**
- `400` - Неверные параметры запроса
- `401` - Требуется авторизация
- `404` - Ресурс не найден
- `500` - Внутренняя ошибка сервера

## Pagination

Пагинация работает по принципу "последние сообщения сначала":
- `page=1` возвращает самые новые сообщения
- `page=2` возвращает предыдущие сообщения
- `hasMore=true` означает что есть еще более старые сообщения

Для получения всех сообщений нужно делать запросы с увеличивающимся `page` пока `hasMore` не станет `false`.

## Authentication

Все защищенные эндпоинты требуют JWT токен в заголовке:
```
Authorization: Bearer <your_jwt_token>
```

Токен получается при успешной авторизации через `/api/auth/login`. 