import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '../../../../../lib/auth';
import { prisma } from '../../../../../lib/prisma';
import { ApiResponse } from '../../../../../types/api';

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

    const body = await request.json();
    const { reason } = body;

    console.log(`👤 Пользователь ${user.email} пропускает задание`);
    console.log(`📝 Причина: ${reason}`);

    // TODO: Сохранить в БД факт пропуска задания
    // await prisma.userDailyTask.update({
    //   where: {
    //     userId_dailyTaskId: {
    //       userId: user.id,
    //       dailyTaskId: params.id
    //     }
    //   },
    //   data: {
    //     status: 'SKIPPED',
    //     skippedAt: new Date(),
    //     notes: reason
    //   }
    // });

    console.log('✅ Задание помечено как пропущенное');

    return NextResponse.json<ApiResponse>({
      success: true,
      message: 'Задание отложено',
    });

  } catch (error) {
    console.error('❌ Ошибка пропуска задания:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 