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

    // Получаем пользователя с прогрессом
    const user = await prisma.user.findUnique({
      where: { id: authUser.id },
      include: {
        userProgress: {
          include: {
            completedChallenges: true,
            userPaths: {
              include: {
                paths: true
              }
            }
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

    // Получаем активные пути
    const activePaths = user.userProgress?.userPaths?.activePathIds || [];
    const completedPaths = user.userProgress?.userPaths?.completedPathIds || [];

    // Получаем информацию о путях
    const pathsInfo = await prisma.path.findMany({
      where: {
        id: {
          in: [...activePaths, ...completedPaths]
        }
      },
      include: {
        challenges: {
          include: {
            challenge: {
              include: {
                apostle: {
                  include: {
                    virtue: true
                  }
                }
              }
            }
          },
          orderBy: {
            order: 'asc'
          }
        }
      }
    });

    // Получаем текущее активное задание для определения текущего пути
    const hasActiveTask = activePaths.length > 0;
    const currentPath = hasActiveTask && pathsInfo.length > 0 ? pathsInfo.find(p => activePaths.includes(p.id)) : null;

    // Формируем ответ
    const stats: UserStatsResponse = {
      streak: user.streak,
      totalDays: user.streak, // Пока что равно streak
      challengesCompleted: user.userProgress?.completedChallenges?.completedChallengeIds.length || 0,
      pathsCompleted: completedPaths.length,
      currentPath: currentPath ? {
        id: currentPath.id,
        name: currentPath.name,
        description: currentPath.description,
        icon: currentPath.icon,
        isActive: activePaths.includes(currentPath.id),
        progress: 0, // TODO: Рассчитать реальный прогресс
        totalChallenges: currentPath.challenges.length,
        completedChallenges: 0, // TODO: Рассчитать реальное количество
        challenges: currentPath.challenges.map(pc => ({
          id: pc.challenge.id,
          name: pc.challenge.name,
          description: pc.challenge.description,
          icon: pc.challenge.icon,
          apostle: {
            id: pc.challenge.apostle.id,
            name: pc.challenge.apostle.name,
            title: pc.challenge.apostle.title,
            description: pc.challenge.apostle.description,
            archetype: pc.challenge.apostle.archetype,
            personality: pc.challenge.apostle.personality,
            icon: pc.challenge.apostle.icon,
            color: pc.challenge.apostle.color,
            virtue: pc.challenge.apostle.virtue ? {
              id: pc.challenge.apostle.virtue.id,
              name: pc.challenge.apostle.virtue.name,
              description: pc.challenge.apostle.virtue.description
            } : undefined
          },
          isCompleted: false, // TODO: Проверить выполнение
          isActive: false, // TODO: Проверить активность
          order: pc.order
        }))
      } : undefined,
      activePaths: pathsInfo
        .filter(p => activePaths.includes(p.id))
        .map(path => ({
          id: path.id,
          name: path.name,
          description: path.description,
          icon: path.icon,
          isActive: true,
          progress: 0, // TODO: Рассчитать
          totalChallenges: path.challenges.length,
          completedChallenges: 0, // TODO: Рассчитать
          challenges: path.challenges.map(pc => ({
            id: pc.challenge.id,
            name: pc.challenge.name,
            description: pc.challenge.description,
            icon: pc.challenge.icon,
            apostle: {
              id: pc.challenge.apostle.id,
              name: pc.challenge.apostle.name,
              title: pc.challenge.apostle.title,
              description: pc.challenge.apostle.description,
              archetype: pc.challenge.apostle.archetype,
              personality: pc.challenge.apostle.personality,
              icon: pc.challenge.apostle.icon,
              color: pc.challenge.apostle.color,
              virtue: pc.challenge.apostle.virtue ? {
                id: pc.challenge.apostle.virtue.id,
                name: pc.challenge.apostle.virtue.name,
                description: pc.challenge.apostle.virtue.description
              } : undefined
            },
            isCompleted: false, // TODO: Проверить выполнение
            isActive: false, // TODO: Проверить активность
            order: pc.order
          }))
        })),
      completedPaths: pathsInfo
        .filter(p => completedPaths.includes(p.id))
        .map(path => ({
          id: path.id,
          name: path.name,
          description: path.description,
          icon: path.icon,
          isActive: false,
          progress: 100,
          totalChallenges: path.challenges.length,
          completedChallenges: path.challenges.length,
          challenges: path.challenges.map(pc => ({
            id: pc.challenge.id,
            name: pc.challenge.name,
            description: pc.challenge.description,
            icon: pc.challenge.icon,
            apostle: {
              id: pc.challenge.apostle.id,
              name: pc.challenge.apostle.name,
              title: pc.challenge.apostle.title,
              description: pc.challenge.apostle.description,
              archetype: pc.challenge.apostle.archetype,
              personality: pc.challenge.apostle.personality,
              icon: pc.challenge.apostle.icon,
              color: pc.challenge.apostle.color,
              virtue: pc.challenge.apostle.virtue ? {
                id: pc.challenge.apostle.virtue.id,
                name: pc.challenge.apostle.virtue.name,
                description: pc.challenge.apostle.virtue.description
              } : undefined
            },
            isCompleted: true, // Все задания в завершенном пути считаются выполненными
            isActive: false,
            order: pc.order
          }))
        }))
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