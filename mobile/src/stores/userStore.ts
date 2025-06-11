import { create } from 'zustand';
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
  currentMission: Mission | null;
  missions: Mission[];
  totalDays: number;
  streak: number;
  setUser: (user: User) => void;
  setCurrentApostle: (apostle: Apostle) => void;
  setCurrentMission: (mission: Mission) => void;
  completeMission: (missionId: string) => void;
  addMission: (mission: Mission) => void;
  updateMissionProgress: (missionId: string, progress: number) => void;
  incrementStreak: () => void;
  resetStreak: () => void;
  logout: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  currentMission: null,
  missions: [],
  totalDays: 0,
  streak: 0,
  
  setUser: (user: User) =>
    set(() => ({ user })),
  
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
  
  logout: () =>
    set(() => ({
      user: null,
      currentMission: null,
      missions: [],
      totalDays: 0,
      streak: 0,
    })),
}));

export type { User, Mission }; 