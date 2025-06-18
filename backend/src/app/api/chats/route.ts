import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '../../../lib/auth';
import { prisma } from '../../../lib/prisma';
import { ChatInfo, ApiResponse } from '../../../types/api';

export async function GET(request: NextRequest) {
  console.log('🚀 Backend API /chats получил запрос');
  
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

    console.log('👤 Получение чатов для пользователя:', authUser.email);

    // Получаем чаты пользователя
    const chats = await prisma.chat.findMany({
      where: { userId: authUser.id },
      include: {
        apostle: {
          include: {
            virtue: true
          }
        },
        path: true,
        currentChallenge: true,
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      },
      orderBy: {
        // Сортируем по дате последнего сообщения
        messages: {
          _count: 'desc'
        }
      }
    });

    // Преобразуем в формат ответа
    const chatInfos: ChatInfo[] = chats.map(chat => ({
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
      lastMessage: chat.messages[0] ? {
        id: chat.messages[0].id,
        sender: chat.messages[0].sender,
        content: chat.messages[0].content,
        voiceUrl: chat.messages[0].voiceUrl,
        createdAt: chat.messages[0].createdAt,
        metadata: chat.messages[0].metadata
      } : undefined,
      unreadCount: 0, // Пока что 0, потом можно добавить логику подсчета
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
        totalTasks: 0,        // TODO: подсчитать реальное количество заданий
        completedTasks: 0,    // TODO: подсчитать выполненные задания
        isCompleted: false,
        isActive: true,
        tasks: []            // TODO: загрузить TaskWrapper для этого Challenge
      } : undefined
    }));

    console.log('✅ Получены чаты пользователя:', chatInfos.length);
    
    return NextResponse.json<ApiResponse<ChatInfo[]>>({
      success: true,
      data: chatInfos
    });

  } catch (error) {
    console.error('❌ Ошибка получения чатов:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Внутренняя ошибка сервера'
    }, { status: 500 });
  }
}

// POST /api/chats - создать новый чат
export async function POST(request: NextRequest) {
  console.log('🚀 Backend API /chats POST получил запрос');
  
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
    const { apostleId, pathId, challengeId } = body;

    if (!apostleId) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Не указан ID апостола'
      }, { status: 400 });
    }

    // Проверяем существование апостола
    const apostle = await prisma.apostle.findUnique({
      where: { id: apostleId }
    });

    if (!apostle) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Апостол не найден'
      }, { status: 404 });
    }

    // Создаем чат
    const chat = await prisma.chat.create({
      data: {
        name: `Беседа с ${apostle.name}`,
        userId: authUser.id,
        apostleId: apostleId,
        pathId: pathId || null,
        currentChallengeId: challengeId || null
      },
      include: {
        apostle: {
          include: {
            virtue: true
          }
        }
      }
    });

    console.log('✅ Создан новый чат:', chat.id);

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
      unreadCount: 0
    };

    return NextResponse.json<ApiResponse<ChatInfo>>({
      success: true,
      data: chatInfo,
      message: 'Чат успешно создан'
    }, { status: 201 });

  } catch (error) {
    console.error('❌ Ошибка создания чата:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Внутренняя ошибка сервера'
    }, { status: 500 });
  }
} 