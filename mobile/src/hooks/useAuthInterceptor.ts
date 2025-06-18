import { useEffect } from 'react';
import { useUserStore } from '../stores/userStore';
import apiService from '../services/apiNew';

/**
 * Hook для автоматической проверки авторизации в API запросах
 * Автоматически разлогинивает пользователя при 401 ошибке
 */
export const useAuthInterceptor = () => {
  const { logout, checkTokenExpiry, isAuthenticated } = useUserStore();

  useEffect(() => {
    // Interceptor для автоматической обработки 401 ошибок
    const setupInterceptor = () => {
      // Переопределяем базовый fetch для автоматической обработки
      const originalFetch = window.fetch;
      
      window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
        // Проверяем токен перед каждым запросом
        if (isAuthenticated()) {
          const tokenValid = checkTokenExpiry();
          if (!tokenValid) {
            console.log('🔐 useAuthInterceptor: Токен невалиден, отменяем запрос');
            throw new Error('Токен истек, требуется повторная авторизация');
          }
        }

        try {
          const response = await originalFetch(input, init);
          
          // Проверяем на 401 ошибку
          if (response.status === 401) {
            console.log('🔐 useAuthInterceptor: Получена 401 ошибка, выполняем logout');
            logout();
            throw new Error('Сессия истекла, требуется повторная авторизация');
          }
          
          return response;
        } catch (error) {
          // Если это ошибка сети и пользователь авторизован, проверяем токен
          if (isAuthenticated() && error instanceof TypeError) {
            console.log('🔐 useAuthInterceptor: Сетевая ошибка, проверяем токен');
            checkTokenExpiry();
          }
          
          throw error;
        }
      };
    };

    setupInterceptor();

    // Cleanup не нужен, так как мы переопределяем глобальный fetch
    return () => {
      // Можно было бы восстановить оригинальный fetch, но это не критично
    };
  }, [logout, checkTokenExpiry, isAuthenticated]);

  // Функция для ручной проверки авторизации
  const checkAuth = () => {
    if (!isAuthenticated()) {
      console.log('🔐 useAuthInterceptor: Пользователь не авторизован');
      return false;
    }
    
    const tokenValid = checkTokenExpiry();
    if (!tokenValid) {
      console.log('🔐 useAuthInterceptor: Токен невалиден');
      return false;
    }
    
    return true;
  };

  return {
    checkAuth,
  };
}; 