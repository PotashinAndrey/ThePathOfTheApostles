// Простой in-memory rate limiter для защиты от брутфорса
// В продакшене лучше использовать Redis

interface RateLimitEntry {
  attempts: number;
  firstAttempt: number;
  lastAttempt: number;
}

// Хранилище попыток (в памяти)
const loginAttempts = new Map<string, RateLimitEntry>();

// Настройки rate limiting
const RATE_LIMIT_CONFIG = {
  MAX_ATTEMPTS: 5,           // Максимум попыток
  WINDOW_MINUTES: 15,        // Окно времени в минутах
  LOCKOUT_MINUTES: 30,       // Блокировка на минут
};

export class RateLimiter {
  
  /**
   * Проверяет разрешен ли запрос для данного ключа (обычно IP или email)
   */
  static isAllowed(key: string): { allowed: boolean; message?: string; resetTime?: number } {
    const now = Date.now();
    const entry = loginAttempts.get(key);

    if (!entry) {
      // Первая попытка
      return { allowed: true };
    }

    const windowMs = RATE_LIMIT_CONFIG.WINDOW_MINUTES * 60 * 1000;
    const lockoutMs = RATE_LIMIT_CONFIG.LOCKOUT_MINUTES * 60 * 1000;

    // Проверяем блокировку
    if (entry.attempts >= RATE_LIMIT_CONFIG.MAX_ATTEMPTS) {
      const lockoutEnd = entry.lastAttempt + lockoutMs;
      
      if (now < lockoutEnd) {
        const resetTime = Math.ceil((lockoutEnd - now) / 1000 / 60); // минуты
        return { 
          allowed: false, 
          message: `Слишком много попыток входа. Попробуйте через ${resetTime} минут.`,
          resetTime: lockoutEnd
        };
      } else {
        // Блокировка истекла, сбрасываем счетчик
        loginAttempts.delete(key);
        return { allowed: true };
      }
    }

    // Проверяем окно времени
    if (now - entry.firstAttempt > windowMs) {
      // Окно истекло, сбрасываем счетчик
      loginAttempts.delete(key);
      return { allowed: true };
    }

    return { allowed: true };
  }

  /**
   * Регистрирует неудачную попытку входа
   */
  static recordFailedAttempt(key: string): void {
    const now = Date.now();
    const entry = loginAttempts.get(key);

    if (!entry) {
      // Первая неудачная попытка
      loginAttempts.set(key, {
        attempts: 1,
        firstAttempt: now,
        lastAttempt: now
      });
    } else {
      // Увеличиваем счетчик
      entry.attempts += 1;
      entry.lastAttempt = now;
      loginAttempts.set(key, entry);
    }

    console.log(`🚨 Rate Limiter: Зафиксирована неудачная попытка для ${key}. Попыток: ${entry?.attempts || 1}`);
  }

  /**
   * Регистрирует успешный вход (сбрасывает счетчик)
   */
  static recordSuccessfulLogin(key: string): void {
    if (loginAttempts.has(key)) {
      loginAttempts.delete(key);
      console.log(`✅ Rate Limiter: Сброшен счетчик для ${key} после успешного входа`);
    }
  }

  /**
   * Получает статистику попыток
   */
  static getStats(key: string): RateLimitEntry | null {
    return loginAttempts.get(key) || null;
  }

  /**
   * Очищает устаревшие записи (вызывать периодически)
   */
  static cleanup(): void {
    const now = Date.now();
    const windowMs = RATE_LIMIT_CONFIG.WINDOW_MINUTES * 60 * 1000;
    const lockoutMs = RATE_LIMIT_CONFIG.LOCKOUT_MINUTES * 60 * 1000;

    let cleaned = 0;
    const keysToDelete: string[] = [];
    
    loginAttempts.forEach((entry, key) => {
      const timeSinceLastAttempt = now - entry.lastAttempt;
      
      // Помечаем записи для удаления если они старше блокировки + окна
      if (timeSinceLastAttempt > lockoutMs + windowMs) {
        keysToDelete.push(key);
      }
    });
    
    // Удаляем помеченные записи
    keysToDelete.forEach(key => {
      loginAttempts.delete(key);
      cleaned++;
    });

    if (cleaned > 0) {
      console.log(`🧹 Rate Limiter: Очищено ${cleaned} устаревших записей`);
    }
  }

  /**
   * Получает общую статистику
   */
  static getOverallStats(): { totalEntries: number; config: typeof RATE_LIMIT_CONFIG } {
    return {
      totalEntries: loginAttempts.size,
      config: RATE_LIMIT_CONFIG
    };
  }
}

// Автоматическая очистка каждые 30 минут
setInterval(() => {
  RateLimiter.cleanup();
}, 30 * 60 * 1000); 