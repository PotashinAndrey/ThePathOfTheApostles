import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '../../../../lib/auth';
import { prisma } from '../../../../lib/prisma';
import { ApiResponse } from '../../../../types/api';

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Запуск первого задания пути');

    // Проверяем авторизацию
    const user = await requireAuth(request);
    if (!user) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log(`👤 Пользователь: ${user.email}`);

    // Проверяем, есть ли уже активное задание
    const existingActiveTask = await prisma.userDailyTask.findFirst({
      where: {
        userId: user.id,
        status: 'ACTIVE'
      }
    });

    if (existingActiveTask) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'User already has an active task' },
        { status: 400 }
      );
    }

    // Ищем первое задание Петра (день 1)
    const firstTask = await prisma.dailyTask.findFirst({
      where: {
        apostle: {
          name: 'Пётр'
        },
        dayNumber: 1
      },
      include: {
        apostle: {
          include: {
            virtue: true
          }
        }
      }
    });

    if (!firstTask) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'First daily task not found' },
        { status: 404 }
      );
    }

    // Создаем активное задание для пользователя
    const userDailyTask = await prisma.userDailyTask.create({
      data: {
        userId: user.id,
        dailyTaskId: firstTask.id,
        status: 'ACTIVE',
        activatedAt: new Date()
      }
    });

    // Активируем основной путь для пользователя
    await activateMainPath(user.id);

    console.log('✅ Первое задание активировано для пользователя');

    // Формируем ответ с информацией о задании
    const taskInfo = {
      id: firstTask.id,
      name: firstTask.name,
      description: firstTask.description,
      apostleId: firstTask.apostleId,
      apostle: {
        id: firstTask.apostle.id,
        name: firstTask.apostle.name,
        title: firstTask.apostle.title,
        description: firstTask.apostle.description,
        archetype: firstTask.apostle.archetype,
        personality: firstTask.apostle.personality,
        icon: firstTask.apostle.icon,
        color: firstTask.apostle.color,
        virtue: firstTask.apostle.virtue ? {
          id: firstTask.apostle.virtue.id,
          name: firstTask.apostle.virtue.name,
          description: firstTask.apostle.virtue.description
        } : undefined
      },
      dayNumber: firstTask.dayNumber,
      status: 'active',
      createdAt: firstTask.createdAt,
      activatedAt: userDailyTask.activatedAt,
      motivationalPhrase: firstTask.motivationalPhrase,
    };

    return NextResponse.json<ApiResponse>({
      success: true,
      data: {
        message: 'First task activated successfully',
        task: taskInfo
      }
    });

  } catch (error) {
    console.error('❌ Ошибка активации первого задания:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// Вспомогательная функция для активации основного пути
async function activateMainPath(userId: string) {
  try {
    console.log(`🛤️ Активация основного пути для пользователя: ${userId}`);

    // Находим основной путь
    const mainPath = await prisma.path.findFirst({
      where: { name: 'Основной путь' }
    });

    if (!mainPath) {
      console.error('❌ Основной путь не найден');
      return;
    }

    // Получаем или создаем UserProgress для пользователя
    let userProgress = await prisma.userProgress.findFirst({
      where: {
        user: {
          id: userId
        }
      },
      include: {
        userPaths: true
      }
    });

    if (!userProgress) {
      // Создаем новый UserProgress
      const newUserPaths = await prisma.userPathsList.create({
        data: {
          userId: userId,
          activePathIds: [mainPath.id],
          completedPathIds: []
        }
      });

      userProgress = await prisma.userProgress.create({
        data: {
          userPathsId: newUserPaths.id
        },
        include: {
          userPaths: true
        }
      });

      // Связываем с пользователем
      await prisma.user.update({
        where: { id: userId },
        data: { userProgressId: userProgress.id }
      });

      console.log('✅ Создан новый прогресс пользователя и активирован основной путь');
      return;
    }

    if (!userProgress.userPaths) {
      // Создаем UserPathsList
      const newUserPaths = await prisma.userPathsList.create({
        data: {
          userId: userId,
          activePathIds: [mainPath.id],
          completedPathIds: []
        }
      });

      await prisma.userProgress.update({
        where: { id: userProgress.id },
        data: { userPathsId: newUserPaths.id }
      });

      console.log('✅ Создан UserPathsList и активирован основной путь');
      return;
    }

    // Проверяем, активен ли уже основной путь
    const isPathActive = userProgress.userPaths.activePathIds.includes(mainPath.id);
    if (!isPathActive) {
      await prisma.userPathsList.update({
        where: { id: userProgress.userPaths.id },
        data: {
          activePathIds: [...userProgress.userPaths.activePathIds, mainPath.id]
        }
      });

      console.log('✅ Основной путь активирован');
    } else {
      console.log('ℹ️ Основной путь уже активен');
    }

  } catch (error) {
    console.error('❌ Ошибка активации основного пути:', error);
  }
} 