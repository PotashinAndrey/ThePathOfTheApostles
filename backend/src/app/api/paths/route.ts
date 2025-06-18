import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '../../../lib/auth';
import { prisma } from '../../../lib/prisma';
import { PathInfo, ApiResponse } from '../../../types/api';

// GET /api/paths - получить все доступные пути
export async function GET(request: NextRequest) {
  console.log('🚀 Backend API /paths получил запрос');
  
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

    console.log('👤 Получение путей для пользователя:', authUser.email);

    // Получаем пользователя с метой
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

    // Получаем все пути
    const allPaths = await prisma.path.findMany({
      orderBy: { id: 'asc' }
    });

    // Получаем активные и завершенные пути пользователя
    const activePaths = user.meta?.paths?.activePathIds || [];
    const completedPaths = user.meta?.paths?.completedPathIds || [];
    const completedTasks = user.meta?.completedTasks || [];

    // Формируем ответ с информацией о путях
    const pathsInfo: PathInfo[] = [];

    for (const path of allPaths) {
      const isActive = activePaths.includes(path.id);
      const isCompleted = completedPaths.includes(path.id);

      // Получаем испытания этого пути
      const challenges = [];
      let totalTasksInPath = 0;
      let completedTasksInPath = 0;

      for (const challengeId of path.challenges) {
        const challenge = await prisma.challenge.findUnique({
          where: { id: challengeId },
          include: {
            apostle: {
              include: {
                virtue: true
              }
            }
          }
        });

        if (challenge) {
          // Получаем обертки заданий для этого испытания
          const taskWrappers = await prisma.taskWrapper.findMany({
            where: {
              id: { in: challenge.orderedTasks }
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

          const challengeCompletedTasks = taskWrappers.filter(tw => 
            completedTasks.includes(tw.id)
          ).length;

          totalTasksInPath += taskWrappers.length;
          completedTasksInPath += challengeCompletedTasks;

          challenges.push({
            id: challenge.id,
            name: challenge.name,
            description: challenge.description,
            apostle: {
              id: challenge.apostle.id,
              name: challenge.apostle.name,
              title: challenge.apostle.title,
              description: challenge.apostle.description,
              archetype: challenge.apostle.archetype,
              personality: challenge.apostle.personality,
              icon: challenge.apostle.icon,
              color: challenge.apostle.color,
              virtue: challenge.apostle.virtue ? {
                id: challenge.apostle.virtue.id,
                name: challenge.apostle.virtue.name,
                description: challenge.apostle.virtue.description
              } : undefined
            },
            totalTasks: taskWrappers.length,
            completedTasks: challengeCompletedTasks,
            isCompleted: challengeCompletedTasks === taskWrappers.length,
            isActive: isActive && challengeCompletedTasks < taskWrappers.length,
            tasks: taskWrappers.map(tw => ({
              id: tw.id,
              challengeId: tw.challengeId,
              task: {
                id: tw.task.id,
                name: tw.task.name,
                description: tw.task.description
              },
              icon: tw.icon,
              order: tw.order,
              apostle: tw.apostle ? {
                id: tw.apostle.id,
                name: tw.apostle.name,
                title: tw.apostle.title,
                description: tw.apostle.description,
                archetype: tw.apostle.archetype,
                personality: tw.apostle.personality,
                icon: tw.apostle.icon,
                color: tw.apostle.color,
                virtue: tw.apostle.virtue ? {
                  id: tw.apostle.virtue.id,
                  name: tw.apostle.virtue.name,
                  description: tw.apostle.virtue.description
                } : undefined
              } : undefined,
              isCompleted: completedTasks.includes(tw.id),
              isActive: isActive && !completedTasks.includes(tw.id)
            }))
          });
        }
      }

      // Вычисляем прогресс пути
      const progress = totalTasksInPath > 0 
        ? Math.round((completedTasksInPath / totalTasksInPath) * 100)
        : 0;

      pathsInfo.push({
        id: path.id,
        name: path.name,
        description: path.description,
        icon: path.icon,
        isActive: isActive,
        progress: progress,
        totalChallenges: challenges.length,
        completedChallenges: challenges.filter(c => c.isCompleted).length,
        challenges: challenges
      });
    }

    console.log('✅ Получены пути:', pathsInfo.length);
    
    return NextResponse.json<ApiResponse<PathInfo[]>>({
      success: true,
      data: pathsInfo
    });

  } catch (error) {
    console.error('❌ Ошибка получения путей:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Внутренняя ошибка сервера'
    }, { status: 500 });
  }
} 