import { NextRequest } from 'next/server';
import { prisma } from './prisma';

export interface TokenPayload {
  userId: string;
  email: string;
  name: string;
  iat: number;
  exp: number;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  status: 'ACTIVE' | 'SUSPENDED' | 'DELETED';
}

// Простая проверка токена
export const verifySimpleToken = (token: string): TokenPayload | null => {
  console.log('🔍 Проверка простого токена...');
  
  try {
    // Декодируем из base64
    const decoded = Buffer.from(token, 'base64').toString('utf-8');
    const payload = JSON.parse(decoded) as TokenPayload;
    
    // Проверяем срок действия
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp < now) {
      console.error('❌ Токен истек');
      return null;
    }
    
    console.log('✅ Токен валидный для пользователя:', payload.email);
    return payload;
  } catch (error) {
    console.error('❌ Невалидный токен:', error);
    return null;
  }
};

// Извлечение токена из заголовков
export const extractTokenFromRequest = (request: NextRequest): string | null => {
  const authHeader = request.headers.get('Authorization');
  
  if (!authHeader) {
    console.log('📭 Заголовок Authorization отсутствует');
    return null;
  }
  
  if (!authHeader.startsWith('Bearer ')) {
    console.log('❌ Неверный формат заголовка Authorization');
    return null;
  }
  
  const token = authHeader.substring(7); // Убираем "Bearer "
  console.log('🎫 Токен извлечен из заголовка');
  return token;
};

// Middleware для проверки авторизации
export const requireAuth = async (request: NextRequest): Promise<AuthUser | null> => {
  console.log('🔐 Проверка авторизации...');
  
  const token = extractTokenFromRequest(request);
  if (!token) {
    console.log('❌ Токен не найден');
    return null;
  }
  
  const payload = verifySimpleToken(token);
  if (!payload) {
    console.log('❌ Невалидный токен');
    return null;
  }
  
  // Проверяем что пользователь существует в базе данных
  console.log('👤 Проверка пользователя в БД:', payload.userId);
  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: {
      id: true,
      email: true,
      name: true,
      status: true
    }
  });
  
  if (!user || user.status !== 'ACTIVE') {
    console.log('❌ Пользователь не найден в БД или неактивен');
    return null;
  }
  
  // Обновляем lastActiveDate
  await prisma.user.update({
    where: { id: user.id },
    data: { lastActiveDate: new Date() }
  });
  
  console.log('✅ Пользователь авторизован:', user.email);
  return user;
}; 