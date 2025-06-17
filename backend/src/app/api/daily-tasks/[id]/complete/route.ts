import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '../../../../../lib/auth';
import { prisma } from '../../../../../lib/prisma';
import { ApiResponse } from '../../../../../types/api';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log(`✅ Завершение ежедневного задания: ${params.id}`);

    // Проверяем авторизацию
    const user = await requireAuth(request);
    if (!user) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { content, notes } = body;

    console.log(`👤 Пользователь ${user.email} завершает задание`);
    console.log(`📝 Контент: ${content}`);

    // TODO: Сохранить в БД результат выполнения задания
    // await prisma.userDailyTask.update({
    //   where: {
    //     userId_dailyTaskId: {
    //       userId: user.id,
    //       dailyTaskId: params.id
    //     }
    //   },
    //   data: {
    //     status: 'COMPLETED',
    //     completedAt: new Date(),
    //     content,
    //     notes
    //   }
    // });

    console.log('✅ Задание помечено как выполненное');

    return NextResponse.json<ApiResponse>({
      success: true,
      message: 'Задание успешно завершено',
    });

  } catch (error) {
    console.error('❌ Ошибка завершения задания:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 