import { useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { useTaskWrapperStore } from '../stores/taskWrapperStore';
import { useUserStore } from '../stores/userStore';

export const useTaskWrapperSync = () => {
  const { refreshTaskWrappers, taskWrappers } = useTaskWrapperStore();
  const { isAuthenticated } = useUserStore();
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    // Обновляем TaskWrapper'ы при первом рендере, если пользователь авторизован
    if (isAuthenticated() && taskWrappers.length === 0) {
      console.log('🔄 useTaskWrapperSync: Первоначальная загрузка TaskWrapper\'ов');
      refreshTaskWrappers();
    }
  }, [isAuthenticated, taskWrappers.length, refreshTaskWrappers]);

  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      console.log('📱 useTaskWrapperSync: Изменение состояния приложения:', appState.current, '->', nextAppState);
      
      // Если приложение стало активным после бездействия
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        if (isAuthenticated()) {
          console.log('🔄 useTaskWrapperSync: Обновляем TaskWrapper\'ы после возврата в приложение');
          refreshTaskWrappers();
        }
      }
      
      appState.current = nextAppState;
    };

    // Подписываемся на изменения состояния приложения
    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription?.remove();
    };
  }, [isAuthenticated, refreshTaskWrappers]);

  return {
    refreshTaskWrappers,
  };
}; 