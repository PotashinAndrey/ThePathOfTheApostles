import axios from 'axios';
import { CONFIG } from '../constants/config';
import { APOSTLES } from '../constants/apostles';
import { PETER_WEEKLY_MISSION, WeeklyTask } from '../constants/peterWeeklyTasks';

// Настройка базового URL для API
const API_BASE_URL = CONFIG.API_BASE_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Интерцепторы для обработки ошибок
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

// Типы для API
interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatRequest {
  apostleId: string;
  message: string;
  context?: string[];
  userId?: string;
  additionalContext?: string;
}

interface ChatResponse {
  message: string;
  apostleId: string;
  timestamp: string;
}

interface MissionRequest {
  apostleId: string;
  userId: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

interface MissionResponse {
  id: string;
  title: string;
  description: string;
  tasks: string[];
  duration: number; // дни
  apostleId: string;
}

// API функции с fallback на константы
export const chatAPI = {
  sendMessage: async (request: ChatRequest): Promise<ChatResponse> => {
    if (CONFIG.USE_OFFLINE_MODE) {
      // Офлайн режим - генерируем ответ на основе константных данных
      const apostle = APOSTLES.find(a => a.id === request.apostleId);
      if (!apostle) throw new Error('Апостол не найден');
      
      // Простой ответ на основе ключевых слов
      let response = apostle.welcomeMessage || 'Я здесь, чтобы помочь тебе на пути.';
      
      if (request.message.toLowerCase().includes('лень') || request.message.toLowerCase().includes('слаб')) {
        response = "Слабость - это выбор. Каждое утро ты выбираешь: быть камнем или песком. Что выберешь сегодня?";
      } else if (request.message.toLowerCase().includes('дисциплин') || request.message.toLowerCase().includes('привычк')) {
        response = "Дисциплина - это фундамент. Построй её по кирпичику, день за днем. Начни с малого, но начни сегодня.";
      } else if (request.message.toLowerCase().includes('помо') || request.message.toLowerCase().includes('сове')) {
        response = "Мой совет прост: делай то, что должен делать, а не то, что хочется. Сила в постоянстве, а не в порывах.";
      }
      
      return {
        message: response,
        apostleId: request.apostleId,
        timestamp: new Date().toISOString()
      };
    }
    
    try {
      const response = await api.post('/chat', request);
      return response.data;
    } catch (error) {
      console.warn('API недоступен, используем офлайн режим');
      // Recursive call but с флагом offline
      const originalMode = CONFIG.USE_OFFLINE_MODE;
      CONFIG.USE_OFFLINE_MODE = true;
      const result = await chatAPI.sendMessage(request);
      CONFIG.USE_OFFLINE_MODE = originalMode;
      return result;
    }
  },
};

export const missionAPI = {
  generateMission: async (request: MissionRequest): Promise<MissionResponse> => {
    if (CONFIG.USE_OFFLINE_MODE) {
      // Офлайн режим - возвращаем статические задания
      return {
        id: `mission-${Date.now()}`,
        title: "Неделя Камня - Путь Петра",
        description: "7-дневное путешествие к дисциплине и стойкости под руководством Петра Нерушимого",
        tasks: [
          "День 1: Клятва самому себе",
          "День 2: Утренняя дисциплина", 
          "День 3: Укрощение хаоса",
          "День 4: Испытание стойкости",
          "День 5: Молчание силы",
          "День 6: Работа с неудачей",
          "День 7: Обет на будущее"
        ],
        duration: 7,
        apostleId: request.apostleId
      };
    }
    
    try {
      const response = await api.post('/missions/generate', request);
      return response.data;
    } catch (error) {
      console.warn('API недоступен, используем офлайн режим');
      const originalMode = CONFIG.USE_OFFLINE_MODE;
      CONFIG.USE_OFFLINE_MODE = true;
      const result = await missionAPI.generateMission(request);
      CONFIG.USE_OFFLINE_MODE = originalMode;
      return result;
    }
  },
  
  getMissions: async (userId: string) => {
    if (CONFIG.USE_OFFLINE_MODE) {
      return [];
    }
    
    try {
      const response = await api.get(`/missions/${userId}`);
      return response.data;
    } catch (error) {
      console.warn('API недоступен');
      return [];
    }
  },
  
  updateMissionProgress: async (missionId: string, progress: number) => {
    if (CONFIG.USE_OFFLINE_MODE) {
      console.log(`Прогресс миссии ${missionId}: ${progress}%`);
      return { success: true };
    }
    
    try {
      const response = await api.patch(`/missions/${missionId}`, { progress });
      return response.data;
    } catch (error) {
      console.warn('API недоступен');
      return { success: false };
    }
  },
};

export const userAPI = {
  getProfile: async (userId: string) => {
    if (CONFIG.USE_OFFLINE_MODE) {
      return {
        id: userId,
        name: 'Путешественник',
        email: 'test@example.com',
        currentApostleId: 'peter',
        streak: 0,
        totalDays: 0
      };
    }
    
    try {
      const response = await api.get(`/users/${userId}`);
      return response.data;
    } catch (error) {
      console.warn('API недоступен');
      return null;
    }
  },
  
  updateProfile: async (userId: string, data: any) => {
    if (CONFIG.USE_OFFLINE_MODE) {
      console.log(`Профиль ${userId} обновлен:`, data);
      return { success: true };
    }
    
    try {
      const response = await api.patch(`/users/${userId}`, data);
      return response.data;
    } catch (error) {
      console.warn('API недоступен');
      return { success: false };
    }
  },
  
  getStats: async (userId: string) => {
    if (CONFIG.USE_OFFLINE_MODE) {
      return {
        totalMissions: 1,
        completedMissions: 0,
        averageProgress: 0,
        longestStreak: 0
      };
    }
    
    try {
      const response = await api.get(`/users/${userId}/stats`);
      return response.data;
    } catch (error) {
      console.warn('API недоступен');
      return null;
    }
  },
};

export const apostleAPI = {
  getApostles: async () => {
    if (CONFIG.USE_OFFLINE_MODE) {
      return APOSTLES;
    }
    
    try {
      const response = await api.get('/apostles');
      return response.data;
    } catch (error) {
      console.warn('API недоступен, используем локальные данные');
      return APOSTLES;
    }
  },
  
  getApostle: async (apostleId: string) => {
    if (CONFIG.USE_OFFLINE_MODE) {
      return APOSTLES.find(a => a.id === apostleId) || null;
    }
    
    try {
      const response = await api.get(`/apostles/${apostleId}`);
      return response.data;
    } catch (error) {
      console.warn('API недоступен, используем локальные данные');
      return APOSTLES.find(a => a.id === apostleId) || null;
    }
  },

  getWeeklyTasks: async (apostleId: string): Promise<WeeklyTask[]> => {
    if (CONFIG.USE_OFFLINE_MODE) {
      if (apostleId === 'peter') {
        return PETER_WEEKLY_MISSION.tasks;
      }
      return [];
    }
    
    try {
      const response = await api.get(`/apostles/${apostleId}/weekly-tasks`);
      return response.data;
    } catch (error) {
      console.warn('API недоступен, используем локальные данные');
      if (apostleId === 'peter') {
        return PETER_WEEKLY_MISSION.tasks;
      }
      return [];
    }
  },
};

export type { ChatMessage, ChatRequest, ChatResponse, MissionRequest, MissionResponse, WeeklyTask }; 