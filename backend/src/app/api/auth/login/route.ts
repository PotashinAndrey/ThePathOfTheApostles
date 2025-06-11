import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import bcrypt from 'bcryptjs';

// Простая генерация JWT без сложных типов
const generateSimpleToken = (userId: string, email: string, name: string): string => {
  const payload = {
    userId,
    email,
    name,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60) // 7 дней
  };
  
  // Простое кодирование в base64 (для разработки)
  const token = Buffer.from(JSON.stringify(payload)).toString('base64');
  return token;
};

export async function POST(request: NextRequest) {
  console.log('🚀 Backend API /auth/login получил запрос');
  
  try {
    const body = await request.json();
    console.log('📦 Тело запроса входа:', { ...body, password: '[СКРЫТО]' });
    
    const { email, password } = body;

    // Валидация входных данных
    if (!email || !password) {
      console.error('❌ Недостает обязательных параметров');
      return NextResponse.json(
        { error: 'Недостает обязательных параметров: email, password' },
        { status: 400 }
      );
    }

    // Ищем пользователя по email
    console.log('🔍 Поиск пользователя с email:', email);
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        passwordHash: true,
        salt: true,
        currentApostleId: true,
      }
    });

    if (!user) {
      console.error('❌ Пользователь не найден');
      return NextResponse.json(
        { error: 'Неверный email или пароль' },
        { status: 401 }
      );
    }

    // Проверяем пароль
    console.log('🔐 Проверка пароля...');
    const hashedInput = await bcrypt.hash(password, user.salt);
    const isPasswordValid = hashedInput === user.passwordHash;

    if (!isPasswordValid) {
      console.error('❌ Неверный пароль');
      return NextResponse.json(
        { error: 'Неверный email или пароль' },
        { status: 401 }
      );
    }

    console.log('✅ Пароль верный');

    // Обновляем lastActiveDate
    await prisma.user.update({
      where: { id: user.id },
      data: { lastActiveDate: new Date() }
    });

    // Генерируем токен
    console.log('🎫 Генерация токена...');
    const token = generateSimpleToken(user.id, user.email, user.name);

    console.log('✅ Пользователь успешно авторизован:', user.email);

    // Возвращаем токен и данные пользователя
    return NextResponse.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        currentApostleId: user.currentApostleId,
      },
      message: 'Успешный вход в систему'
    });

  } catch (error) {
    console.error('❌ Ошибка входа:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
} 