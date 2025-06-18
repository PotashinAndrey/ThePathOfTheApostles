import AsyncStorage from '@react-native-async-storage/async-storage';
import { CONFIG } from '../constants/config';
import {
  ApiResponse,
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  UserResponse,
  UserProfileResponse,
  UserStatsResponse,
  ApostleResponse,
  ChatInfo,
  ChatMessageInfo,
  ChatRequest,
  ChatResponse,
  SendMessageRequest,
  ChallengeInfo,
  PathInfo,
  Achievement,
  NotificationInfo,
  SubscriptionInfo,
  UpdateProfileRequest,
  ChangePasswordRequest,
  DailyTaskInfo,
  ActiveTaskResponse,
  CompleteDailyTaskRequest,
  SkipDailyTaskRequest
} from '../types/api';

const API_BASE_URL = CONFIG.API_BASE_URL;

class ApiService {
  private token: string | null = null;

  constructor() {
    this.loadToken();
  }

  private async loadToken() {
    try {
      this.token = await AsyncStorage.getItem('auth_token');
    } catch (error) {
      console.error('Ошибка загрузки токена:', error);
    }
  }

  private async saveToken(token: string) {
    try {
      this.token = token;
      await AsyncStorage.setItem('auth_token', token);
    } catch (error) {
      console.error('Ошибка сохранения токена:', error);
    }
  }

  private async removeToken() {
    try {
      this.token = null;
      await AsyncStorage.removeItem('auth_token');
    } catch (error) {
      console.error('Ошибка удаления токена:', error);
    }
  }

  private getHeaders(includeAuth: boolean = true): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (includeAuth && this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    includeAuth: boolean = true
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const config: RequestInit = {
      ...options,
      headers: {
        ...this.getHeaders(includeAuth),
        ...options.headers,
      },
    };

    console.log(`🌐 API Request: ${config.method || 'GET'} ${url}`);
    
    try {
      const response = await fetch(url, config);
      
      // Сначала проверяем статус ответа
      if (!response.ok) {
        console.error(`❌ API Error ${response.status}: ${response.statusText}`);
        
        // Пытаемся получить текст ответа для более подробной информации
        let errorMessage = `HTTP ${response.status}`;
        try {
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const errorData = await response.json();
            errorMessage = errorData.error || errorData.message || errorMessage;
          } else {
            const errorText = await response.text();
            console.error('❌ API Error Response (HTML):', errorText.substring(0, 200));
            errorMessage = `${response.status} ${response.statusText}`;
          }
        } catch (parseError) {
          console.error('❌ Error parsing error response:', parseError);
        }
        
        // Специальная обработка различных статусов
        if (response.status === 429) {
          console.warn('🚨 Rate limit exceeded');
          // errorMessage уже содержит сообщение от сервера
        } else if (response.status === 401) {
          console.warn('🔐 Unauthorized - invalid credentials');
          // Сохраняем сообщение сервера для правильной обработки
        } else if (response.status >= 500) {
          errorMessage = 'Проблема на сервере. Попробуйте позже';
        }
        
        throw new Error(errorMessage);
      }

      // Только если ответ успешный, парсим JSON
      const data = await response.json();
      console.log(`✅ API Success: ${endpoint}`);
      return data;
      
    } catch (error) {
      console.error(`❌ API Request failed: ${endpoint}`, error);
      throw error;
    }
  }

  // Auth API
  async register(request: RegisterRequest): Promise<AuthResponse> {
    const response = await this.request<ApiResponse<AuthResponse>>(
      '/auth/register',
      {
        method: 'POST',
        body: JSON.stringify(request),
      },
      false
    );

    if (response.success && response.data) {
      await this.saveToken(response.data.token);
      return response.data;
    } else {
      throw new Error(response.error || 'Ошибка регистрации');
    }
  }

  async login(request: LoginRequest): Promise<AuthResponse> {
    const response = await this.request<ApiResponse<AuthResponse>>(
      '/auth/login',
      {
        method: 'POST',
        body: JSON.stringify(request),
      },
      false
    );

    if (response.success && response.data) {
      await this.saveToken(response.data.token);
      return response.data;
    } else {
      throw new Error(response.error || 'Ошибка входа');
    }
  }

  async logout(): Promise<void> {
    await this.removeToken();
  }

  // User API
  async getUserProfile(): Promise<UserProfileResponse> {
    const response = await this.request<ApiResponse<UserProfileResponse>>('/user/profile');
    
    if (response.success && response.data) {
      return response.data;
    } else {
      throw new Error(response.error || 'Ошибка получения профиля');
    }
  }

  async updateUserProfile(request: UpdateProfileRequest): Promise<UserProfileResponse> {
    const response = await this.request<ApiResponse<UserProfileResponse>>(
      '/user/profile',
      {
        method: 'PUT',
        body: JSON.stringify(request),
      }
    );

    if (response.success && response.data) {
      return response.data;
    } else {
      throw new Error(response.error || 'Ошибка обновления профиля');
    }
  }

  async getUserStats(): Promise<UserStatsResponse> {
    const response = await this.request<ApiResponse<UserStatsResponse>>('/user/stats');
    
    if (response.success && response.data) {
      return response.data;
    } else {
      throw new Error(response.error || 'Ошибка получения статистики');
    }
  }

  async changePassword(request: ChangePasswordRequest): Promise<void> {
    const response = await this.request<ApiResponse>(
      '/user/change-password',
      {
        method: 'POST',
        body: JSON.stringify(request),
      }
    );

    if (!response.success) {
      throw new Error(response.error || 'Ошибка смены пароля');
    }
  }

  // Apostles API
  async getApostles(): Promise<ApostleResponse[]> {
    const response = await this.request<ApiResponse<ApostleResponse[]>>('/apostles', {}, false);
    
    if (response.success && response.data) {
      return response.data;
    } else {
      throw new Error(response.error || 'Ошибка получения апостолов');
    }
  }

  async getApostle(id: string): Promise<ApostleResponse> {
    const response = await this.request<ApiResponse<ApostleResponse>>(`/apostles/${id}`, {}, false);
    
    if (response.success && response.data) {
      return response.data;
    } else {
      throw new Error(response.error || 'Ошибка получения апостола');
    }
  }

  // Chats API
  async getChats(): Promise<ChatInfo[]> {
    const response = await this.request<ApiResponse<ChatInfo[]>>('/chats');
    
    if (response.success && response.data) {
      return response.data;
    } else {
      throw new Error(response.error || 'Ошибка получения чатов');
    }
  }

  async createChat(apostleId: string, pathId?: string, challengeId?: string): Promise<ChatInfo> {
    const response = await this.request<ApiResponse<ChatInfo>>(
      '/chats',
      {
        method: 'POST',
        body: JSON.stringify({ apostleId, pathId, challengeId }),
      }
    );

    if (response.success && response.data) {
      return response.data;
    } else {
      throw new Error(response.error || 'Ошибка создания чата');
    }
  }

  async getChat(chatId: string, page: number = 1, limit: number = 10): Promise<{
    chat: ChatInfo;
    messages: ChatMessageInfo[];
    pagination: { page: number; limit: number; hasMore: boolean };
  }> {
    const response = await this.request<ApiResponse<any>>(
      `/chats/${chatId}?page=${page}&limit=${limit}`
    );
    
    if (response.success && response.data) {
      return response.data;
    } else {
      throw new Error(response.error || 'Ошибка получения чата');
    }
  }

  async sendMessage(chatId: string, request: SendMessageRequest): Promise<ChatMessageInfo> {
    const response = await this.request<ApiResponse<ChatMessageInfo>>(
      `/chats/${chatId}/messages`,
      {
        method: 'POST',
        body: JSON.stringify(request),
      }
    );

    if (response.success && response.data) {
      return response.data;
    } else {
      throw new Error(response.error || 'Ошибка отправки сообщения');
    }
  }

  // Legacy chat API для совместимости
  async sendChatMessage(request: ChatRequest): Promise<ChatResponse> {
    const response = await this.request<ChatResponse>(
      '/chat',
      {
        method: 'POST',
        body: JSON.stringify(request),
      }
    );

    return response;
  }

  // Challenges API
  async getChallenges(): Promise<ChallengeInfo[]> {
    const response = await this.request<ApiResponse<ChallengeInfo[]>>('/challenges');
    
    if (response.success && response.data) {
      return response.data;
    } else {
      throw new Error(response.error || 'Ошибка получения заданий');
    }
  }

  async getChallenge(id: string): Promise<ChallengeInfo> {
    const response = await this.request<ApiResponse<ChallengeInfo>>(`/challenges/${id}`);
    
    if (response.success && response.data) {
      return response.data;
    } else {
      throw new Error(response.error || 'Ошибка получения задания');
    }
  }

  async completeChallenge(id: string, content: string): Promise<void> {
    const response = await this.request<ApiResponse>(
      `/challenges/${id}/complete`,
      {
        method: 'POST',
        body: JSON.stringify({ content }),
      }
    );

    if (!response.success) {
      throw new Error(response.error || 'Ошибка завершения задания');
    }
  }

  // Paths API
  async getPaths(): Promise<PathInfo[]> {
    const response = await this.request<ApiResponse<PathInfo[]>>('/paths');
    
    if (response.success && response.data) {
      return response.data;
    } else {
      throw new Error(response.error || 'Ошибка получения путей');
    }
  }

  async getPath(id: string): Promise<PathInfo> {
    const response = await this.request<ApiResponse<PathInfo>>(`/paths/${id}`);
    
    if (response.success && response.data) {
      return response.data;
    } else {
      throw new Error(response.error || 'Ошибка получения пути');
    }
  }

  // Achievements API
  async getAchievements(): Promise<Achievement[]> {
    const response = await this.request<ApiResponse<Achievement[]>>('/achievements');
    
    if (response.success && response.data) {
      return response.data;
    } else {
      throw new Error(response.error || 'Ошибка получения достижений');
    }
  }

  async getUserAchievements(): Promise<Achievement[]> {
    const response = await this.request<ApiResponse<Achievement[]>>('/user/achievements');
    
    if (response.success && response.data) {
      return response.data;
    } else {
      throw new Error(response.error || 'Ошибка получения достижений пользователя');
    }
  }

  // Notifications API
  async getNotifications(): Promise<NotificationInfo[]> {
    const response = await this.request<ApiResponse<NotificationInfo[]>>('/notifications');
    
    if (response.success && response.data) {
      return response.data;
    } else {
      throw new Error(response.error || 'Ошибка получения уведомлений');
    }
  }

  async markNotificationAsRead(id: string): Promise<void> {
    const response = await this.request<ApiResponse>(
      `/notifications/${id}/read`,
      {
        method: 'PUT',
      }
    );

    if (!response.success) {
      throw new Error(response.error || 'Ошибка отметки уведомления');
    }
  }

  // Subscriptions API
  async getSubscriptions(): Promise<SubscriptionInfo[]> {
    const response = await this.request<ApiResponse<SubscriptionInfo[]>>('/subscriptions');
    
    if (response.success && response.data) {
      return response.data;
    } else {
      throw new Error(response.error || 'Ошибка получения планов подписки');
    }
  }

  async updateSubscription(subscriptionId: string): Promise<void> {
    const response = await this.request<ApiResponse>(
      '/user/subscription',
      {
        method: 'POST',
        body: JSON.stringify({ subscriptionId }),
      }
    );

    if (!response.success) {
      throw new Error(response.error || 'Ошибка обновления подписки');
    }
  }

  // Path Tasks API
  async getActiveTask(): Promise<ActiveTaskResponse> {
    const response = await this.request<ApiResponse<ActiveTaskResponse>>('/daily-tasks/active');
    
    if (response.success && response.data) {
      return response.data;
    } else {
      throw new Error(response.error || 'Ошибка получения активного задания');
    }
  }

  async getDailyTask(id: string): Promise<DailyTaskInfo> {
    const response = await this.request<ApiResponse<DailyTaskInfo>>(`/daily-tasks/${id}`);
    
    if (response.success && response.data) {
      return response.data;
    } else {
      throw new Error(response.error || 'Ошибка получения задания');
    }
  }

  async completeDailyTask(id: string, request: CompleteDailyTaskRequest = {}): Promise<void> {
    const response = await this.request<ApiResponse>(
      `/daily-tasks/${id}/complete`,
      {
        method: 'POST',
        body: JSON.stringify(request),
      }
    );

    if (!response.success) {
      throw new Error(response.error || 'Ошибка завершения задания');
    }
  }

  async skipDailyTask(id: string, request: SkipDailyTaskRequest = {}): Promise<void> {
    const response = await this.request<ApiResponse>(
      `/daily-tasks/${id}/skip`,
      {
        method: 'POST',
        body: JSON.stringify(request),
      }
    );

    if (!response.success) {
      throw new Error(response.error || 'Ошибка пропуска задания');
    }
  }

  async getApostleTasks(apostleId: string): Promise<DailyTaskInfo[]> {
    const response = await this.request<ApiResponse<DailyTaskInfo[]>>(`/apostles/${apostleId}/daily-tasks`);
    
    if (response.success && response.data) {
      return response.data;
    } else {
      throw new Error(response.error || 'Ошибка получения заданий апостола');
    }
  }

  // Utility methods
  isAuthenticated(): boolean {
    return !!this.token;
  }

  getToken(): string | null {
    return this.token;
  }
}

export const apiService = new ApiService();
export default apiService; 