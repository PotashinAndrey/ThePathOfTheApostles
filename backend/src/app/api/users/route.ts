import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '../../../lib/auth';
import { prisma } from '../../../lib/prisma';
import { UserResponse, ApiResponse } from '../../../types/api';

// GET /api/users?id=userId - получить пользователя
export async function GET(request: NextRequest) {
  console.log('🚀 Backend API /users GET получил запрос');
  
  try {
    // Проверяем авторизацию
    const authUser = await requireAuth(request);
    if (!authUser) {
      console.error('❌ Пользователь не авторизован');
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Требуется авторизация'
      }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('id') || authUser.id;
    
    console.log('🔍 Запрос пользователя с ID:', userId);

    // Проверяем права доступа - пользователь может получить только свои данные
    if (userId !== authUser.id) {
      console.error('❌ Нет прав для просмотра данных другого пользователя');
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Нет прав для просмотра данных другого пользователя'
      }, { status: 403 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        joinDate: true,
        currentSubscription: true,
        lastActiveDate: true,
        streak: true,
        avatar: true,
        status: true
      }
    });

    if (!user) {
      console.log('👤 Пользователь не найден:', userId);
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Пользователь не найден'
      }, { status: 404 });
    }

    const userResponse: UserResponse = {
      id: user.id,
      name: user.name,
      email: user.email,
      joinDate: user.joinDate,
      currentSubscription: user.currentSubscription,
      lastActiveDate: user.lastActiveDate,
      streak: user.streak,
      avatar: user.avatar,
      status: user.status
    };

    console.log('✅ Пользователь найден:', user.name);
    return NextResponse.json<ApiResponse<UserResponse>>({
      success: true,
      data: userResponse
    });
    
  } catch (error) {
    console.error('❌ Ошибка в GET /users:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Внутренняя ошибка сервера'
    }, { status: 500 });
  }
}

// POST /api/users - обновить данные пользователя
export async function POST(request: NextRequest) {
  console.log('🚀 Backend API /users POST получил запрос');
  
  try {
    // Проверяем авторизацию
    const authUser = await requireAuth(request);
    if (!authUser) {
      console.error('❌ Пользователь не авторизован');
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Требуется авторизация'
      }, { status: 401 });
    }

    const body = await request.json();
    console.log('📦 Тело запроса:', body);
    
    const { name, avatar } = body;

    // Валидация
    if (name && (name.length < 2 || name.length > 50)) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Имя должно содержать от 2 до 50 символов'
      }, { status: 400 });
    }

    console.log('👤 Обновляем пользователя:', authUser.id);

    // Обновляем пользователя
    const user = await prisma.user.update({
      where: { id: authUser.id },
      data: {
        ...(name && { name }),
        ...(avatar && { avatar }),
        lastActiveDate: new Date(),
      },
      select: {
        id: true,
        name: true,
        email: true,
        joinDate: true,
        currentSubscription: true,
        lastActiveDate: true,
        streak: true,
        avatar: true,
        status: true
      }
    });

    const userResponse: UserResponse = {
      id: user.id,
      name: user.name,
      email: user.email,
      joinDate: user.joinDate,
      currentSubscription: user.currentSubscription,
      lastActiveDate: user.lastActiveDate,
      streak: user.streak,
      avatar: user.avatar,
      status: user.status
    };

    console.log('✅ Пользователь обновлен:', user);
    return NextResponse.json<ApiResponse<UserResponse>>({
      success: true,
      data: userResponse,
      message: 'Данные пользователя обновлены'
    });
    
  } catch (error) {
    console.error('❌ Ошибка в POST /users:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Внутренняя ошибка сервера'
    }, { status: 500 });
  }
} 