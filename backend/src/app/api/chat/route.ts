import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import { generateApostleResponse } from '../../../lib/openai';
import { requireAuth } from '../../../lib/auth';
import { ApiResponse } from '../../../types/api';

export async function POST(request: NextRequest) {
  console.log('🚀 Backend API /chat получил запрос');
  
  try {
    // Проверяем авторизацию
    const authUser = await requireAuth(request);
    if (!authUser) {
      console.error('❌ Пользователь не авторизован');
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Требуется авторизация'
      }, { status: 401 });
    }

    const body = await request.json();
    console.log('📦 Тело запроса:', body);
    console.log('👤 Авторизованный пользователь:', authUser.email);
    
    const { apostleId, message, context, additionalContext, chatId } = body;

    console.log('🔍 Параметры запроса:');
    console.log('- apostleId:', apostleId);
    console.log('- message:', message);
    console.log('- context:', context);
    console.log('- chatId:', chatId);
    console.log('- userId (из токена):', authUser.id);
    console.log('- additionalContext:', additionalContext);

    if (!apostleId || !message) {
      console.error('❌ Недостает обязательных параметров');
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Отсутствует apostleId или сообщение'
      }, { status: 400 });
    }

    console.log('🔍 Поиск апостола в базе данных...');
    // Get apostle data
    const apostle = await prisma.apostle.findUnique({
      where: { id: apostleId },
      include: {
        virtue: true
      }
    });

    console.log('👤 Найден апостол:', apostle ? apostle.name : 'не найден');

    if (!apostle) {
      console.error('❌ Апостол не найден в базе данных:', apostleId);
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Апостол не найден'
      }, { status: 404 });
    }

    // Найти или создать чат
    let chat;
    if (chatId) {
      // Проверяем, что чат принадлежит пользователю
      chat = await prisma.chat.findFirst({
        where: {
          id: chatId,
          userId: authUser.id
        }
      });
      
      if (!chat) {
        console.error('❌ Чат не найден или не принадлежит пользователю');
        return NextResponse.json<ApiResponse>({
          success: false,
          error: 'Чат не найден'
        }, { status: 404 });
      }
    } else {
      // Создаем новый чат
      chat = await prisma.chat.create({
        data: {
          name: `Беседа с ${apostle.name}`,
          userId: authUser.id,
          apostleId: apostleId
        }
      });
      console.log('✅ Создан новый чат:', chat.id);
    }

    // Подготавливаем расширенный контекст
    let enhancedContext = context || [];
    
    // Добавляем дополнительный контекст от приложения если есть
    if (additionalContext) {
      enhancedContext.unshift(`[Контекст приложения: ${additionalContext}]`);
    }

    console.log('🤖 Подготовлен контекст для AI:', enhancedContext);

    // Generate AI response with enhanced system prompt
    const systemPrompt = apostle.systemPrompt || `Ты - ${apostle.name}, апостол ${apostle.virtue?.name || 'мудрости'}. Твой архетип - ${apostle.archetype}. ${apostle.personality}`;
    
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
    
    // Обновляем lastActiveDate пользователя
    await prisma.user.update({
      where: { id: authUser.id },
      data: { 
        lastActiveDate: new Date()
      }
    });

    // Сохраняем сообщения в чат
    await prisma.chatMessage.createMany({
      data: [
        {
          chatId: chat.id,
          apostleId: apostleId,
          sender: 'USER',
          content: message,
        },
        {
          chatId: chat.id,
          apostleId: apostleId,
          sender: 'APOSTLE',
          content: aiResponse,
        },
      ],
    });
    console.log('✅ Сообщения сохранены в базе данных');

    const response = {
      success: true,
      data: {
        message: aiResponse,
        apostleId,
        chatId: chat.id,
        timestamp: new Date().toISOString(),
      }
    };

    console.log('📤 Отправляем ответ клиенту:', response);

    return NextResponse.json<ApiResponse>(response);
  } catch (error) {
    console.error('❌ Критическая ошибка в Chat API:', error);
    console.error('❌ Детали ошибки:', {
      message: (error as Error)?.message,
      stack: (error as Error)?.stack,
      name: (error as Error)?.name
    });
    
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Внутренняя ошибка сервера'
    }, { status: 500 });
  }
} 