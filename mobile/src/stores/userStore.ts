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
  currentMission: Mission | null;
  missions: Mission[];
  totalDays: number;
  streak: number;
  setUser: (user: User, token?: string) => void;
  setToken: (token: string) => void;
  setCurrentApostle: (apostle: Apostle) => void;
  setCurrentMission: (mission: Mission) => void;
  completeMission: (missionId: string) => void;
  addMission: (mission: Mission) => void;
  updateMissionProgress: (missionId: string, progress: number) => void;
  incrementStreak: () => void;
  resetStreak: () => void;
  logout: () => void;
  isAuthenticated: () => boolean;
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      currentMission: null,
      missions: [],
      totalDays: 0,
      streak: 0,
      
      setUser: (user: User, token?: string) => {
        console.log('💾 Сохраняем пользователя в store:', user);
        console.log('🎫 Токен предоставлен:', !!token);
        set(() => ({ 
          user,
          ...(token && { token })
        }));
      },

      setToken: (token: string) => {
        console.log('🎫 Сохраняем токен в store');
        set(() => ({ token }));
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
          currentMission: null,
          missions: [],
          totalDays: 0,
          streak: 0,
        }));
      },

      isAuthenticated: () => {
        const state = get();
        const hasValidToken = !!state.token;
        const hasUser = !!state.user;
        console.log('🔐 Проверка авторизации:', { hasValidToken, hasUser });
        return hasValidToken && hasUser;
      },
    }),
    {
      name: 'user-storage',
      storage: createJSONStorage(() => storage),
    }
  )
);

export type { User, Mission }; 