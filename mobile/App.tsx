import React, { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Platform } from 'react-native';
import { AppNavigator } from './src/navigation/AppNavigator';
import { useTaskWrapperSync } from './src/hooks/useTaskWrapperSync';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

// Error boundary для отлова ошибок
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    console.error('🚨 Error Boundary поймал ошибку:', error);
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('🚨 Error Boundary componentDidCatch:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      const { View, Text, TouchableOpacity } = require('react-native');
      return (
        <View style={{
          flex: 1,
          padding: 20,
          backgroundColor: '#ff6b6b',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <Text style={{
            fontSize: 24,
            color: 'white',
            fontWeight: 'bold',
            marginBottom: 20,
            textAlign: 'center'
          }}>
            🚨 Ошибка приложения
          </Text>
          <Text style={{
            fontSize: 16,
            color: 'white',
            marginBottom: 10,
            textAlign: 'center'
          }}>
            Platform: {Platform.OS}
          </Text>
          <Text style={{
            fontSize: 14,
            color: 'white',
            marginBottom: 10,
            textAlign: 'center'
          }}>
            Error: {this.state.error?.message}
          </Text>
          <TouchableOpacity
            style={{
              padding: 15,
              backgroundColor: 'white',
              borderRadius: 8,
              marginTop: 20
            }}
            onPress={() => {
              // Для React Native нужно перезапустить приложение другим способом
              console.log('🔄 Перезагрузка приложения...');
            }}
          >
            <Text style={{
              color: '#ff6b6b',
              fontSize: 16,
              fontWeight: 'bold'
            }}>
              🔄 Перезагрузить
            </Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}

export default function App() {
  useEffect(() => {
    // Глобальная обработка ошибок
    const handleError = (event: ErrorEvent) => {
      console.error('Глобальная ошибка JavaScript:', event.error);
      console.error('Файл:', event.filename, 'Строка:', event.lineno);
    };

    const handlePromiseRejection = (event: PromiseRejectionEvent) => {
      console.error('Необработанное отклонение Promise:', event.reason);
    };

    if (Platform.OS === 'web') {
      window.addEventListener('error', handleError);
      window.addEventListener('unhandledrejection', handlePromiseRejection);

      return () => {
        window.removeEventListener('error', handleError);
        window.removeEventListener('unhandledrejection', handlePromiseRejection);
      };
    }
  }, []);

  // Компонент-обертка для использования хуков внутри провайдеров
  const AppWrapper = () => {
    useTaskWrapperSync(); // Автоматическая синхронизация TaskWrapper'ов
    return <AppNavigator />;
  };

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AppWrapper />
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
