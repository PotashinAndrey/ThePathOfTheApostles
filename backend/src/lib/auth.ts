import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';
import { prisma } from './prisma';

// Секретный ключ для JWT (в продакшене должен быть в переменных окружения)
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-jwt-secret-for-development';
const JWT_EXPIRES_IN = '7d';

// Интерфейсы
export interface JWTPayload {
  userId: string;
  email: string;
  name: string;
  iat?: number;
  exp?: number;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  status: 'ACTIVE' | 'SUSPENDED' | 'DELETED';
}

// Генерация соли и хеширование пароля
export const hashPassword = async (password: string): Promise<{ hash: string; salt: string }> => {
  console.log('🔐 Хеширование пароля...');
  
  // Генерируем соль
  const salt = await bcrypt.genSalt(12);
  console.log('🧂 Соль сгенерирована');
  
  // Хешируем пароль с солью
  const hash = await bcrypt.hash(password, salt);
  console.log('✅ Пароль захеширован');
  
  return { hash, salt };
};

// Проверка пароля
export const verifyPassword = async (
  password: string, 
  hash: string, 
  salt: string
): Promise<boolean> => {
  console.log('🔍 Проверка пароля...');
  
  try {
    // Хешируем введенный пароль с той же солью
    const hashedInput = await bcrypt.hash(password, salt);
    const isValid = hashedInput === hash;
    
    console.log('✅ Пароль', isValid ? 'верный' : 'неверный');
    return isValid;
  } catch (error) {
    console.error('❌ Ошибка проверки пароля:', error);
    return false;
  }
};

// Генерация JWT токена
export function generateToken(user: { id: string; email: string; name: string }): string {
  const payload: JWTPayload = {
    userId: user.id,
    email: user.email,
    name: user.name,
  };
  
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

// Верификация JWT токена
export function verifyToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    return decoded;
  } catch (error) {
    console.error('JWT verification failed:', error);
    return null;
  }
}

// Извлечение токена из запроса
export function extractToken(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization');
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  
  return null;
}

// Проверка авторизации пользователя
export async function requireAuth(request: NextRequest): Promise<AuthUser | null> {
  try {
    const token = extractToken(request);
    
    if (!token) {
      console.log('❌ No token provided');
      return null;
    }

    const payload = verifyToken(token);
    
    if (!payload) {
      console.log('❌ Invalid token');
      return null;
    }

    // Проверяем существование пользователя в БД
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        name: true,
        status: true,
      }
    });

    if (!user || user.status !== 'ACTIVE') {
      console.log('❌ User not found or inactive');
      return null;
    }

    // Обновляем lastActiveDate
    await prisma.user.update({
      where: { id: user.id },
      data: { lastActiveDate: new Date() }
    });

    return user;
  } catch (error) {
    console.error('❌ Auth check failed:', error);
    return null;
  }
}

// Проверяем силу пароля
export function validatePassword(password: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (password.length < 6) {
    errors.push('Пароль должен содержать минимум 6 символов');
  }
  
  if (password.length > 128) {
    errors.push('Пароль не должен превышать 128 символов');
  }
  
  if (!/[a-zA-Z]/.test(password)) {
    errors.push('Пароль должен содержать хотя бы одну букву');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

// Валидация email
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 255;
}

// Создание пользователя с новой архитектурой
export async function createUserWithProgress(userData: {
  email: string;
  name: string;
  password: string;
}) {
  const { hash, salt } = await hashPassword(userData.password);
  
  // Транзакция для создания пользователя и связанных сущностей
  return await prisma.$transaction(async (tx) => {
    console.log('📝 Создание UserPathsList...');
    
    // Создаем UserPathsList для управления путями пользователя
    const userPaths = await tx.userPathsList.create({
      data: {
        userId: '', // Будет обновлено после создания пользователя
        activePathIds: [],
        completedPathIds: [],
      }
    });

    console.log('📝 Создание UserMeta...');
    
    // Создаем UserMeta для управления прогрессом пользователя
    const userMeta = await tx.userMeta.create({
      data: {
        completedTasks: [],     // ID выполненных TaskWrapper
        activeTasks: [],        // ID активных TaskWrapper  
        pathsId: userPaths.id,  // Ссылка на UserPathsList
        userChatsList: [],      // Список ID чатов пользователя
      }
    });

    console.log('📝 Создание пользователя...');
    
    // Создаем пользователя
    const user = await tx.user.create({
      data: {
        email: userData.email,
        name: userData.name,
        passwordHash: hash,
        salt: salt,
        status: 'ACTIVE',
        metaId: userMeta.id,    // Связь с UserMeta вместо UserProgress
        streak: 0,
        avatar: null,
        currentSubscription: 'basic', // Базовая подписка по умолчанию
      },
      select: {
        id: true,
        email: true,
        name: true,
        joinDate: true,
        status: true,
      }
    });

    console.log('📝 Обновление userId в связанных сущностях...');
    
    // Обновляем userId в UserPathsList
    await tx.userPathsList.update({
      where: { id: userPaths.id },
      data: { userId: user.id }
    });

    console.log('✅ Пользователь и связанные сущности созданы успешно');
    
    return user;
  });
} 