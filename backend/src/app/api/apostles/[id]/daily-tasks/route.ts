import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '../../../../../lib/auth';
import { prisma } from '../../../../../lib/prisma';
import { DailyTaskInfo, ApiResponse } from '../../../../../types/api';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log(`🎯 Получение заданий апостола: ${params.id}`);

    // Проверяем авторизацию (можно сделать публичным, если нужно)
    const user = await requireAuth(request);
    if (!user) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Пока возвращаем mock данные для Петра
    if (params.id === 'peter') {
      const mockTasks: DailyTaskInfo[] = [
        {
          id: 'peter-day-1',
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
        },
        // Добавим еще несколько заданий для примера
        {
          id: 'peter-day-2',
          name: 'Тело - храм силы',
          description: 'Выполни простое физическое упражнение, которое требует выносливости.',
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
          dayNumber: 2,
          status: 'pending',
          createdAt: new Date(),
          motivationalPhrase: 'Тело может вынести почти всё. Это разум нужно убедить.',
        },
      ];

      console.log('✅ Возвращаем mock задания Петра');

      return NextResponse.json<ApiResponse<DailyTaskInfo[]>>({
        success: true,
        data: mockTasks,
      });
    }

    // Для других апостолов пока возвращаем пустой массив
    return NextResponse.json<ApiResponse<DailyTaskInfo[]>>({
      success: true,
      data: [],
    });

  } catch (error) {
    console.error('❌ Ошибка получения заданий апостола:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 