import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prisma';
import { PETER_WEEKLY_MISSION } from '../../../../../constants/peterWeeklyTasks';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const apostleId = params.id;

    // Проверяем, существует ли апостол
    const apostle = await prisma.apostle.findUnique({
      where: { id: apostleId },
    });

    if (!apostle) {
      return NextResponse.json(
        { error: 'Апостол не найден' },
        { status: 404 }
      );
    }

    // Пока что возвращаем статичные задания для Петра
    // В будущем можно будет загружать из базы данных
    if (apostleId === 'peter') {
      return NextResponse.json(PETER_WEEKLY_MISSION);
    }

    // Для других апостолов возвращаем пустой массив
    return NextResponse.json({
      id: `${apostleId}_weekly`,
      title: `Неделя с ${apostle.name}`,
      description: 'Недельные задания скоро будут доступны',
      goal: 'Развитие духовных качеств',
      duration: '7 дней',
      tasks: [],
      finalReflection: 'Поздравляем с завершением недели!',
      completionReward: 'Новые возможности открыты'
    });

  } catch (error) {
    console.error('Weekly tasks API error:', error);
    return NextResponse.json(
      { error: 'Ошибка при получении недельных заданий' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const apostleId = params.id;
    const { userId, taskId, completed } = await request.json();

    if (!userId || !taskId) {
      return NextResponse.json(
        { error: 'Отсутствуют обязательные параметры' },
        { status: 400 }
      );
    }

    // Здесь можно добавить логику сохранения прогресса выполнения задания
    // Пока что просто возвращаем успешный ответ
    
    return NextResponse.json({
      success: true,
      taskId,
      completed,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Update task progress error:', error);
    return NextResponse.json(
      { error: 'Ошибка при обновлении прогресса задания' },
      { status: 500 }
    );
  }
} 