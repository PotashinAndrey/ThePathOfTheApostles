import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '../../../../lib/auth';
import { prisma } from '../../../../lib/prisma';
import { UserProfileResponse, ApiResponse } from '../../../../types/api';

export async function GET(request: NextRequest) {
  console.log('🚀 Backend API /user/profile получил запрос');
  
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

    console.log('👤 Получение профиля для пользователя:', authUser.email);

    // Получаем пользователя с базовой информацией
    const user = await prisma.user.findUnique({
      where: { id: authUser.id },
      select: {
        id: true,
        name: true,
        email: true,
        joinDate: true,
        lastActiveDate: true,
        streak: true,
        avatar: true,
        status: true,
        currentSubscription: true
      }
    });

    if (!user) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Пользователь не найден'
      }, { status: 404 });
    }

    // Временно возвращаем базовую информацию
    // В будущем здесь будет подсчет статистики из связанных таблиц
    const profile: UserProfileResponse = {
      id: user.id,
      name: user.name,
      email: user.email,
      joinDate: user.joinDate,
      currentSubscription: user.currentSubscription,
      lastActiveDate: user.lastActiveDate,
      streak: user.streak,
      avatar: user.avatar,
      status: user.status,
      totalChallengesCompleted: 0, // Заглушка, потом подсчитаем
      totalPathsCompleted: 0, // Заглушка, потом подсчитаем
      achievements: [], // Заглушка, потом получим из БД
      currentPath: undefined // Заглушка, потом получим из БД
    };

    console.log('✅ Профиль пользователя получен');
    
    return NextResponse.json<ApiResponse<UserProfileResponse>>({
      success: true,
      data: profile
    });

  } catch (error) {
    console.error('❌ Ошибка получения профиля:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Внутренняя ошибка сервера'
    }, { status: 500 });
  }
}

// PUT /api/user/profile - обновить профиль
export async function PUT(request: NextRequest) {
  console.log('🚀 Backend API /user/profile PUT получил запрос');
  
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
    const { name, avatar } = body;

    // Валидация
    if (name && (name.length < 2 || name.length > 50)) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Имя должно содержать от 2 до 50 символов'
      }, { status: 400 });
    }

    // Обновляем профиль
    const updatedUser = await prisma.user.update({
      where: { id: authUser.id },
      data: {
        ...(name && { name }),
        ...(avatar && { avatar }),
        lastActiveDate: new Date()
      },
      select: {
        id: true,
        name: true,
        email: true,
        joinDate: true,
        lastActiveDate: true,
        streak: true,
        avatar: true,
        status: true,
        currentSubscription: true
      }
    });

    const profile: UserProfileResponse = {
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      joinDate: updatedUser.joinDate,
      currentSubscription: updatedUser.currentSubscription,
      lastActiveDate: updatedUser.lastActiveDate,
      streak: updatedUser.streak,
      avatar: updatedUser.avatar,
      status: updatedUser.status,
      totalChallengesCompleted: 0,
      totalPathsCompleted: 0,
      achievements: [],
      currentPath: undefined
    };

    console.log('✅ Профиль пользователя обновлен');
    
    return NextResponse.json<ApiResponse<UserProfileResponse>>({
      success: true,
      data: profile,
      message: 'Профиль успешно обновлен'
    });

  } catch (error) {
    console.error('❌ Ошибка обновления профиля:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Внутренняя ошибка сервера'
    }, { status: 500 });
  }
} 