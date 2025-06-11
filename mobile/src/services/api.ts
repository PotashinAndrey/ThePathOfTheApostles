import axios from 'axios';

// Настройка базового URL для API
const API_BASE_URL = __DEV__ 
  ? 'http://localhost:3000/api' 
  : 'https://your-production-url.com/api';

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

// API функции
export const chatAPI = {
  sendMessage: async (request: ChatRequest): Promise<ChatResponse> => {
    const response = await api.post('/chat', request);
    return response.data;
  },
};

export const missionAPI = {
  generateMission: async (request: MissionRequest): Promise<MissionResponse> => {
    const response = await api.post('/missions/generate', request);
    return response.data;
  },
  
  getMissions: async (userId: string) => {
    const response = await api.get(`/missions/${userId}`);
    return response.data;
  },
  
  updateMissionProgress: async (missionId: string, progress: number) => {
    const response = await api.patch(`/missions/${missionId}`, { progress });
    return response.data;
  },
};

export const userAPI = {
  getProfile: async (userId: string) => {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  },
  
  updateProfile: async (userId: string, data: any) => {
    const response = await api.patch(`/users/${userId}`, data);
    return response.data;
  },
  
  getStats: async (userId: string) => {
    const response = await api.get(`/users/${userId}/stats`);
    return response.data;
  },
};

export const apostleAPI = {
  getApostles: async () => {
    const response = await api.get('/apostles');
    return response.data;
  },
  
  getApostle: async (apostleId: string) => {
    const response = await api.get(`/apostles/${apostleId}`);
    return response.data;
  },
};

export type { ChatMessage, ChatRequest, ChatResponse, MissionRequest, MissionResponse }; 