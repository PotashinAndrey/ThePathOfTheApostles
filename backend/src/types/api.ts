// Типы данных для API responses
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
  totalTasksCompleted: number;
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
  isActive?: boolean;
  progress: number; // 0-100%
  totalChallenges: number;
  completedChallenges: number;
  challenges: ChallengeInfo[];
}

export interface ChallengeInfo {
  id: string;
  name: string;
  description?: string;
  apostle: ApostleResponse;
  totalTasks: number;
  completedTasks: number;
  isCompleted: boolean;
  isActive: boolean;
  tasks: TaskWrapperInfo[];
}

export interface TaskWrapperInfo {
  id: string;
  challengeId: string;
  task: TaskInfo;
  icon?: string;
  order: number;
  apostle?: ApostleResponse; // Может переопределять апостола испытания
  isCompleted: boolean;
  isActive: boolean;
}

export interface TaskInfo {
  id: string;
  name: string;
  description: string;
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
  tasksCompleted: number;
  pathsCompleted: number;
  currentPath?: PathInfo;
  activePaths: PathInfo[];
  completedPaths: PathInfo[];
  activeTaskWrappers: TaskWrapperInfo[];
}

export interface UserMetaResponse {
  id: string;
  completedTasks: string[]; // ID TaskWrapper
  activeTasks: string[]; // ID TaskWrapper
  userChatsList: string[];
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

export interface CompleteTaskWrapperRequest {
  content: string;
  result?: string;
}

export interface StartPathRequest {
  pathId: string;
}

export interface ActivateTaskWrapperRequest {
  taskWrapperId: string;
}

// Path progress types
export interface PathProgressResponse {
  pathId: string;
  currentChallengeId?: string;
  currentTaskWrapperId?: string;
  canAdvance: boolean; // Можно ли перейти к следующему заданию
  completionPercentage: number;
}

export interface NextTaskResponse {
  hasNext: boolean;
  nextTaskWrapper?: TaskWrapperInfo;
  nextChallenge?: ChallengeInfo;
  pathCompleted?: boolean;
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

// DEPRECATED: старые типы для ежедневных заданий (будут удалены)
// export interface DailyTaskInfo {
//   id: string;
//   name: string;
//   description: string;
//   apostleId: string;
//   apostle: ApostleResponse;
//   dayNumber: number;
//   status: 'pending' | 'active' | 'completed' | 'skipped';
//   createdAt: Date;
//   activatedAt?: Date;
//   completedAt?: Date;
//   motivationalPhrase: string;
// }

// export interface ActiveTaskResponse {
//   hasActiveTask: boolean;
//   currentTask?: DailyTaskInfo;
//   nextTask?: DailyTaskInfo;
//   apostleProgress: {
//     apostleId: string;
//     currentDay: number;
//     completedTasks: number;
//     totalTasks: number;
//   };
// }

// export interface CompleteDailyTaskRequest {
//   content?: string;
//   notes?: string;
// }

// export interface SkipDailyTaskRequest {
//   reason?: string;
// } 