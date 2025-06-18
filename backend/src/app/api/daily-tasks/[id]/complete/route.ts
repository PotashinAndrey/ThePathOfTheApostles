import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '../../../../../lib/auth';
import { prisma } from '../../../../../lib/prisma';
import { ApiResponse, CompleteDailyTaskRequest } from '../../../../../types/api';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log(`🎯 Завершение ежедневного задания: ${params.id}`);

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
    const body = await request.json() as CompleteDailyTaskRequest;
    const { content, notes } = body;

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
          status: 'COMPLETED',
          activatedAt: new Date(),
          completedAt: new Date(),
          content: content || '',
          notes: notes || ''
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
          status: 'COMPLETED',
          completedAt: new Date(),
          content: content || userDailyTask.content,
          notes: notes || userDailyTask.notes
        }
      });
    }

    console.log('✅ Задание отмечено как выполненное');

    // Активируем следующее задание
    await activateNextTask(user.id, dailyTask.apostleId, dailyTask.dayNumber);

    // Обновляем streak пользователя
    await updateUserStreak(user.id);

    return NextResponse.json<ApiResponse>({
      success: true,
      message: 'Task completed successfully'
    });

  } catch (error) {
    console.error('❌ Ошибка завершения задания:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// Вспомогательная функция для активации следующего задания
async function activateNextTask(userId: string, apostleId: string, currentDay: number) {
  try {
    console.log(`🔄 Активация следующего задания для апостола ${apostleId}, текущий день: ${currentDay}`);

    // Определяем следующий день
    const nextDay = currentDay + 1;
    
    if (nextDay <= 7) {
      // Ищем следующее задание этого же апостола
      const nextDailyTask = await prisma.dailyTask.findFirst({
        where: {
          apostleId: apostleId,
          dayNumber: nextDay
        }
      });

      if (nextDailyTask) {
        // Создаем или обновляем UserDailyTask для следующего задания
        await prisma.userDailyTask.upsert({
          where: {
            userId_dailyTaskId: {
              userId: userId,
              dailyTaskId: nextDailyTask.id
            }
          },
          update: {
            status: 'ACTIVE',
            activatedAt: new Date()
          },
          create: {
            userId: userId,
            dailyTaskId: nextDailyTask.id,
            status: 'ACTIVE',
            activatedAt: new Date()
          }
        });

        console.log(`✅ Активировано следующее задание: день ${nextDay}`);
      }
    } else {
      // Если это был последний день (7), можно активировать первое задание следующего апостола
      console.log('🎉 Неделя апостола завершена! Можно активировать следующего апостола.');
      
      // TODO: Здесь можно добавить логику перехода к следующему апостолу
      // Пока что просто логируем
    }

  } catch (error) {
    console.error('❌ Ошибка активации следующего задания:', error);
  }
}

// Вспомогательная функция для обновления streak пользователя
async function updateUserStreak(userId: string) {
  try {
    console.log(`📈 Обновление streak для пользователя: ${userId}`);

    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      console.error('❌ Пользователь не найден для обновления streak');
      return;
    }

    // Проверяем, выполнял ли пользователь задания вчера
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);

    const tomorrowYesterday = new Date(yesterday);
    tomorrowYesterday.setDate(tomorrowYesterday.getDate() + 1);

    const completedYesterday = await prisma.userDailyTask.findFirst({
      where: {
        userId: userId,
        status: 'COMPLETED',
        completedAt: {
          gte: yesterday,
          lt: tomorrowYesterday
        }
      }
    });

    // Обновляем streak
    const newStreak = completedYesterday ? user.streak + 1 : 1;

    await prisma.user.update({
      where: { id: userId },
      data: {
        streak: newStreak,
        lastActiveDate: new Date()
      }
    });

    console.log(`✅ Streak обновлен: ${newStreak} дней`);

  } catch (error) {
    console.error('❌ Ошибка обновления streak:', error);
  }
} 