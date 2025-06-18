import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '../../../../../lib/auth';
import { prisma } from '../../../../../lib/prisma';
import { ApiResponse } from '../../../../../types/api';

// POST /api/paths/[id]/start - начать путь
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  console.log(`🚀 Начало пути: ${params.id}`);
  
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

    console.log(`👤 Пользователь: ${authUser.email}`);

    // Получаем путь
    const path = await prisma.path.findUnique({
      where: { id: params.id }
    });

    if (!path) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Путь не найден'
      }, { status: 404 });
    }

    // Получаем или создаем UserMeta для пользователя
    let user = await prisma.user.findUnique({
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

    // Создаем UserMeta если не существует
    if (!user.meta) {
      // Создаем UserPathsList
      const userPaths = await prisma.userPathsList.create({
        data: {
          userId: authUser.id,
          activePathIds: [path.id],
          completedPathIds: []
        }
      });

      // Создаем UserMeta
      const userMeta = await prisma.userMeta.create({
        data: {
          completedTasks: [],
          activeTasks: [],
          pathsId: userPaths.id,
          userChatsList: []
        }
      });

      // Обновляем ссылку в User
      await prisma.user.update({
        where: { id: authUser.id },
        data: { metaId: userMeta.id }
      });

      console.log('✅ Создана мета пользователя и активирован путь');
    } else {
      // Проверяем, не активен ли уже этот путь
      const activePaths = user.meta.paths?.activePathIds || [];
      if (activePaths.includes(path.id)) {
        return NextResponse.json<ApiResponse>({
          success: false,
          error: 'Путь уже активен'
        }, { status: 400 });
      }

      // Добавляем путь к активным
      if (user.meta.paths) {
        await prisma.userPathsList.update({
          where: { id: user.meta.paths.id },
          data: {
            activePathIds: [...activePaths, path.id]
          }
        });
      } else {
        // Создаем UserPathsList если не существует
        const userPaths = await prisma.userPathsList.create({
          data: {
            userId: authUser.id,
            activePathIds: [path.id],
            completedPathIds: []
          }
        });

        await prisma.userMeta.update({
          where: { id: user.meta.id },
          data: { pathsId: userPaths.id }
        });
      }

      console.log('✅ Путь добавлен к активным');
    }

    // Активируем первое задание первого испытания
    const firstTaskWrapper = await activateFirstTask(authUser.id, path);

    return NextResponse.json<ApiResponse>({
      success: true,
      data: {
        message: 'Путь успешно активирован',
        pathId: path.id,
        firstTaskWrapper: firstTaskWrapper
      }
    });

  } catch (error) {
    console.error('❌ Ошибка активации пути:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Внутренняя ошибка сервера'
    }, { status: 500 });
  }
}

// Вспомогательная функция для активации первого задания
async function activateFirstTask(userId: string, path: any) {
  try {
    console.log('🎯 Активация первого задания пути');

    // Получаем первое испытание пути
    if (!path.challenges || path.challenges.length === 0) {
      console.log('⚠️ У пути нет испытаний');
      return null;
    }

    const firstChallengeId = path.challenges[0];
    const challenge = await prisma.challenge.findUnique({
      where: { id: firstChallengeId },
      include: {
        apostle: {
          include: {
            virtue: true
          }
        }
      }
    });

    if (!challenge || !challenge.orderedTasks || challenge.orderedTasks.length === 0) {
      console.log('⚠️ У первого испытания нет заданий');
      return null;
    }

    // Получаем первое задание испытания
    const firstTaskWrapperId = challenge.orderedTasks[0];
    const taskWrapper = await prisma.taskWrapper.findUnique({
      where: { id: firstTaskWrapperId },
      include: {
        task: true,
        apostle: {
          include: {
            virtue: true
          }
        }
      }
    });

    if (!taskWrapper) {
      console.log('⚠️ Первое задание не найдено');
      return null;
    }

    // Добавляем задание к активным в UserMeta
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { meta: true }
    });

    if (user?.meta) {
      const currentActiveTasks = user.meta.activeTasks || [];
      if (!currentActiveTasks.includes(taskWrapper.id)) {
        await prisma.userMeta.update({
          where: { id: user.meta.id },
          data: {
            activeTasks: [...currentActiveTasks, taskWrapper.id]
          }
        });
      }
    }

    console.log(`✅ Активировано первое задание: ${taskWrapper.task.name}`);

    return {
      id: taskWrapper.id,
      challengeId: taskWrapper.challengeId,
      task: {
        id: taskWrapper.task.id,
        name: taskWrapper.task.name,
        description: taskWrapper.task.description
      },
      order: taskWrapper.order,
      apostle: taskWrapper.apostle ? {
        id: taskWrapper.apostle.id,
        name: taskWrapper.apostle.name,
        title: taskWrapper.apostle.title,
        icon: taskWrapper.apostle.icon,
        color: taskWrapper.apostle.color
      } : null
    };

  } catch (error) {
    console.error('❌ Ошибка активации первого задания:', error);
    return null;
  }
} 