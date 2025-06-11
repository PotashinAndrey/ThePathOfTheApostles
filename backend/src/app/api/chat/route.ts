import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import { generateApostleResponse } from '../../../lib/openai';
import { requireAuth } from '../../../lib/simpleAuth';

export async function POST(request: NextRequest) {
  console.log('🚀 Backend API /chat получил запрос');
  
  try {
    // Проверяем авторизацию
    const authUser = await requireAuth(request);
    if (!authUser) {
      console.error('❌ Пользователь не авторизован');
      return NextResponse.json(
        { error: 'Требуется авторизация' },
        { status: 401 }
      );
    }

    const body = await request.json();
    console.log('📦 Тело запроса:', body);
    console.log('👤 Авторизованный пользователь:', authUser.email);
    
    const { apostleId, message, context, additionalContext } = body;

    console.log('🔍 Параметры запроса:');
    console.log('- apostleId:', apostleId);
    console.log('- message:', message);
    console.log('- context:', context);
    console.log('- userId (из токена):', authUser.id);
    console.log('- additionalContext:', additionalContext);

    if (!apostleId || !message) {
      console.error('❌ Недостает обязательных параметров');
      return NextResponse.json(
        { error: 'Отсутствует apostleId или сообщение' },
        { status: 400 }
      );
    }

    console.log('🔍 Поиск апостола в базе данных...');
    // Get apostle data
    const apostle = await prisma.apostle.findUnique({
      where: { id: apostleId },
    });

    console.log('👤 Найден апостол:', apostle ? apostle.name : 'не найден');

    if (!apostle) {
      console.error('❌ Апостол не найден в базе данных:', apostleId);
      return NextResponse.json(
        { error: 'Апостол не найден' },
        { status: 404 }
      );
    }

    // Подготавливаем расширенный контекст
    let enhancedContext = context || [];
    
    // Добавляем дополнительный контекст от приложения если есть
    if (additionalContext) {
      enhancedContext.unshift(`[Контекст приложения: ${additionalContext}]`);
    }

    console.log('🤖 Подготовлен контекст для AI:', enhancedContext);

    // Generate AI response with enhanced system prompt
    const systemPrompt = apostle.systemPrompt || `Ты - ${apostle.name}, апостол ${apostle.virtue}. Твой архетип - ${apostle.archetype}. ${apostle.personality}`;
    
    console.log('📝 System prompt:', systemPrompt);
    console.log('🔄 Отправляем запрос к OpenAI...');
    
    const aiResponse = await generateApostleResponse(
      apostleId,
      message,
      enhancedContext,
      systemPrompt
    );

    console.log('✅ Получен ответ от OpenAI:', aiResponse);

    // Сохраняем сообщения в базу данных
    console.log('💾 Сохраняем сообщения в базу данных...');
    
    // Обновляем currentApostleId пользователя
    await prisma.user.update({
      where: { id: authUser.id },
      data: { 
        lastActiveDate: new Date(),
        currentApostleId: apostleId
      }
    });

    // Сохраняем сообщения
    await prisma.chatMessage.createMany({
      data: [
        {
          userId: authUser.id,
          apostleId,
          role: 'user',
          content: message,
        },
        {
          userId: authUser.id,
          apostleId,
          role: 'assistant',
          content: aiResponse,
        },
      ],
    });
    console.log('✅ Сообщения сохранены в базе данных');

    const response = {
      message: aiResponse,
      apostleId,
      timestamp: new Date().toISOString(),
    };

    console.log('📤 Отправляем ответ клиенту:', response);

    return NextResponse.json(response);
  } catch (error) {
    console.error('❌ Критическая ошибка в Chat API:', error);
    console.error('❌ Детали ошибки:', {
      message: (error as Error)?.message,
      stack: (error as Error)?.stack,
      name: (error as Error)?.name
    });
    
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
} 