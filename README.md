# 📘 Путь Апостолов (The Path of the Apostles)

Духовно-развивающее мобильное приложение с AI-наставниками для персонального роста и саморазвития.

## 🎯 Описание проекта

"Путь Апостолов" — это инновационное приложение, которое сочетает древнюю мудрость с современными технологиями ИИ. Пользователи выбирают одного из 12 апостолов в качестве духовного наставника, получают персональные задания и ведут диалоги для развития характера и духовности.

### ✨ Основные возможности
- 🤖 **AI-диалоги** с 12 уникальными апостолами-наставниками
- 🎯 **Персональные задания** для духовного развития (3-7 дней)
- 📊 **Отслеживание прогресса** и статистики
- 🌙 **Темная и светлая темы** с духовным дизайном
- 🇷🇺 **Российский рынок** - CloudPayments, AppMetrica

## 🏗️ Архитектура проекта

```
ThePathOfTheApostles/
├── mobile/          # React Native приложение (Expo)
├── backend/         # Next.js API сервер
├── DOCS/           # Документация проекта
└── package.json    # Monorepo конфигурация
```

### 📱 Технологический стек

| Компонент | Технология | Назначение |
|-----------|------------|------------|
| **Frontend** | React Native (Expo) | Мобильное приложение |
| **Backend** | Next.js API Routes | RESTful API сервер |
| **Database** | Supabase (PostgreSQL) | База данных и аутентификация |
| **State Management** | Zustand | Управление состоянием |
| **Data Fetching** | React Query | Кэширование и синхронизация данных |
| **AI** | OpenAI GPT-3.5 | Диалоги с апостолами |
| **Navigation** | React Navigation | Навигация в приложении |
| **ORM** | Prisma | Работа с базой данных |

## 🚀 Быстрый старт

### Предварительные требования
- Node.js 18+ 
- npm или yarn
- Expo CLI
- Аккаунт Supabase
- OpenAI API ключ

### 1. Клонирование и установка
```bash
git clone https://github.com/your-username/ThePathOfTheApostles.git
cd ThePathOfTheApostles

# Установка зависимостей для всех пакетов
npm run install:all
```

### 2. Настройка окружения

Создайте `.env.local` файл в папке `backend/`:
```env
# OpenAI
OPENAI_API_KEY=your_openai_api_key

# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
DATABASE_URL=your_postgresql_connection_string
```

### 3. Настройка базы данных
```bash
cd backend
npm run prisma:generate
npm run prisma:push
```

### 4. Запуск проекта
```bash
# Запуск и frontend, и backend одновременно
npm run dev

# Или по отдельности:
npm run backend  # Next.js сервер на :3000
npm run mobile   # Expo приложение
```

## 📋 Структура приложения

### 🎭 Апостолы-наставники (MVP - 3 апостола)
1. **Пётр Непоколебимый** 🗿 - Дисциплина и стойкость
2. **Иоанн Размышляющий** 🧘‍♂️ - Осознанность и внутренний покой  
3. **Матфей Счётный** 📊 - Ответственность и расчётливость

### 📱 Экраны приложения
- **Главная** - Приветствие, статистика, быстрые действия
- **Наставники** - Выбор и информация об апостолах
- **Беседа** - Чат с выбранным апостолом
- **Задания** - Текущие и завершенные миссии

### 🎨 Дизайн-система
- **Цвета**: Духовная палитра (синий, коричневый, фиолетовый, золотой)
- **Темы**: Светлая и темная тема
- **Иконки**: Эмодзи для простоты и универсальности
- **Типографика**: Системные шрифты с акцентом на читаемость

## 🛠️ Разработка

### Структура файлов

#### Mobile приложение (`mobile/src/`)
```
components/     # Переиспользуемые компоненты
├── ApostleCard.tsx
├── ChatBubble.tsx
└── MissionCard.tsx

screens/        # Экраны приложения
├── HomeScreen.tsx
├── ApostlesScreen.tsx
├── ChatScreen.tsx
└── MissionsScreen.tsx

stores/         # Zustand стейт менеджеры
├── themeStore.ts
└── userStore.ts

constants/      # Константы и конфигурация
├── apostles.ts
└── theme.ts

services/       # API интеграции
└── api.ts
```

#### Backend API (`backend/src/`)
```
app/api/        # Next.js API routes
├── chat/route.ts
├── apostles/route.ts
└── users/route.ts

lib/            # Утилиты и конфигурация
├── prisma.ts
└── openai.ts

prisma/         # База данных
└── schema.prisma
```

### 🔧 Доступные команды
```bash
# Разработка
npm run dev              # Запуск frontend + backend
npm run mobile          # Только React Native
npm run backend         # Только Next.js API

# База данных
npm run prisma:generate # Генерация Prisma клиента
npm run prisma:push     # Применение схемы к БД
npm run prisma:studio   # GUI для БД

# Сборка
npm run build           # Сборка всего проекта
npm run type-check      # Проверка TypeScript
```

## 🚧 Roadmap

### MVP (Текущая версия)
- ✅ 3 апостола-наставника
- ✅ Базовый чат с ИИ
- ✅ Система заданий
- ✅ Темы (светлая/темная)
- ✅ Мобильная навигация

### Версия 1.1
- [ ] Голосовой ввод/вывод (TTS/STT)
- [ ] Push-уведомления
- [ ] Система подписок
- [ ] Все 12 апостолов
- [ ] Аналитика пользователей

### Версия 2.0
- [ ] Международная локализация
- [ ] Stripe интеграция
- [ ] Расширенная статистика
- [ ] Социальные функции
- [ ] Персонализированный контент

## 🤝 Участие в разработке

1. Fork проекта
2. Создайте feature branch (`git checkout -b feature/amazing-feature`)
3. Commit изменения (`git commit -m 'Add amazing feature'`)
4. Push в branch (`git push origin feature/amazing-feature`)
5. Откройте Pull Request

## 📚 Документация

Дополнительная техническая документация находится в папке `DOCS/`:
- **Спецификации экранов** - детальное описание всех экранов приложения
- **Логика системы** - архитектура и бизнес-логика
- **Руководства** - документация по отдельным компонентам

## 📄 Лицензия

Этот проект лицензирован под MIT License - см. файл [LICENSE](LICENSE).

## 👨‍💻 Автор

**Andry Potashin**
- GitHub: [@andrypotashin](https://github.com/andrypotashin)
- Email: your-email@example.com

---

*"Путь к мудрости начинается с одного шага"* ✨ 