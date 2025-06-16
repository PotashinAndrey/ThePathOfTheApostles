import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '../../../../lib/auth';
import { prisma } from '../../../../lib/prisma';
import { ChatInfo, ChatMessageInfo, ApiResponse } from '../../../../types/api';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  console.log('🚀 Backend API /chats/[id] получил запрос для чата:', params.id);
  
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

    // Получаем параметры пагинации
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    
    console.log('📄 Параметры пагинации:', { page, limit });

    // Получаем чат только если он принадлежит пользователю
    const chat = await prisma.chat.findFirst({
      where: { 
        id: params.id,
        userId: authUser.id
      },
      include: {
        apostle: {
          include: {
            virtue: true
          }
        },
        path: true,
        currentChallenge: true
      }
    });

    if (!chat) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Чат не найден'
      }, { status: 404 });
    }

    // Получаем общее количество сообщений для правильной пагинации
    const totalMessages = await prisma.chatMessage.count({
      where: { chatId: params.id }
    });

    // Вычисляем offset для пагинации (последние сообщения сначала)
    const offset = Math.max(0, totalMessages - (page * limit));
    const take = Math.min(limit, totalMessages - offset);

    console.log('📊 Статистика сообщений:', {
      totalMessages,
      page,
      limit,
      offset,
      take
    });

    // Получаем сообщения с правильной пагинацией
    const messages = await prisma.chatMessage.findMany({
      where: { chatId: params.id },
      orderBy: { createdAt: 'asc' }, // Сортируем по возрастанию для правильной пагинации
      skip: offset,
      take: take,
      include: {
        relatedChallenge: true
      }
    });

    // Преобразуем сообщения в формат API
    const chatMessages: ChatMessageInfo[] = messages.map(message => ({
      id: message.id,
      sender: message.sender,
      content: message.content,
      voiceUrl: message.voiceUrl,
      createdAt: message.createdAt,
      metadata: message.metadata
    }));

    const chatInfo: ChatInfo = {
      id: chat.id,
      name: chat.name,
      apostle: {
        id: chat.apostle.id,
        name: chat.apostle.name,
        title: chat.apostle.title,
        description: chat.apostle.description,
        archetype: chat.apostle.archetype,
        personality: chat.apostle.personality,
        icon: chat.apostle.icon,
        color: chat.apostle.color,
        virtue: chat.apostle.virtue ? {
          id: chat.apostle.virtue.id,
          name: chat.apostle.virtue.name,
          description: chat.apostle.virtue.description
        } : undefined
      },
      lastMessage: chatMessages[0],
      unreadCount: 0,
      path: chat.path ? {
        id: chat.path.id,
        name: chat.path.name,
        description: chat.path.description,
        icon: chat.path.icon,
        progress: 0,
        totalChallenges: 0,
        completedChallenges: 0,
        challenges: []
      } : undefined,
      currentChallenge: chat.currentChallenge ? {
        id: chat.currentChallenge.id,
        name: chat.currentChallenge.name,
        description: chat.currentChallenge.description,
        icon: chat.currentChallenge.icon,
        apostle: {
          id: chat.apostle.id,
          name: chat.apostle.name,
          title: chat.apostle.title,
          description: chat.apostle.description,
          archetype: chat.apostle.archetype,
          personality: chat.apostle.personality,
          icon: chat.apostle.icon,
          color: chat.apostle.color,
          virtue: chat.apostle.virtue ? {
            id: chat.apostle.virtue.id,
            name: chat.apostle.virtue.name,
            description: chat.apostle.virtue.description
          } : undefined
        },
        isCompleted: false,
        isActive: true
      } : undefined
    };

    console.log('✅ Получен чат с сообщениями:', messages.length);
    
    return NextResponse.json<ApiResponse<{
      chat: ChatInfo;
      messages: ChatMessageInfo[];
      pagination: {
        page: number;
        limit: number;
        hasMore: boolean;
      };
    }>>({
      success: true,
      data: {
        chat: chatInfo,
        messages: chatMessages,
        pagination: {
          page,
          limit,
          hasMore: offset > 0
        }
      }
    });

  } catch (error) {
    console.error('❌ Ошибка получения чата:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Внутренняя ошибка сервера'
    }, { status: 500 });
  }
} 