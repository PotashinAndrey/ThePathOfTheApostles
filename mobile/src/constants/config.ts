// Конфигурация приложения
export const CONFIG = {
  // Включаем онлайн режим для работы с API
  USE_OFFLINE_MODE: false,
  API_BASE_URL: __DEV__ 
    ? 'http://localhost:3000/api' 
    : 'https://your-production-url.com/api',
};

// ID тестового пользователя
export const TEST_USER_ID = 'test-user-123'; 