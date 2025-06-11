import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';
import { prisma } from './prisma';

// Секретный ключ для JWT (в продакшене должен быть в переменных окружения)
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// Интерфейсы
export interface JWTPayload {
  userId: string;
  email: string;
  name: string;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  currentApostleId?: string;
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
export const generateToken = (payload: JWTPayload): string => {
  console.log('🎫 Генерация JWT токена для пользователя:', payload.email);
  
  const token = jwt.sign(
    payload as object,
    JWT_SECRET,
    {
      expiresIn: JWT_EXPIRES_IN,
      issuer: 'apostles-app',
      audience: 'apostles-users'
    }
  );
  
  console.log('✅ JWT токен сгенерирован');
  return token;
};

// Проверка JWT токена
export const verifyToken = (token: string): JWTPayload | null => {
  console.log('🔍 Проверка JWT токена...');
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: 'apostles-app',
      audience: 'apostles-users'
    }) as JWTPayload;
    
    console.log('✅ JWT токен валидный для пользователя:', decoded.email);
    return decoded;
  } catch (error) {
    console.error('❌ Невалидный JWT токен:', error);
    return null;
  }
};

// Извлечение токена из заголовков запроса
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
  
  const payload = verifyToken(token);
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
      currentApostleId: true
    }
  });
  
  if (!user) {
    console.log('❌ Пользователь не найден в БД');
    return null;
  }
  
  console.log('✅ Пользователь авторизован:', user.email);
  return user;
};

// Обновление lastActiveDate при успешной авторизации
export const updateLastActive = async (userId: string): Promise<void> => {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: { lastActiveDate: new Date() }
    });
    console.log('✅ lastActiveDate обновлен для пользователя:', userId);
  } catch (error) {
    console.error('❌ Ошибка обновления lastActiveDate:', error);
  }
}; 