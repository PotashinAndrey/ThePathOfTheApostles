import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { storage } from '../utils/storage';
import { Apostle } from '../constants/apostles';

interface User {
  id: string;
  email: string;
  name: string;
  currentApostle?: Apostle;
  joinDate: Date;
  lastActiveDate: Date;
}

interface Mission {
  id: string;
  title: string;
  description: string;
  apostleId: string;
  startDate: Date;
  endDate: Date;
  isCompleted: boolean;
  progress: number; // 0-100
}

interface UserState {
  user: User | null;
  token: string | null; // JWT токен
  tokenExpiry: number | null; // Время истечения токена (timestamp)
  currentMission: Mission | null;
  missions: Mission[];
  totalDays: number;
  streak: number;
  isLoading: boolean; // Состояние загрузки авторизации
  setUser: (user: User, token?: string) => void;
  setToken: (token: string, expiryHours?: number) => void;
  setCurrentApostle: (apostle: Apostle) => void;
  setCurrentMission: (mission: Mission) => void;
  completeMission: (missionId: string) => void;
  addMission: (mission: Mission) => void;
  updateMissionProgress: (missionId: string, progress: number) => void;
  incrementStreak: () => void;
  resetStreak: () => void;
  logout: () => void;
  checkTokenExpiry: () => boolean;
  isAuthenticated: () => boolean;
  setLoading: (loading: boolean) => void;
}

// Декодируем JWT токен для получения времени истечения
const decodeJWT = (token: string): { exp?: number } => {
  try {
    const payload = token.split('.')[1];
    const decoded = JSON.parse(atob(payload));
    return decoded;
  } catch (error) {
    console.error('❌ Ошибка декодирования JWT:', error);
    return {};
  }
};

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      tokenExpiry: null,
      currentMission: null,
      missions: [],
      totalDays: 0,
      streak: 0,
      isLoading: false,
      
      setUser: (user: User, token?: string) => {
        console.log('💾 Сохраняем пользователя в store:', user);
        console.log('🎫 Токен предоставлен:', !!token);
        
        let tokenExpiry = null;
        if (token) {
          const decoded = decodeJWT(token);
          tokenExpiry = decoded.exp ? decoded.exp * 1000 : null; // Конвертируем в миллисекунды
          console.log('⏰ Токен истекает:', tokenExpiry ? new Date(tokenExpiry) : 'неизвестно');
        }
        
        set(() => ({ 
          user,
          ...(token && { token, tokenExpiry }),
          isLoading: false
        }));
      },

      setToken: (token: string, expiryHours = 24) => {
        console.log('🎫 Сохраняем токен в store');
        const decoded = decodeJWT(token);
        const tokenExpiry = decoded.exp 
          ? decoded.exp * 1000 // Используем время из JWT
          : Date.now() + (expiryHours * 60 * 60 * 1000); // Или устанавливаем свое
        
        console.log('⏰ Токен истекает:', new Date(tokenExpiry));
        set(() => ({ token, tokenExpiry }));
      },

      setLoading: (loading: boolean) => {
        set(() => ({ isLoading: loading }));
      },
      
      setCurrentApostle: (apostle: Apostle) =>
        set((state) => ({
          user: state.user ? { ...state.user, currentApostle: apostle } : null,
        })),
      
      setCurrentMission: (mission: Mission) =>
        set(() => ({ currentMission: mission })),
      
      completeMission: (missionId: string) =>
        set((state) => ({
          missions: state.missions.map((mission) =>
            mission.id === missionId
              ? { ...mission, isCompleted: true, progress: 100 }
              : mission
          ),
          currentMission:
            state.currentMission?.id === missionId
              ? { ...state.currentMission, isCompleted: true, progress: 100 }
              : state.currentMission,
        })),
      
      addMission: (mission: Mission) =>
        set((state) => ({
          missions: [...state.missions, mission],
        })),
      
      updateMissionProgress: (missionId: string, progress: number) =>
        set((state) => ({
          missions: state.missions.map((mission) =>
            mission.id === missionId ? { ...mission, progress } : mission
          ),
          currentMission:
            state.currentMission?.id === missionId
              ? { ...state.currentMission, progress }
              : state.currentMission,
        })),
      
      incrementStreak: () =>
        set((state) => ({
          streak: state.streak + 1,
          totalDays: state.totalDays + 1,
        })),
      
      resetStreak: () =>
        set(() => ({ streak: 0 })),
      
      logout: () => {
        console.log('🚪 Выход пользователя из системы');
        set(() => ({
          user: null,
          token: null,
          tokenExpiry: null,
          currentMission: null,
          missions: [],
          totalDays: 0,
          streak: 0,
          isLoading: false,
        }));
      },

      checkTokenExpiry: () => {
        const state = get();
        if (!state.token || !state.tokenExpiry) {
          console.log('🔐 Нет токена или времени истечения');
          return false;
        }
        
        const now = Date.now();
        const isExpired = now >= state.tokenExpiry;
        
        if (isExpired) {
          console.log('⏰ Токен истек, выполняем автологаут');
          get().logout();
          return false;
        }
        
        // Предупреждение за 5 минут до истечения
        const timeToExpiry = state.tokenExpiry - now;
        const fiveMinutes = 5 * 60 * 1000;
        if (timeToExpiry <= fiveMinutes && timeToExpiry > 0) {
          console.warn('⚠️ Токен истекает через', Math.floor(timeToExpiry / 1000 / 60), 'минут');
        }
        
        return true;
      },

      isAuthenticated: () => {
        const state = get();
        const hasValidToken = !!state.token;
        const hasUser = !!state.user;
        const tokenNotExpired = state.checkTokenExpiry();
        
        const isAuth = hasValidToken && hasUser && tokenNotExpired;
        
        console.log('🔐 Проверка авторизации:', { 
          hasValidToken, 
          hasUser, 
          tokenNotExpired, 
          result: isAuth 
        });
        
        return isAuth;
      },
    }),
    {
      name: 'user-storage',
      storage: createJSONStorage(() => storage),
      // Исключаем isLoading из персистентного хранения
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        tokenExpiry: state.tokenExpiry,
        currentMission: state.currentMission,
        missions: state.missions,
        totalDays: state.totalDays,
        streak: state.streak,
      }),
    }
  )
);

export type { User, Mission }; 