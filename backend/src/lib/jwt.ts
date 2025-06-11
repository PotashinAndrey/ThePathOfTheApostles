import jwt from 'jsonwebtoken';

// Секретный ключ для JWT
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export interface JWTPayload {
  userId: string;
  email: string;
  name: string;
}

// Генерация JWT токена
export const generateToken = (payload: JWTPayload): string => {
  console.log('🎫 Генерация JWT токена для пользователя:', payload.email);
  
  const token = jwt.sign(
    {
      userId: payload.userId,
      email: payload.email,
      name: payload.name
    },
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
    }) as any;
    
    if (decoded && decoded.userId && decoded.email && decoded.name) {
      const payload: JWTPayload = {
        userId: decoded.userId,
        email: decoded.email,
        name: decoded.name
      };
      
      console.log('✅ JWT токен валидный для пользователя:', payload.email);
      return payload;
    }
    
    console.error('❌ Невалидная структура JWT токена');
    return null;
  } catch (error) {
    console.error('❌ Невалидный JWT токен:', error);
    return null;
  }
}; 