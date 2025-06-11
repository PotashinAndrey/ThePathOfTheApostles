import AsyncStorage from '@react-native-async-storage/async-storage';
import { PETER_CONTEXT_TRIGGERS } from '../constants/peterWeeklyTasks';

export interface ChatContext {
  userId: string;
  apostleId: string;
  sessionId: string;
  messages: ContextMessage[];
  userProgress?: UserProgress;
  triggers?: string[];
  mood?: 'positive' | 'negative' | 'neutral';
  lastActivity: Date;
}

export interface ContextMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  emotion?: string;
  keywords?: string[];
}

export interface UserProgress {
  currentTask?: string;
  completedTasks: string[];
  streak: number;
  lastTaskDate?: Date;
  achievements: string[];
}

class ContextService {
  private contexts: Map<string, ChatContext> = new Map();
  
  // Получить или создать контекст для пользователя и апостола
  async getContext(userId: string, apostleId: string): Promise<ChatContext> {
    const contextKey = `${userId}_${apostleId}`;
    
    // Проверяем кэш
    if (this.contexts.has(contextKey)) {
      return this.contexts.get(contextKey)!;
    }
    
    // Загружаем из AsyncStorage
    try {
      const storedContext = await AsyncStorage.getItem(`context_${contextKey}`);
      if (storedContext) {
        const context = JSON.parse(storedContext);
        // Конвертируем строки дат обратно в Date объекты
        context.lastActivity = new Date(context.lastActivity);
        context.messages = context.messages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));
        
        this.contexts.set(contextKey, context);
        return context;
      }
    } catch (error) {
      console.error('Error loading context:', error);
    }
    
    // Создаем новый контекст
    const newContext: ChatContext = {
      userId,
      apostleId,
      sessionId: this.generateSessionId(),
      messages: [],
      triggers: [],
      mood: 'neutral',
      lastActivity: new Date()
    };
    
    this.contexts.set(contextKey, newContext);
    await this.saveContext(newContext);
    
    return newContext;
  }
  
  // Добавить сообщение в контекст
  async addMessage(
    userId: string, 
    apostleId: string, 
    message: ContextMessage,
    additionalContext?: string
  ): Promise<ChatContext> {
    const context = await this.getContext(userId, apostleId);
    
    // Анализируем сообщение пользователя для триггеров
    if (message.role === 'user') {
      const triggers = this.analyzeMessageTriggers(message.content, apostleId);
      context.triggers = triggers;
      context.mood = this.analyzeMood(message.content);
      
      // Обновляем ключевые слова
      message.keywords = this.extractKeywords(message.content);
    }
    
    // Добавляем дополнительный контекст если есть
    if (additionalContext && message.role === 'user') {
      message.content += `\n\n[Контекст от приложения: ${additionalContext}]`;
    }
    
    context.messages.push(message);
    context.lastActivity = new Date();
    
    // Ограничиваем историю последними 20 сообщениями
    if (context.messages.length > 20) {
      context.messages = context.messages.slice(-20);
    }
    
    await this.saveContext(context);
    return context;
  }
  
  // Получить контекст для отправки AI
  getAIContext(context: ChatContext): string {
    const recentMessages = context.messages.slice(-6); // Последние 6 сообщений
    
    let contextString = '';
    
    // Добавляем информацию о прогрессе пользователя
    if (context.userProgress) {
      contextString += `[Прогресс пользователя: выполнено задач ${context.userProgress.completedTasks.length}, текущая серия дней ${context.userProgress.streak}]\n`;
    }
    
    // Добавляем информацию о настроении
    if (context.mood && context.mood !== 'neutral') {
      contextString += `[Настроение пользователя: ${context.mood}]\n`;
    }
    
    // Добавляем активные триггеры
    if (context.triggers && context.triggers.length > 0) {
      contextString += `[Контекст реакции: ${context.triggers.join(', ')}]\n`;
    }
    
    // Добавляем историю сообщений
    contextString += '\nИстория диалога:\n';
    recentMessages.forEach(msg => {
      const role = msg.role === 'user' ? 'Пользователь' : 'Ты';
      contextString += `${role}: ${msg.content}\n`;
    });
    
    return contextString;
  }
  
  // Обновить прогресс пользователя
  async updateUserProgress(
    userId: string, 
    apostleId: string, 
    progress: Partial<UserProgress>
  ): Promise<void> {
    const context = await this.getContext(userId, apostleId);
    context.userProgress = { 
      completedTasks: [],
      streak: 0,
      achievements: [],
      ...context.userProgress, 
      ...progress 
    };
    await this.saveContext(context);
  }
  
  // Анализировать триггеры в сообщении
  private analyzeMessageTriggers(message: string, apostleId: string): string[] {
    const triggers: string[] = [];
    const lowerMessage = message.toLowerCase();
    
    if (apostleId === 'peter') {
      Object.entries(PETER_CONTEXT_TRIGGERS).forEach(([triggerType, config]) => {
        if (config.keywords.some(keyword => lowerMessage.includes(keyword))) {
          triggers.push(config.response_context);
        }
      });
    }
    
    return triggers;
  }
  
  // Анализировать настроение сообщения
  private analyzeMood(message: string): 'positive' | 'negative' | 'neutral' {
    const lowerMessage = message.toLowerCase();
    
    const positiveWords = ['хорошо', 'отлично', 'получилось', 'удалось', 'рад', 'счастлив', 'благодарен'];
    const negativeWords = ['плохо', 'грустно', 'не получилось', 'сложно', 'устал', 'расстроен', 'злой'];
    
    const positiveCount = positiveWords.filter(word => lowerMessage.includes(word)).length;
    const negativeCount = negativeWords.filter(word => lowerMessage.includes(word)).length;
    
    if (positiveCount > negativeCount) return 'positive';
    if (negativeCount > positiveCount) return 'negative';
    return 'neutral';
  }
  
  // Извлечь ключевые слова
  private extractKeywords(message: string): string[] {
    const words = message.toLowerCase().split(/\s+/);
    const keywords = words.filter(word => 
      word.length > 3 && 
      !['что', 'как', 'где', 'когда', 'почему', 'это', 'все', 'для', 'при'].includes(word)
    );
    
    return [...new Set(keywords)].slice(0, 5); // Уникальные, максимум 5
  }
  
  // Сохранить контекст
  private async saveContext(context: ChatContext): Promise<void> {
    const contextKey = `${context.userId}_${context.apostleId}`;
    try {
      await AsyncStorage.setItem(`context_${contextKey}`, JSON.stringify(context));
      this.contexts.set(contextKey, context);
    } catch (error) {
      console.error('Error saving context:', error);
    }
  }
  
  // Генерировать ID сессии
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  // Очистить старые контексты (вызывать периодически)
  async clearOldContexts(daysOld: number = 30): Promise<void> {
    const cutoffDate = new Date(Date.now() - daysOld * 24 * 60 * 60 * 1000);
    
    for (const [key, context] of this.contexts.entries()) {
      if (context.lastActivity < cutoffDate) {
        this.contexts.delete(key);
        await AsyncStorage.removeItem(`context_${key}`);
      }
    }
  }
  
  // Получить статистику контекста
  getContextStats(context: ChatContext): {
    totalMessages: number;
    userMessages: number;
    assistantMessages: number;
    averageMessageLength: number;
    sessionDuration: number;
  } {
    const userMessages = context.messages.filter(m => m.role === 'user');
    const assistantMessages = context.messages.filter(m => m.role === 'assistant');
    const totalLength = context.messages.reduce((sum, m) => sum + m.content.length, 0);
    
    const sessionStart = context.messages[0]?.timestamp || context.lastActivity;
    const sessionDuration = context.lastActivity.getTime() - sessionStart.getTime();
    
    return {
      totalMessages: context.messages.length,
      userMessages: userMessages.length,
      assistantMessages: assistantMessages.length,
      averageMessageLength: totalLength / context.messages.length || 0,
      sessionDuration
    };
  }
}

export const contextService = new ContextService(); 