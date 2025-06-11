import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Web-совместимый storage адаптер
export const storage = {
  getItem: async (key: string): Promise<string | null> => {
    console.log('📦 storage.getItem вызван:', key, 'Platform:', Platform.OS);
    
    try {
      if (Platform.OS === 'web') {
        console.log('🌐 Используем localStorage для web');
        const item = localStorage.getItem(key);
        console.log('🌐 localStorage.getItem результат:', item);
        return item;
      } else {
        console.log('📱 Используем AsyncStorage для mobile');
        const item = await AsyncStorage.getItem(key);
        console.log('📱 AsyncStorage.getItem результат:', item);
        return item;
      }
    } catch (error) {
      console.error('❌ Ошибка storage.getItem:', error);
      return null;
    }
  },

  setItem: async (key: string, value: string): Promise<void> => {
    console.log('💾 storage.setItem вызван:', key, 'value length:', value.length, 'Platform:', Platform.OS);
    
    try {
      if (Platform.OS === 'web') {
        console.log('🌐 Сохраняем в localStorage');
        localStorage.setItem(key, value);
      } else {
        console.log('📱 Сохраняем в AsyncStorage');
        await AsyncStorage.setItem(key, value);
      }
      console.log('✅ storage.setItem успешно');
    } catch (error) {
      console.error('❌ Ошибка storage.setItem:', error);
    }
  },

  removeItem: async (key: string): Promise<void> => {
    console.log('🗑️ storage.removeItem вызван:', key, 'Platform:', Platform.OS);
    
    try {
      if (Platform.OS === 'web') {
        console.log('🌐 Удаляем из localStorage');
        localStorage.removeItem(key);
      } else {
        console.log('📱 Удаляем из AsyncStorage');
        await AsyncStorage.removeItem(key);
      }
      console.log('✅ storage.removeItem успешно');
    } catch (error) {
      console.error('❌ Ошибка storage.removeItem:', error);
    }
  },
}; 