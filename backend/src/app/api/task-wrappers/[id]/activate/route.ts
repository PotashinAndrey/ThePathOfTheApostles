import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '../../../../../lib/auth';
import { prisma } from '../../../../../lib/prisma';
import { ApiResponse } from '../../../../../types/api';

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

    // Добавляем в список активных
    const updatedActiveTasks = [...currentActiveTasks, params.id];

    await prisma.userMeta.update({
      where: { id: user.meta.id },
      data: {
        activeTasks: updatedActiveTasks
      }
    });

    console.log('✅ TaskWrapper активирован:', taskWrapper.task.name);

    return NextResponse.json<ApiResponse>({
      success: true,
      message: `Задание "${taskWrapper.task.name}" успешно активировано`,
      data: {
        taskWrapperId: params.id,
        taskName: taskWrapper.task.name
      }
    });

  } catch (error) {
    console.error('❌ Ошибка активации TaskWrapper:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Внутренняя ошибка сервера'
    }, { status: 500 });
  }
} 