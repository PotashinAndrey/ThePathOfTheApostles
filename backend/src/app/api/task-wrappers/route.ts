import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '../../../lib/auth';
import { prisma } from '../../../lib/prisma';
import { TaskWrapperInfo, ApiResponse } from '../../../types/api';

// GET /api/task-wrappers - получить все доступные TaskWrapper пользователя
export async function GET(request: NextRequest) {
  console.log('🚀 Backend API /task-wrappers получил запрос');
  
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

    console.log('👤 Получение TaskWrapper для пользователя:', authUser.email);

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

    if (!user || !user.meta || !user.meta.paths) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Пользователь не найден или нет активных путей'
      }, { status: 404 });
    }

    const activeTaskWrapperIds = user.meta.activeTasks;
    const completedTaskWrapperIds = user.meta.completedTasks;
    const activePathIds = user.meta.paths.activePathIds;

    console.log(`🛤️ Активные пути пользователя: ${activePathIds.length}`);

    if (activePathIds.length === 0) {
      return NextResponse.json<ApiResponse<TaskWrapperInfo[]>>({
        success: true,
        data: []
      });
    }

    // Получаем все активные пути со всеми связанными данными
    const paths = await prisma.path.findMany({
      where: {
        id: { in: activePathIds }
      }
    });

    // Получаем все Challenge для этих путей
    const allChallengeIds: string[] = [];
    paths.forEach(path => {
      allChallengeIds.push(...path.challenges);
    });

    console.log(`🎯 Найдено Challenge: ${allChallengeIds.length}`);

    if (allChallengeIds.length === 0) {
      return NextResponse.json<ApiResponse<TaskWrapperInfo[]>>({
        success: true,
        data: []
      });
    }

    // Получаем все Challenge с TaskWrapper'ами
    const challenges = await prisma.challenge.findMany({
      where: {
        id: { in: allChallengeIds }
      },
      include: {
        apostle: {
          include: {
            virtue: true
          }
        }
      }
    });

    // Получаем все TaskWrapper для этих Challenge
    const allTaskWrapperIds: string[] = [];
    challenges.forEach(challenge => {
      allTaskWrapperIds.push(...challenge.orderedTasks);
    });

    console.log(`📋 Найдено TaskWrapper IDs: ${allTaskWrapperIds.length}`);

    if (allTaskWrapperIds.length === 0) {
      return NextResponse.json<ApiResponse<TaskWrapperInfo[]>>({
        success: true,
        data: []
      });
    }

    // Получаем все TaskWrapper с полной информацией
    const allTaskWrappers = await prisma.taskWrapper.findMany({
      where: {
        id: { in: allTaskWrapperIds }
      },
      include: {
        task: true,
        apostle: {
          include: {
            virtue: true
          }
        }
      },
      orderBy: {
        order: 'asc'
      }
    });

    console.log(`✅ Получено TaskWrapper: ${allTaskWrappers.length}`);

    // Создаем маппинг Challenge -> Apostle для удобства
    const challengeMap = new Map(challenges.map(c => [c.id, c]));

    // Преобразуем в формат API
    const taskWrapperInfos: TaskWrapperInfo[] = allTaskWrappers.map(tw => {
      // Ищем challenge для этого TaskWrapper
      const challenge = challenges.find(c => c.orderedTasks.includes(tw.id));
      const apostle = tw.apostle || challenge?.apostle;
      
      return {
        id: tw.id,
        challengeId: challenge?.id || '',
        task: {
          id: tw.task.id,
          name: tw.task.name,
          description: tw.task.description
        },
        icon: tw.icon,
        order: tw.order,
        apostle: apostle ? {
          id: apostle.id,
          name: apostle.name,
          title: apostle.title,
          description: apostle.description,
          archetype: apostle.archetype,
          personality: apostle.personality,
          icon: apostle.icon,
          color: apostle.color,
          virtue: apostle.virtue ? {
            id: apostle.virtue.id,
            name: apostle.virtue.name,
            description: apostle.virtue.description
          } : undefined
        } : undefined,
        isCompleted: completedTaskWrapperIds.includes(tw.id),
        isActive: activeTaskWrapperIds.includes(tw.id)
      };
    });

    console.log('✅ Получены активные TaskWrapper:', taskWrapperInfos.length);
    
    return NextResponse.json<ApiResponse<TaskWrapperInfo[]>>({
      success: true,
      data: taskWrapperInfos
    });

  } catch (error) {
    console.error('❌ Ошибка получения TaskWrapper:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Внутренняя ошибка сервера'
    }, { status: 500 });
  }
} 