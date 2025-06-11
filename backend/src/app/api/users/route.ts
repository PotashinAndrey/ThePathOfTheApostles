import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

// GET /api/users?id=userId - получить пользователя
export async function GET(request: NextRequest) {
  console.log('🚀 Backend API /users GET получил запрос');
  
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('id');
    
    console.log('🔍 Запрос пользователя с ID:', userId);

    if (!userId) {
      console.error('❌ Не указан ID пользователя');
      return NextResponse.json(
        { error: 'Не указан ID пользователя' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        chatMessages: {
          orderBy: { timestamp: 'desc' },
          take: 10, // Последние 10 сообщений
        },
        missions: {
          orderBy: { startDate: 'desc' },
          take: 5, // Последние 5 миссий
        }
      }
    });

    if (!user) {
      console.log('👤 Пользователь не найден:', userId);
      return NextResponse.json(
        { error: 'Пользователь не найден' },
        { status: 404 }
      );
    }

    console.log('✅ Пользователь найден:', user.name);
    return NextResponse.json(user);
    
  } catch (error) {
    console.error('❌ Ошибка в GET /users:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}

// POST /api/users - создать или обновить пользователя
export async function POST(request: NextRequest) {
  console.log('🚀 Backend API /users POST получил запрос');
  
  try {
    const body = await request.json();
    console.log('📦 Тело запроса:', body);
    
    const { id, email, name, currentApostleId } = body;

    if (!id || !email || !name) {
      console.error('❌ Недостает обязательных параметров');
      return NextResponse.json(
        { error: 'Недостает обязательных параметров: id, email, name' },
        { status: 400 }
      );
    }

    console.log('👤 Создаем/обновляем пользователя:', { id, email, name });

    // Используем upsert для создания или обновления
    const user = await prisma.user.upsert({
      where: { id },
      update: {
        name,
        currentApostleId,
        lastActiveDate: new Date(),
      },
      create: {
        id,
        email,
        name,
        currentApostleId,
        joinDate: new Date(),
        lastActiveDate: new Date(),
      },
    });

    console.log('✅ Пользователь создан/обновлен:', user);
    return NextResponse.json(user);
    
  } catch (error) {
    console.error('❌ Ошибка в POST /users:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
} 