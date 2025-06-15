// Типы данных для API responses - синхронизированы с backend/src/types/api.ts

export interface UserResponse {
  id: string;
  name: string;
  email: string;
  joinDate: Date;
  currentSubscription?: string;
  lastActiveDate: Date;
  streak: number;
  avatar?: string;
  status: 'ACTIVE' | 'SUSPENDED' | 'DELETED';
}

export interface UserProfileResponse extends UserResponse {
  totalChallengesCompleted: number;
  totalPathsCompleted: number;
  achievements: Achievement[];
  currentPath?: PathInfo;
}

export interface ApostleResponse {
  id: string;
  name: string;
  title: string;
  description: string;
  archetype: string;
  personality: string;
  icon: string;
  color: string;
  virtue?: SkillInfo;
}

export interface SkillInfo {
  id: string;
  name: string;
  description: string;
}

export interface PathInfo {
  id: string;
  name: string;
  description: string;
  icon?: string;
  progress: number; // 0-100%
  totalChallenges: number;
  completedChallenges: number;
  challenges: ChallengeInfo[];
}

export interface ChallengeInfo {
  id: string;
  name: string;
  description: string;
  icon?: string;
  apostle: ApostleResponse;
  isCompleted: boolean;
  isActive: boolean;
  order?: number;
}

export interface ChatInfo {
  id: string;
  name: string;
  apostle: ApostleResponse;
  lastMessage?: ChatMessageInfo;
  unreadCount: number;
  path?: PathInfo;
  currentChallenge?: ChallengeInfo;
}

export interface ChatMessageInfo {
  id: string;
  sender: 'USER' | 'APOSTLE';
  content: string;
  voiceUrl?: string;
  createdAt: Date;
  metadata?: any;
  relatedChallenge?: ChallengeInfo;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt?: Date;
}

export interface SubscriptionInfo {
  id: string;
  name: string;
  price: number;
  features: string[];
}

export interface NotificationInfo {
  id: string;
  title: string;
  message: string;
  type: 'CHALLENGE' | 'ACHIEVEMENT' | 'STREAK' | 'PATH' | 'GENERAL';
  isRead: boolean;
  createdAt: Date;
  relatedId?: string; // ID связанной сущности
}

export interface UserStatsResponse {
  streak: number;
  totalDays: number;
  challengesCompleted: number;
  pathsCompleted: number;
  currentPath?: PathInfo;
  activeChallenges: ChallengeInfo[];
}

// Request types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
}

export interface UpdateProfileRequest {
  name?: string;
  avatar?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface SendMessageRequest {
  content: string;
  voiceUrl?: string;
}

export interface CompleteChallengeRequest {
  content: string;
  result?: string;
}

// API Response wrapper
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Auth response
export interface AuthResponse {
  token: string;
  user: UserResponse;
  message: string;
}

// Chat response
export interface ChatResponse {
  success: boolean;
  data: {
    message: string;
    apostleId: string;
    chatId: string;
    timestamp: string;
  };
}

// Legacy types для совместимости
export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface ChatRequest {
  apostleId: string;
  message: string;
  context?: string[];
  additionalContext?: string;
  chatId?: string;
} 