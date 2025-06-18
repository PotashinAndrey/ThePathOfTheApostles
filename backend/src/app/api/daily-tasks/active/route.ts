import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '../../../../lib/auth';
import { prisma } from '../../../../lib/prisma';
import { ActiveTaskResponse, ApiResponse } from '../../../../types/api';

export async function GET(request: NextRequest) {
  try {
    console.log('🎯 Получение активного ежедневного задания');

    // Проверяем авторизацию
    const user = await requireAuth(request);
    if (!user) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log(`👤 Пользователь: ${user.email}`);

    // Ищем активное задание пользователя
    const activeUserTask = await prisma.userDailyTask.findFirst({
      where: {
        userId: user.id,
        status: 'ACTIVE'
      },
      include: {
        dailyTask: {
          include: {
            apostle: {
              include: {
                virtue: true
              }
            }
          }
        }
      }
    });

    if (!activeUserTask) {
      console.log('ℹ️ У пользователя нет активного задания');
      
      return NextResponse.json<ApiResponse<ActiveTaskResponse>>({
        success: true,
        data: {
          hasActiveTask: false,
          currentTask: null,
          nextTask: null,
          apostleProgress: {
            apostleId: 'peter',
            currentDay: 1,
            completedTasks: 0,
            totalTasks: 7
          }
        }
      });
    }

    // Активируем путь для пользователя при наличии активного задания
    await activatePathForUser(user.id);

    // Считаем прогресс по апостолу
    const completedTasksCount = await prisma.userDailyTask.count({
      where: {
        userId: user.id,
        dailyTask: {
          apostleId: activeUserTask.dailyTask.apostleId
        },
        status: 'COMPLETED'
      }
    });

    const totalTasksCount = await prisma.dailyTask.count({
      where: {
        apostleId: activeUserTask.dailyTask.apostleId
      }
    });

    // Формируем ответ с реальными данными
    const currentTask = {
      id: activeUserTask.dailyTask.id, // Используем реальный ID из базы данных
      name: activeUserTask.dailyTask.name,
      description: activeUserTask.dailyTask.description,
      apostleId: activeUserTask.dailyTask.apostleId,
      apostle: {
        id: activeUserTask.dailyTask.apostle.id,
        name: activeUserTask.dailyTask.apostle.name,
        title: activeUserTask.dailyTask.apostle.title,
        description: activeUserTask.dailyTask.apostle.description,
        archetype: activeUserTask.dailyTask.apostle.archetype,
        personality: activeUserTask.dailyTask.apostle.personality,
        icon: activeUserTask.dailyTask.apostle.icon,
        color: activeUserTask.dailyTask.apostle.color,
        virtue: activeUserTask.dailyTask.apostle.virtue ? {
          id: activeUserTask.dailyTask.apostle.virtue.id,
          name: activeUserTask.dailyTask.apostle.virtue.name,
          description: activeUserTask.dailyTask.apostle.virtue.description
        } : undefined
      },
      dayNumber: activeUserTask.dailyTask.dayNumber,
      status: 'active' as const,
      createdAt: activeUserTask.dailyTask.createdAt,
      activatedAt: activeUserTask.activatedAt,
      motivationalPhrase: activeUserTask.dailyTask.motivationalPhrase,
    };

    const response: ActiveTaskResponse = {
      hasActiveTask: true,
      currentTask: currentTask,
      nextTask: undefined, // TODO: Можем добавить следующее задание если нужно
      apostleProgress: {
        apostleId: activeUserTask.dailyTask.apostleId,
        currentDay: activeUserTask.dailyTask.dayNumber,
        completedTasks: completedTasksCount,
        totalTasks: totalTasksCount,
      },
    };

    console.log('✅ Возвращаем активное задание:', currentTask.id);

    return NextResponse.json<ApiResponse<ActiveTaskResponse>>({
      success: true,
      data: response,
    });

  } catch (error) {
    console.error('❌ Ошибка получения активного задания:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// Вспомогательная функция для активации пути при активном задании
async function activatePathForUser(userId: string) {
  try {
    // Находим или создаем основной путь
    let mainPath = await prisma.path.findFirst({
      where: {
        name: 'Основной путь'
      }
    });

    if (!mainPath) {
      console.log('⚠️ Основной путь не найден, создаем его');
      
      mainPath = await prisma.path.create({
        data: {
          name: 'Основной путь',
          description: 'Вступительный путь с ежедневными заданиями от апостолов',
          icon: '🛤️'
        }
      });
    }

    await activateUserPath(userId, mainPath.id);

  } catch (error) {
    console.error('❌ Ошибка активации пути:', error);
  }
}

// Вспомогательная функция для активации пути пользователя
async function activateUserPath(userId: string, pathId: string) {
  try {
    // Получаем пользователя с прогрессом
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        userProgress: {
          include: {
            userPaths: true
          }
        }
      }
    });

    if (!user) {
      console.error('❌ Пользователь не найден:', userId);
      return;
    }

    if (!user.userProgress) {
      // Создаем новый UserProgress
      const newUserPaths = await prisma.userPathsList.create({
        data: {
          userId: userId,
          activePathIds: [pathId],
          completedPathIds: []
        }
      });

      const newUserProgress = await prisma.userProgress.create({
        data: {
          userPathsId: newUserPaths.id
        }
      });

      // Связываем с пользователем
      await prisma.user.update({
        where: { id: userId },
        data: { userProgressId: newUserProgress.id }
      });

      console.log('✅ Создан новый прогресс пользователя и активирован путь:', pathId);
      return;
    }

    if (!user.userProgress.userPaths) {
      // Создаем UserPathsList
      const newUserPaths = await prisma.userPathsList.create({
        data: {
          userId: userId,
          activePathIds: [pathId],
          completedPathIds: []
        }
      });

      await prisma.userProgress.update({
        where: { id: user.userProgress.id },
        data: { userPathsId: newUserPaths.id }
      });

      console.log('✅ Создан UserPathsList и активирован путь:', pathId);
      return;
    }

    // Проверяем, активен ли уже этот путь
    const isPathActive = user.userProgress.userPaths.activePathIds.includes(pathId);
    if (!isPathActive) {
      await prisma.userPathsList.update({
        where: { id: user.userProgress.userPaths.id },
        data: {
          activePathIds: [...user.userProgress.userPaths.activePathIds, pathId]
        }
      });

      console.log('✅ Путь активирован:', pathId);
    } else {
      console.log('ℹ️ Путь уже активен:', pathId);
    }

  } catch (error) {
    console.error('❌ Ошибка активации пути пользователя:', error);
  }
} 