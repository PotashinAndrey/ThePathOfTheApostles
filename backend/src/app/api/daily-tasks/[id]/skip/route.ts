import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '../../../../../lib/auth';
import { prisma } from '../../../../../lib/prisma';
import { ApiResponse, SkipDailyTaskRequest } from '../../../../../types/api';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log(`⏭️ Пропуск ежедневного задания: ${params.id}`);

    // Проверяем авторизацию
    const user = await requireAuth(request);
    if (!user) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log(`👤 Пользователь: ${user.email}`);

    // Получаем данные запроса
    const body = await request.json() as SkipDailyTaskRequest;
    const { reason } = body;

    // Ищем задание по ID
    const dailyTask = await prisma.dailyTask.findUnique({
      where: { id: params.id },
      include: {
        apostle: true
      }
    });

    if (!dailyTask) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Daily task not found' },
        { status: 404 }
      );
    }

    // Ищем или создаем UserDailyTask для этого пользователя и задания
    let userDailyTask = await prisma.userDailyTask.findUnique({
      where: {
        userId_dailyTaskId: {
          userId: user.id,
          dailyTaskId: params.id
        }
      }
    });

    if (!userDailyTask) {
      // Создаем новую запись, если её нет
      userDailyTask = await prisma.userDailyTask.create({
        data: {
          userId: user.id,
          dailyTaskId: params.id,
          status: 'SKIPPED',
          activatedAt: new Date(),
          skippedAt: new Date(),
          notes: reason || 'Пропущено пользователем'
        }
      });
    } else {
      // Обновляем существующую запись
      userDailyTask = await prisma.userDailyTask.update({
        where: {
          userId_dailyTaskId: {
            userId: user.id,
            dailyTaskId: params.id
          }
        },
        data: {
          status: 'SKIPPED',
          skippedAt: new Date(),
          notes: reason || userDailyTask.notes || 'Пропущено пользователем'
        }
      });
    }

    console.log('✅ Задание отмечено как пропущенное');

    return NextResponse.json<ApiResponse>({
      success: true,
      message: 'Task skipped successfully'
    });

  } catch (error) {
    console.error('❌ Ошибка пропуска задания:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 