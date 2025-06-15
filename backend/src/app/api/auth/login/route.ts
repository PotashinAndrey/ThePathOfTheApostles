import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { generateToken, verifyPassword } from '../../../../lib/auth';
import { LoginRequest, AuthResponse, ApiResponse } from '../../../../types/api';

export async function POST(request: NextRequest) {
  console.log('🚀 Backend API /auth/login получил запрос');
  
  try {
    const body: LoginRequest = await request.json();
    console.log('📦 Тело запроса входа:', { ...body, password: '[СКРЫТО]' });
    
    const { email, password } = body;

    // Валидация входных данных
    if (!email || !password) {
      console.error('❌ Недостает обязательных параметров');
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Недостает обязательных параметров: email, password'
      }, { status: 400 });
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
        status: true,
        joinDate: true,
        lastActiveDate: true,
        streak: true,
        avatar: true,
        currentSubscription: true
      }
    });

    if (!user) {
      console.error('❌ Пользователь не найден');
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Неверный email или пароль'
      }, { status: 401 });
    }

    if (user.status !== 'ACTIVE') {
      console.error('❌ Аккаунт заблокирован');
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Аккаунт заблокирован'
      }, { status: 401 });
    }

    // Проверяем пароль
    console.log('🔐 Проверка пароля...');
    const isPasswordValid = await verifyPassword(password, user.passwordHash, user.salt);

    if (!isPasswordValid) {
      console.error('❌ Неверный пароль');
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Неверный email или пароль'
      }, { status: 401 });
    }

    console.log('✅ Пароль верный');

    // Обновляем lastActiveDate
    await prisma.user.update({
      where: { id: user.id },
      data: { lastActiveDate: new Date() }
    });

    // Генерируем токен
    console.log('🎫 Генерация токена...');
    const token = generateToken(user);

    console.log('✅ Пользователь успешно авторизован:', user.email);

    // Возвращаем токен и данные пользователя
    const response: ApiResponse<AuthResponse> = {
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          joinDate: user.joinDate,
          currentSubscription: user.currentSubscription,
          lastActiveDate: user.lastActiveDate,
          streak: user.streak,
          avatar: user.avatar,
          status: user.status
        },
        message: 'Успешный вход в систему'
      },
      message: 'Успешный вход в систему'
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('❌ Ошибка входа:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Внутренняя ошибка сервера'
    }, { status: 500 });
  }
} 