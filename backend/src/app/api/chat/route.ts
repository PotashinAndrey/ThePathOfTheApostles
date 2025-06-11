import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import { generateApostleResponse } from '../../../lib/openai';

export async function POST(request: NextRequest) {
  try {
    const { apostleId, message, context, userId, additionalContext } = await request.json();

    if (!apostleId || !message) {
      return NextResponse.json(
        { error: 'Отсутствует apostleId или сообщение' },
        { status: 400 }
      );
    }

    // Get apostle data
    const apostle = await prisma.apostle.findUnique({
      where: { id: apostleId },
    });

    if (!apostle) {
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

    // Generate AI response with enhanced system prompt
    const systemPrompt = apostle.systemPrompt || `Ты - ${apostle.name}, апостол ${apostle.virtue}. Твой архетип - ${apostle.archetype}. ${apostle.personality}`;
    
    const aiResponse = await generateApostleResponse(
      apostleId,
      message,
      enhancedContext,
      systemPrompt
    );

    // Save chat message if userId is provided
    if (userId) {
      await prisma.chatMessage.createMany({
        data: [
          {
            userId,
            apostleId,
            role: 'user',
            content: message,
          },
          {
            userId,
            apostleId,
            role: 'assistant',
            content: aiResponse,
          },
        ],
      });
    }

    return NextResponse.json({
      message: aiResponse,
      apostleId,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
} 