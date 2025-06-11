import React, { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Platform } from 'react-native';
import { AppNavigator } from './src/navigation/AppNavigator';

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
      return (
        <div style={{
          padding: '20px',
          backgroundColor: '#ff6b6b',
          color: 'white',
          fontFamily: 'monospace',
          whiteSpace: 'pre-wrap'
        }}>
          <h2>🚨 Ошибка приложения</h2>
          <p><strong>Platform:</strong> {Platform.OS}</p>
          <p><strong>Error:</strong> {this.state.error?.message}</p>
          <p><strong>Stack:</strong> {this.state.error?.stack}</p>
          <button 
            onClick={() => window.location.reload()}
            style={{
              padding: '10px 20px',
              backgroundColor: 'white',
              color: '#ff6b6b',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            🔄 Перезагрузить
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default function App() {
  useEffect(() => {
    console.log('🚀 App запущен');
    console.log('🔧 Platform:', Platform.OS);
    console.log('🌐 User Agent:', navigator?.userAgent || 'N/A');
    
    // Глобальная обработка ошибок
    const handleError = (event: ErrorEvent) => {
      console.error('🚨 Глобальная ошибка JavaScript:', event.error);
      console.error('🚨 Файл:', event.filename, 'Строка:', event.lineno);
    };

    const handlePromiseRejection = (event: PromiseRejectionEvent) => {
      console.error('🚨 Необработанное отклонение Promise:', event.reason);
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

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AppNavigator />
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
