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

    // Возвращаем mock данные с активным заданием
    const mockCurrentTask: any = {
      id: 'peter-day-1',
      name: 'Принятие вызова',
      description: 'Найди одну привычку, которая тебе мешает, и откажись от неё на один день. Это может быть проверка соцсетей, сладости или что-то другое. Главное - осознанно выбрать и продержаться.',
      apostleId: 'peter',
      apostle: {
        id: 'peter',
        name: 'Пётр',
        title: 'Апостол стойкости',
        description: 'Учитель внутренней силы',
        archetype: 'Стойкий',
        personality: 'Мудрый наставник',
        icon: '🗿',
        color: '#8B4513',
      },
      dayNumber: 1,
      status: 'active',
      createdAt: new Date(),
      activatedAt: new Date(),
      motivationalPhrase: 'Путь в тысячу миль начинается с одного шага. Сделай его сегодня.',
    };

    const mockResponse: ActiveTaskResponse = {
      hasActiveTask: true,
      currentTask: mockCurrentTask,
      nextTask: undefined,
      apostleProgress: {
        apostleId: 'peter',
        currentDay: 1,
        completedTasks: 0,
        totalTasks: 7,
      },
    };

    console.log('✅ Возвращаем mock данные для активного задания');

    return NextResponse.json<ApiResponse<ActiveTaskResponse>>({
      success: true,
      data: mockResponse,
    });

  } catch (error) {
    console.error('❌ Ошибка получения активного задания:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 