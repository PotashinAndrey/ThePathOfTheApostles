import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '../../../../lib/auth';
import { prisma } from '../../../../lib/prisma';
import { UserStatsResponse, ApiResponse } from '../../../../types/api';

export async function GET(request: NextRequest) {
  console.log('🚀 Backend API /user/stats получил запрос');
  
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

    console.log('👤 Получение статистики для пользователя:', authUser.email);

    // Получаем пользователя с метаданными
    const user = await prisma.user.findUnique({
      where: { id: authUser.id },
      include: {
        meta: {
          include: {
            paths: true
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Пользователь не найден'
      }, { status: 404 });
    }

    // Упрощенная статистика (заглушки пока архитектура не полностью реализована)
    const stats: UserStatsResponse = {
      streak: user.streak,
      totalDays: user.streak,
      tasksCompleted: user.meta ? user.meta.completedTasks.length : 0,
      pathsCompleted: user.meta?.paths ? user.meta.paths.completedPathIds.length : 0,
      currentPath: undefined, // TODO: реализовать когда будет готова логика путей
      activePaths: [], // TODO: реализовать 
      completedPaths: [], // TODO: реализовать
      activeTaskWrappers: [] // TODO: реализовать
    };

    console.log('✅ Статистика пользователя получена');
    
    return NextResponse.json<ApiResponse<UserStatsResponse>>({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('❌ Ошибка получения статистики:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Внутренняя ошибка сервера'
    }, { status: 500 });
  }
} 