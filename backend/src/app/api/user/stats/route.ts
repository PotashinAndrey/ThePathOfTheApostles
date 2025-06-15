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

    // Получаем активные задания пользователя
    const activeChallenges = await prisma.challenge.findMany({
      where: {
        id: {
          in: user.userProgress?.completedChallenges?.currentChallengeId ? 
            [user.userProgress.completedChallenges.currentChallengeId] : []
        }
      },
      include: {
        apostle: {
          include: {
            virtue: true
          }
        }
      }
    });

    // Получаем текущий путь
    const activePathIds = user.userProgress?.userPaths?.activePathIds || [];
    const currentPath = activePathIds.length > 0 ? await prisma.path.findFirst({
      where: { id: activePathIds[0] },
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
    }) : null;

    // Формируем ответ
    const stats: UserStatsResponse = {
      streak: user.streak,
      totalDays: user.streak, // Пока что равно streak
      challengesCompleted: user.userProgress?.completedChallenges?.completedChallengeIds.length || 0,
      pathsCompleted: user.userProgress?.userPaths?.completedPathIds.length || 0,
      currentPath: currentPath ? {
        id: currentPath.id,
        name: currentPath.name,
        description: currentPath.description,
        icon: currentPath.icon,
        progress: 0, // Пока что 0, потом можно рассчитать
        totalChallenges: currentPath.challenges.length,
        completedChallenges: 0, // Пока что 0, потом можно рассчитать
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
          isCompleted: false, // Пока что false, потом можно рассчитать
          isActive: false, // Пока что false, потом можно рассчитать
          order: pc.order
        }))
      } : undefined,
      activeChallenges: activeChallenges.map(challenge => ({
        id: challenge.id,
        name: challenge.name,
        description: challenge.description,
        icon: challenge.icon,
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
        isCompleted: false,
        isActive: true
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