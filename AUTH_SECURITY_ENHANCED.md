# 🛡️ Улучшенная безопасность авторизации

## 🚨 Проблема User Enumeration

**User Enumeration** - уязвимость когда злоумышленник может определить существует ли пользователь с определенным email на основе разных ответов системы.

### ❌ **Было (уязвимо):**
- "Пользователь не найден" vs "Неверный пароль" 
- Разное время ответа (timing attack)
- Возможность составления списков email

### ✅ **Стало (безопасно):**
- Единое сообщение "Неверные учетные данные"
- Одинаковое время ответа
- Rate limiting против брутфорса

## 🔧 Реализованные защиты

### 1. **Защита от Timing Attacks**

**Проблема:** Проверка пароля (bcrypt) занимает время. Если пользователь не существует - ответ быстрый, если существует - медленный.

**Решение:**
```typescript
// ВСЕГДА выполняем проверку пароля
if (user && user.status === 'ACTIVE') {
  // Реальная проверка
  isPasswordValid = await verifyPassword(password, user.passwordHash, user.salt);
} else {
  // Фиктивная проверка (тратим то же время)
  const dummyHash = '$2b$10$dummyHashToPreventTimingAttacks';
  const dummySalt = '$2b$10$dummySaltToPreventTimingAttacks';
  await verifyPassword(password, dummyHash, dummySalt);
}
```

### 2. **Единые сообщения об ошибках**

**Проблема:** Разные сообщения раскрывают информацию.

**Решение:**
```typescript
// ВСЕ ошибки авторизации возвращают одинаковое сообщение
if (!user) return "Неверные учетные данные";           // Было: "Пользователь не найден"
if (user.status !== 'ACTIVE') return "Неверные учетные данные"; // Было: "Аккаунт заблокирован"  
if (!isPasswordValid) return "Неверные учетные данные"; // Было: "Неверный пароль"
```

### 3. **Rate Limiting против брутфорса**

**Настройки:**
- ✅ **Максимум 5 попыток** за 15 минут
- ✅ **Блокировка на 30 минут** после превышения
- ✅ **Комбинированный ключ** IP + email
- ✅ **Автоматическая очистка** устаревших записей

```typescript
// Проверка перед авторизацией
const rateLimitKey = `${clientIP}:${email}`;
const rateLimitCheck = RateLimiter.isAllowed(rateLimitKey);

if (!rateLimitCheck.allowed) {
  return { error: "Слишком много попыток входа. Попробуйте через X минут" };
}
```

### 4. **Логирование подозрительной активности**

```typescript
// Логируем каждую попытку входа
console.log('🔐 Попытка входа:', { 
  email, 
  ip: clientIP,
  userAgent: request.headers.get('user-agent'),
  timestamp: new Date().toISOString()
});

// Фиксируем неудачные попытки
RateLimiter.recordFailedAttempt(rateLimitKey);
```

## 📊 Конфигурация Rate Limiting

### Текущие настройки:
```typescript
const RATE_LIMIT_CONFIG = {
  MAX_ATTEMPTS: 5,      // Максимум попыток
  WINDOW_MINUTES: 15,   // Окно времени в минутах  
  LOCKOUT_MINUTES: 30,  // Блокировка на минут
};
```

### Ключи rate limiting:
- **По IP + email:** `192.168.1.1:user@example.com`
- **Индивидуальная защита** для каждой комбинации
- **Сброс при успешном входе**

## 🔐 Frontend обработка

### Безопасные сообщения пользователю:

```typescript
// Обобщенные сообщения об ошибках
if (message.includes('неверные учетные данные')) {
  errorMessage = 'Неверный email или пароль';
} else if (message.includes('слишком много попыток')) {
  errorMessage = error.message; // Показываем время блокировки
} else {
  errorMessage = 'Произошла ошибка при входе в систему';
}
```

### Обработка rate limiting:
- ✅ **429 статус** обрабатывается специально
- ✅ **Показ времени блокировки** пользователю
- ✅ **Нет раскрытия** технических деталей

## 🛡️ Дополнительные меры безопасности

### 1. **Заголовки безопасности**
- IP адрес из `x-forwarded-for` и `x-real-ip`
- User-Agent для отслеживания ботов
- Timestamp каждой попытки

### 2. **Мониторинг атак**
```typescript
// Автоматическая очистка каждые 30 минут
setInterval(() => {
  RateLimiter.cleanup();
}, 30 * 60 * 1000);

// Статистика попыток
RateLimiter.getOverallStats(); // { totalEntries: 15, config: {...} }
```

### 3. **Graceful degradation**
- При проблемах с rate limiter - система работает
- Логирование всех ошибок
- Fallback на базовую проверку

## 🧪 Тестирование безопасности

### Сценарии атак:

1. **User Enumeration тест:**
   ```bash
   # Все запросы должны возвращать одинаковое сообщение
   curl -X POST /api/auth/login -d '{"email":"exists@test.com","password":"wrong"}'
   curl -X POST /api/auth/login -d '{"email":"notexists@test.com","password":"wrong"}'
   # Результат: "Неверные учетные данные" в обоих случаях
   ```

2. **Timing attack тест:**
   ```bash
   # Время ответа должно быть примерно одинаковым
   time curl -X POST /api/auth/login -d '{"email":"exists@test.com","password":"wrong"}'
   time curl -X POST /api/auth/login -d '{"email":"notexists@test.com","password":"wrong"}'
   ```

3. **Brute force тест:**
   ```bash
   # После 5 попыток должен прийти 429
   for i in {1..6}; do
     curl -X POST /api/auth/login -d '{"email":"test@test.com","password":"wrong'$i'"}'
   done
   ```

## 📈 Мониторинг в продакшене

### Метрики для отслеживания:
- **Количество заблокированных IP**
- **Частота 429 ошибок**
- **Географическое распределение попыток**
- **User-Agent анализ (боты)**

### Алерты:
- **>10 заблокированных IP в час** → подозрительная активность
- **>100 неудачных попыток** → возможная атака
- **Массовые попытки с одного IP** → ботнет

## ✅ Результат безопасности

### Защищено от:
- ✅ **User Enumeration** - нельзя определить существование пользователя
- ✅ **Timing Attacks** - одинаковое время ответа
- ✅ **Brute Force** - rate limiting блокирует атаки
- ✅ **Credential Stuffing** - комбинированный ключ IP+email
- ✅ **Information Disclosure** - минимум технической информации

### Соответствие стандартам:
- ✅ **OWASP Top 10** - A07:2021 (Identification and Authentication Failures)
- ✅ **NIST Guidelines** - SP 800-63B (Authentication guidelines)
- ✅ **ISO 27001** - A.9.4.2 (Secure log-on procedures)

**Система авторизации теперь соответствует современным стандартам безопасности! 🔒** 