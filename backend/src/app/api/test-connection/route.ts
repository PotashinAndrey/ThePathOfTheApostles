import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

export async function GET() {
  try {
    console.log('🔍 Тестируем подключение к базе данных...');
    
    // Проверяем подключение
    await prisma.$connect();
    console.log('✅ Prisma подключен');
    
    // Получаем список таблиц
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;
    
    console.log('📋 Таблицы:', tables);
    
    // Пробуем получить количество записей в таблице apostles
    const count = await prisma.apostle.count();
    console.log('📊 Количество записей в apostles:', count);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Подключение работает',
      tables,
      apostleCount: count
    });
  } catch (error: any) {
    console.error('❌ Ошибка подключения:', error);
    return NextResponse.json(
      { error: 'Ошибка подключения к базе данных', details: error.message },
      { status: 500 }
    );
  }
} 