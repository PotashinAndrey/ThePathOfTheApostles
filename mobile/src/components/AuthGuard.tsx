import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useUserStore } from '../stores/userStore';
import { useThemeStore } from '../stores/themeStore';
import { useAuthInterceptor } from '../hooks/useAuthInterceptor';

interface AuthGuardProps {
  children: React.ReactNode;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const { theme } = useThemeStore();
  const { isAuthenticated, checkTokenExpiry, logout, isLoading, setLoading } = useUserStore();
  const { checkAuth } = useAuthInterceptor(); // Инициализируем перехватчик API
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    // Проверка авторизации при запуске
    const initializeAuth = async () => {
      console.log('🔐 AuthGuard: Инициализация проверки авторизации');
      setLoading(true);
      
      try {
        // Небольшая задержка для стабильности
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Проверяем токен
        const tokenValid = checkTokenExpiry();
        console.log('🔐 AuthGuard: Токен валиден:', tokenValid);
        
        if (!tokenValid) {
          console.log('🔐 AuthGuard: Токен невалиден, выполняем logout');
          logout();
        }
        
      } catch (error) {
        console.error('❌ AuthGuard: Ошибка инициализации:', error);
        logout(); // В случае ошибки разлогиниваем
      } finally {
        setLoading(false);
        setIsInitializing(false);
      }
    };

    initializeAuth();
  }, []);

  useEffect(() => {
    // Периодическая проверка токена (каждые 5 минут)
    const interval = setInterval(() => {
      if (isAuthenticated()) {
        console.log('🔐 AuthGuard: Периодическая проверка токена');
        checkTokenExpiry();
      }
    }, 5 * 60 * 1000); // 5 минут

    return () => clearInterval(interval);
  }, [isAuthenticated, checkTokenExpiry]);

  // Показываем загрузчик во время инициализации
  if (isInitializing || isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <View style={styles.loadingContent}>
          <Text style={[styles.logo, { color: theme.colors.text }]}>
            🙏 Путь Апостолов
          </Text>
          <ActivityIndicator 
            size="large" 
            color={theme.colors.primary} 
            style={styles.loader}
          />
          <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
            Проверка авторизации...
          </Text>
        </View>
      </View>
    );
  }

  return <>{children}</>;
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingContent: {
    alignItems: 'center',
  },
  logo: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
  },
  loader: {
    marginBottom: 20,
  },
  loadingText: {
    fontSize: 16,
    textAlign: 'center',
  },
}); 