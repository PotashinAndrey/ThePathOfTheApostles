import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '../../../../lib/auth';
import { prisma } from '../../../../lib/prisma';
import { TaskWrapperInfo, ApiResponse } from '../../../../types/api';

// GET /api/task-wrappers/[id] - получить TaskWrapper по ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  console.log('🚀 Backend API /task-wrappers/[id] GET получил запрос для:', params.id);
  
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

    // Получаем TaskWrapper с полной информацией
    const taskWrapper = await prisma.taskWrapper.findUnique({
      where: { id: params.id },
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
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'TaskWrapper не найден'
      }, { status: 404 });
    }

    // Получаем Challenge и Apostle информацию
    const challenge = await prisma.challenge.findUnique({
      where: { id: taskWrapper.challengeId },
      include: {
        apostle: {
          include: {
            virtue: true
          }
        }
      }
    });

    // Получаем пользователя для проверки статуса задания
    const user = await prisma.user.findUnique({
      where: { id: authUser.id },
      include: { meta: true }
    });

    if (!user || !user.meta) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Пользователь не найден'
      }, { status: 404 });
    }

    const apostle = taskWrapper.apostle || challenge?.apostle;
    const isCompleted = user.meta.completedTasks.includes(taskWrapper.id);
    const isActive = user.meta.activeTasks.includes(taskWrapper.id);

    // Вычисляем доступность задания (доступно если предыдущее завершено или это первое)
    let isAvailable = false;
    if (challenge) {
      const currentIndex = challenge.orderedTasks.indexOf(taskWrapper.id);
      if (currentIndex === 0) {
        // Первое задание всегда доступно
        isAvailable = true;
      } else {
        // Проверяем завершено ли предыдущее задание
        const prevTaskWrapperId = challenge.orderedTasks[currentIndex - 1];
        isAvailable = user.meta.completedTasks.includes(prevTaskWrapperId);
      }
    }

    // Преобразуем в формат API
    const taskWrapperInfo: TaskWrapperInfo = {
      id: taskWrapper.id,
      challengeId: taskWrapper.challengeId,
      task: {
        id: taskWrapper.task.id,
        name: taskWrapper.task.name,
        description: taskWrapper.task.description
      },
      icon: taskWrapper.icon,
      order: taskWrapper.order,
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
      isCompleted,
      isActive,
      isAvailable
    };

    console.log('✅ TaskWrapper получен');
    
    return NextResponse.json<ApiResponse<TaskWrapperInfo>>({
      success: true,
      data: taskWrapperInfo
    });

  } catch (error) {
    console.error('❌ Ошибка получения TaskWrapper:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Внутренняя ошибка сервера'
    }, { status: 500 });
  }
}

// POST /api/task-wrappers/[id]/activate - активировать TaskWrapper
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  console.log('🚀 Backend API /task-wrappers/[id]/activate получил запрос для:', params.id);
  
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
    const action = body.action; // 'activate', 'complete', 'skip'

    // Получаем TaskWrapper
    const taskWrapper = await prisma.taskWrapper.findUnique({
      where: { id: params.id },
      include: {
        task: true
      }
    });

    if (!taskWrapper) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'TaskWrapper не найден'
      }, { status: 404 });
    }

    // Получаем пользователя с метаданными
    const user = await prisma.user.findUnique({
      where: { id: authUser.id },
      include: { meta: true }
    });

    if (!user || !user.meta) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Пользователь не найден'
      }, { status: 404 });
    }

    const currentActiveTasks = user.meta.activeTasks;
    const currentCompletedTasks = user.meta.completedTasks;

    if (action === 'activate') {
      // Проверяем что TaskWrapper доступен для активации
      if (currentActiveTasks.includes(params.id)) {
        return NextResponse.json<ApiResponse>({
          success: false,
          error: 'TaskWrapper уже активирован'
        }, { status: 400 });
      }

      if (currentCompletedTasks.includes(params.id)) {
        return NextResponse.json<ApiResponse>({
          success: false,
          error: 'TaskWrapper уже завершен'
        }, { status: 400 });
      }

      // 🚫 ПРОВЕРКА: Только одно активное задание за раз
      const challengeForActivation = await prisma.challenge.findUnique({
        where: { id: taskWrapper.challengeId }
      });

      if (challengeForActivation) {
        // Проверяем есть ли уже активные задания из этого испытания
        const activeTasksFromThisChallenge = currentActiveTasks.filter(activeTaskId => 
          challengeForActivation.orderedTasks.includes(activeTaskId)
        );

        if (activeTasksFromThisChallenge.length > 0) {
          return NextResponse.json<ApiResponse>({
            success: false,
            error: 'У вас уже есть активное задание из этого испытания. Завершите его сначала.'
          }, { status: 400 });
        }

        // 🔒 ПРОВЕРКА: Доступно ли задание для активации
        const currentIndex = challengeForActivation.orderedTasks.indexOf(params.id);
        if (currentIndex === -1) {
          return NextResponse.json<ApiResponse>({
            success: false,
            error: 'TaskWrapper не найден в испытании'
          }, { status: 400 });
        }

        if (currentIndex > 0) {
          // Проверяем завершено ли предыдущее задание
          const prevTaskWrapperId = challengeForActivation.orderedTasks[currentIndex - 1];
          if (!currentCompletedTasks.includes(prevTaskWrapperId)) {
            return NextResponse.json<ApiResponse>({
              success: false,
              error: 'Предыдущее задание должно быть завершено перед активацией этого'
            }, { status: 400 });
          }
        }
      }

      // Добавляем в список активных
      const updatedActiveTasks = [...currentActiveTasks, params.id];

      await prisma.userMeta.update({
        where: { id: user.meta.id },
        data: {
          activeTasks: updatedActiveTasks
        }
      });

      console.log('✅ TaskWrapper активирован');

      return NextResponse.json<ApiResponse>({
        success: true,
        message: 'TaskWrapper успешно активирован'
      });

    } else if (action === 'complete') {
      // Завершаем TaskWrapper
      if (!currentActiveTasks.includes(params.id)) {
        return NextResponse.json<ApiResponse>({
          success: false,
          error: 'TaskWrapper не активирован'
        }, { status: 400 });
      }

      if (currentCompletedTasks.includes(params.id)) {
        return NextResponse.json<ApiResponse>({
          success: false,
          error: 'TaskWrapper уже завершен'
        }, { status: 400 });
      }

      // Перемещаем из активных в завершенные
      const updatedActiveTasks = currentActiveTasks.filter(id => id !== params.id);
      const updatedCompletedTasks = [...currentCompletedTasks, params.id];

      // Создаем результат выполнения
      const content = body.content || 'Задание выполнено';
      await prisma.taskWrapperResult.create({
        data: {
          taskWrapperId: params.id,
          userId: authUser.id,
          content: content,
          result: 'Задание успешно выполнено пользователем'
        }
      });

      await prisma.userMeta.update({
        where: { id: user.meta.id },
        data: {
          activeTasks: updatedActiveTasks,
          completedTasks: updatedCompletedTasks
        }
      });

      // 🔓 РАЗБЛОКИРОВКА СЛЕДУЮЩЕГО ЗАДАНИЯ (без автоактивации)
      const challengeForUnlock = await prisma.challenge.findUnique({
        where: { id: taskWrapper.challengeId }
      });

      if (challengeForUnlock) {
        const currentIndex = challengeForUnlock.orderedTasks.indexOf(params.id);
        const nextIndex = currentIndex + 1;

        if (nextIndex < challengeForUnlock.orderedTasks.length) {
          const nextTaskWrapperId = challengeForUnlock.orderedTasks[nextIndex];
          console.log(`🔓 Следующее задание теперь доступно для активации: ${nextTaskWrapperId}`);
        } else {
          console.log('🏆 Испытание завершено! Все задания выполнены.');
        }
      }

      console.log('✅ TaskWrapper завершен');

      return NextResponse.json<ApiResponse>({
        success: true,
        message: 'TaskWrapper успешно завершен'
      });

    } else if (action === 'skip') {
      // Пропускаем TaskWrapper
      if (!currentActiveTasks.includes(params.id)) {
        return NextResponse.json<ApiResponse>({
          success: false,
          error: 'TaskWrapper не активирован'
        }, { status: 400 });
      }

      if (currentCompletedTasks.includes(params.id)) {
        return NextResponse.json<ApiResponse>({
          success: false,
          error: 'TaskWrapper уже завершен'
        }, { status: 400 });
      }

      // Убираем из активных (но не добавляем в завершенные)
      const updatedActiveTasks = currentActiveTasks.filter(id => id !== params.id);

      // Создаем результат пропуска
      const reason = body.reason || 'Задание пропущено пользователем';
      await prisma.taskWrapperResult.create({
        data: {
          taskWrapperId: params.id,
          userId: authUser.id,
          content: reason,
          result: 'Задание пропущено'
        }
      });

      await prisma.userMeta.update({
        where: { id: user.meta.id },
        data: {
          activeTasks: updatedActiveTasks
        }
      });

      console.log('✅ TaskWrapper пропущен');

      return NextResponse.json<ApiResponse>({
        success: true,
        message: 'TaskWrapper пропущен'
      });

    } else {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Неизвестное действие'
      }, { status: 400 });
    }

  } catch (error) {
    console.error('❌ Ошибка работы с TaskWrapper:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Внутренняя ошибка сервера'
    }, { status: 500 });
  }
} 