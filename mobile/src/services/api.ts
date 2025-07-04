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
      if (!apostle) {
        throw new Error('Апостол не найден');
      }
      
      // Простой ответ на основе ключевых слов
      let response = apostle.welcomeMessage || 'Я здесь, чтобы помочь тебе на пути.';
      
      if (request.message.toLowerCase().includes('лень') || request.message.toLowerCase().includes('слаб')) {
        response = "Слабость - это выбор. Каждое утро ты выбираешь: быть камнем или песком. Что выберешь сегодня?";
      } else if (request.message.toLowerCase().includes('дисциплин') || request.message.toLowerCase().includes('привычк')) {
        response = "Дисциплина - это фундамент. Построй её по кирпичику, день за днем. Начни с малого, но начни сегодня.";
      } else if (request.message.toLowerCase().includes('помо') || request.message.toLowerCase().includes('сове')) {
        response = "Мой совет прост: делай то, что должен делать, а не то, что хочется. Сила в постоянстве, а не в порывах.";
      }
      
      const result = {
        message: response,
        apostleId: request.apostleId,
        timestamp: new Date().toISOString()
      };
      
      return result;
    }
    
    try {
      const response = await api.post('/chat', request);
      return response.data;
    } catch (error) {
      console.error('API запрос не удался:', error);
      // Recursive call но с флагом offline
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

export const createOrUpdateUser = async (user: {
  id: string;
  email: string;
  name: string;
  currentApostleId?: string;
}) => {
  
  try {
    const response = await fetch(`${API_BASE_URL}/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: user.id,
        email: user.email,
        name: user.name,
        currentApostleId: user.currentApostleId,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('API Error в createOrUpdateUser:', error);
    throw error;
  }
};

export const getUser = async (userId: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/users?id=${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('API Error в getUser:', error);
    throw error;
  }
};

export type { ChatMessage, ChatRequest, ChatResponse, MissionRequest, MissionResponse, WeeklyTask };

// Новые функции для авторизации
export const authAPI = {
  register: async (email: string, password: string, name: string) => {
    
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, name }),
      });

      console.log('📡 API Response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ API Error response:', errorData);
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ API: Пользователь зарегистрирован:', data);
      return data;
    } catch (error) {
      console.error('❌ API Error в register:', error);
      throw error;
    }
  },

  login: async (email: string, password: string) => {
    
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      console.log('📡 API Response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ API Error response:', errorData);
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ API: Пользователь авторизован:', data);
      return data;
    } catch (error) {
      console.error('❌ API Error в login:', error);
      throw error;
    }
  },
};

// Обновляем chatAPI для работы с токенами
export const chatAPIWithAuth = {
  sendMessage: async (request: ChatRequest, token?: string): Promise<ChatResponse> => {
    console.log('🌐 chatAPIWithAuth.sendMessage вызвана с параметрами:', request);
    console.log('🔧 CONFIG.USE_OFFLINE_MODE:', CONFIG.USE_OFFLINE_MODE);
    console.log('🎫 Токен предоставлен:', !!token);
    
    if (CONFIG.USE_OFFLINE_MODE) {
      console.log('📴 Работаем в офлайн режиме');
      // Используем старую логику офлайн режима
      return chatAPI.sendMessage(request);
    }
    
    console.log('🌐 Отправляем запрос к серверу с авторизацией');
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          apostleId: request.apostleId,
          message: request.message,
          context: request.context,
          additionalContext: request.additionalContext,
          // Не передаем userId - он будет извлечен из токена
        }),
      });
      
      console.log('📥 Получен ответ от сервера, статус:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ API Error response:', errorData);
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('📥 Данные ответа:', data);
      
      return data;
    } catch (error) {
      console.error('❌ Ошибка API запроса:', error);
      console.error('❌ Детали ошибки API:', {
        message: (error as any)?.message,
        status: (error as any)?.response?.status,
        statusText: (error as any)?.response?.statusText,
      });
      
      console.warn('🔄 API недоступен, переключаемся на офлайн режим');
      // Fallback на офлайн режим
      const originalMode = CONFIG.USE_OFFLINE_MODE;
      CONFIG.USE_OFFLINE_MODE = true;
      const result = await chatAPI.sendMessage(request);
      CONFIG.USE_OFFLINE_MODE = originalMode;
      return result;
    }
  },
};

 