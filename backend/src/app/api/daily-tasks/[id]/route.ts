import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '../../../../lib/auth';
import { prisma } from '../../../../lib/prisma';
import { DailyTaskInfo, ApiResponse } from '../../../../types/api';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log(`🎯 Получение ежедневного задания: ${params.id}`);

    // Проверяем авторизацию
    const user = await requireAuth(request);
    if (!user) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Пока возвращаем mock данные
    const mockTask: DailyTaskInfo = {
      id: params.id,
      name: 'Принятие вызова',
      description: 'Найди одну привычку, которая тебе мешает, и откажись от неё на один день.',
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
      motivationalPhrase: 'Путь в тысячу миль начинается с одного шага. Сделай его сегодня.',
    };

    console.log('✅ Возвращаем mock данные для задания');

    return NextResponse.json<ApiResponse<DailyTaskInfo>>({
      success: true,
      data: mockTask,
    });

  } catch (error) {
    console.error('❌ Ошибка получения задания:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 