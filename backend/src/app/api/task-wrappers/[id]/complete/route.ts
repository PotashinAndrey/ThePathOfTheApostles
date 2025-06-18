import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '../../../../../lib/auth';
import { prisma } from '../../../../../lib/prisma';
import { ApiResponse } from '../../../../../types/api';

// POST /api/task-wrappers/[id]/complete - завершить TaskWrapper
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  console.log('🚀 Backend API /task-wrappers/[id]/complete получил запрос для:', params.id);
  
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
    const content = body.content || 'Задание выполнено';

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

    // Проверяем текущий статус TaskWrapper
    if (!currentActiveTasks.includes(params.id)) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'TaskWrapper не активирован. Сначала активируйте задание.'
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

    // Транзакция для атомарного обновления
    await prisma.$transaction([
      // Создаем результат выполнения
      prisma.taskWrapperResult.create({
        data: {
          taskWrapperId: params.id,
          userId: authUser.id,
          content: content,
          result: 'Задание успешно выполнено пользователем'
        }
      }),
      // Обновляем метаданные пользователя
      prisma.userMeta.update({
        where: { id: user.meta.id },
        data: {
          activeTasks: updatedActiveTasks,
          completedTasks: updatedCompletedTasks
        }
      }),
      // Обновляем стрик пользователя
      prisma.user.update({
        where: { id: authUser.id },
        data: {
          streak: { increment: 1 },
          lastActiveDate: new Date()
        }
      })
    ]);

    console.log('✅ TaskWrapper завершен:', taskWrapper.task.name);

    return NextResponse.json<ApiResponse>({
      success: true,
      message: `Поздравляем! Задание "${taskWrapper.task.name}" успешно выполнено`,
      data: {
        taskWrapperId: params.id,
        taskName: taskWrapper.task.name,
        completedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Ошибка завершения TaskWrapper:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Внутренняя ошибка сервера'
    }, { status: 500 });
  }
} 