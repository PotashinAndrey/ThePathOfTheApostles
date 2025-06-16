import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '../../../../../lib/auth';
import { prisma } from '../../../../../lib/prisma';
import { generateApostleResponse } from '../../../../../lib/openai';
import { ChatMessageInfo, ApiResponse, SendMessageRequest } from '../../../../../types/api';

// POST /api/chats/[id]/messages - отправка сообщения в чат
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  console.log('🚀 Backend API /chats/[id]/messages получил запрос');
  
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

    const { id: chatId } = params;
    const body: SendMessageRequest = await request.json();
    const { content, voiceUrl } = body;

    console.log('📥 Отправка сообщения в чат:', chatId);
    console.log('👤 Пользователь:', authUser.email);
    console.log('💬 Содержимое:', content?.substring(0, 100) + '...');

    if (!content?.trim()) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Сообщение не может быть пустым'
      }, { status: 400 });
    }

    // Проверяем, что чат существует и принадлежит пользователю
    const chat = await prisma.chat.findFirst({
      where: {
        id: chatId,
        userId: authUser.id
      },
      include: {
        apostle: {
          include: {
            virtue: true
          }
        }
      }
    });

    if (!chat) {
      console.error('❌ Чат не найден или не принадлежит пользователю');
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Чат не найден'
      }, { status: 404 });
    }

    console.log('✅ Чат найден:', chat.name, 'с апостолом:', chat.apostle.name);

    // Получаем последние несколько сообщений для контекста
    const recentMessages = await prisma.chatMessage.findMany({
      where: { chatId },
      orderBy: { createdAt: 'desc' },
      take: 5, // Последние 5 сообщений для контекста
    });

    // Подготавливаем контекст для AI
    const context = recentMessages
      .reverse() // Сортируем в хронологическом порядке
      .map(msg => `${msg.sender === 'USER' ? 'user' : 'assistant'}: ${msg.content}`);

    console.log('🧠 Контекст для AI:', context.length, 'сообщений');

    // Сохраняем пользовательское сообщение
    const userMessage = await prisma.chatMessage.create({
      data: {
        chatId,
        apostleId: chat.apostleId,
        sender: 'USER',
        content: content.trim(),
        voiceUrl: voiceUrl || null,
      }
    });

    console.log('💾 Пользовательское сообщение сохранено:', userMessage.id);

    // Генерируем ответ апостола
    const systemPrompt = chat.apostle.systemPrompt || 
      `Ты - ${chat.apostle.name}, апостол ${chat.apostle.virtue?.name || 'мудрости'}. Твой архетип - ${chat.apostle.archetype}. ${chat.apostle.personality}`;
    
    console.log('🤖 Генерируем ответ апостола...');
    
    const aiResponse = await generateApostleResponse(
      chat.apostle.id,
      content.trim(),
      context,
      systemPrompt
    );

    console.log('✅ Получен ответ от AI:', aiResponse.substring(0, 100) + '...');

    // Сохраняем ответ апостола
    const apostleMessage = await prisma.chatMessage.create({
      data: {
        chatId,
        apostleId: chat.apostleId,
        sender: 'APOSTLE',
        content: aiResponse,
      }
    });

    console.log('💾 Ответ апостола сохранен:', apostleMessage.id);

    // Обновляем lastActiveDate пользователя
    await prisma.user.update({
      where: { id: authUser.id },
      data: { lastActiveDate: new Date() }
    });

    // Возвращаем ответ апостола
    const result: ChatMessageInfo = {
      id: apostleMessage.id,
      sender: apostleMessage.sender,
      content: apostleMessage.content,
      voiceUrl: apostleMessage.voiceUrl,
      createdAt: apostleMessage.createdAt,
      metadata: apostleMessage.metadata
    };

    console.log('📤 Отправляем ответ клиенту');

    return NextResponse.json<ApiResponse<ChatMessageInfo>>({
      success: true,
      data: result,
      message: 'Сообщение отправлено'
    }, { status: 201 });

  } catch (error) {
    console.error('❌ Ошибка отправки сообщения:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Внутренняя ошибка сервера'
    }, { status: 500 });
  }
} 