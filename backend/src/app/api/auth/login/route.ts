import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { generateToken, verifyPassword } from '../../../../lib/auth';
import { LoginRequest, AuthResponse, ApiResponse } from '../../../../types/api';
import { RateLimiter } from '../../../../lib/rateLimiter';

export async function POST(request: NextRequest) {
  console.log('🚀 Backend API /auth/login получил запрос');
  
  try {
    const body: LoginRequest = await request.json();
    console.log('📦 Тело запроса входа:', { ...body, password: '[СКРЫТО]' });
    
    const { email, password } = body;

    // Валидация входных данных
    if (!email || !password) {
      console.error('❌ Недостает обязательных параметров');
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Недостает обязательных параметров: email, password'
      }, { status: 400 });
    }

    // Получаем IP для rate limiting
    const clientIP = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown';

    // Проверяем rate limiting (по IP + email)
    const rateLimitKey = `${clientIP}:${email}`;
    const rateLimitCheck = RateLimiter.isAllowed(rateLimitKey);
    
    if (!rateLimitCheck.allowed) {
      console.warn('🚨 Rate limit exceeded:', { email, ip: clientIP, message: rateLimitCheck.message });
      return NextResponse.json<ApiResponse>({
        success: false,
        error: rateLimitCheck.message || 'Слишком много попыток входа'
      }, { status: 429 });
    }

    // Логируем попытку входа (для мониторинга атак)
    console.log('🔐 Попытка входа:', { 
      email, 
      ip: clientIP,
      userAgent: request.headers.get('user-agent') || 'unknown',
      timestamp: new Date().toISOString()
    });

    // Ищем пользователя по email
    console.log('🔍 Поиск пользователя с email:', email);
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        passwordHash: true,
        salt: true,
        status: true,
        joinDate: true,
        lastActiveDate: true,
        streak: true,
        avatar: true,
        currentSubscription: true
      }
    });

    // ВАЖНО: Всегда выполняем проверку пароля чтобы предотвратить timing attacks
    let isPasswordValid = false;
    
    if (user && user.status === 'ACTIVE') {
      // Проверяем реальный пароль
      console.log('🔐 Проверка пароля для существующего пользователя...');
      isPasswordValid = await verifyPassword(password, user.passwordHash, user.salt);
    } else {
      // Для несуществующих пользователей выполняем "фиктивную" проверку
      // чтобы время ответа было одинаковым
      console.log('🔐 Выполняем фиктивную проверку пароля для защиты от timing attacks...');
      const dummyHash = '$2b$10$dummyHashToPreventTimingAttacks';
      const dummySalt = '$2b$10$dummySaltToPreventTimingAttacks';
      await verifyPassword(password, dummyHash, dummySalt);
    }

    // Проверяем результат авторизации
    if (!user) {
      console.error('❌ Пользователь не найден (скрываем от злоумышленника)');
      RateLimiter.recordFailedAttempt(rateLimitKey);
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Неверные учетные данные'
      }, { status: 401 });
    }

    if (user.status !== 'ACTIVE') {
      console.error('❌ Аккаунт заблокирован');
      RateLimiter.recordFailedAttempt(rateLimitKey);
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Неверные учетные данные'
      }, { status: 401 });
    }

    if (!isPasswordValid) {
      console.error('❌ Неверный пароль (скрываем от злоумышленника)');
      RateLimiter.recordFailedAttempt(rateLimitKey);
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Неверные учетные данные'
      }, { status: 401 });
    }

    console.log('✅ Пароль верный');

    // Обновляем lastActiveDate
    await prisma.user.update({
      where: { id: user.id },
      data: { lastActiveDate: new Date() }
    });

    // Генерируем токен
    console.log('🎫 Генерация токена...');
    const token = generateToken(user);

    console.log('✅ Пользователь успешно авторизован:', user.email);

    // Сбрасываем счетчик неудачных попыток при успешном входе
    RateLimiter.recordSuccessfulLogin(rateLimitKey);

    // Возвращаем токен и данные пользователя
    const response: ApiResponse<AuthResponse> = {
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          joinDate: user.joinDate,
          currentSubscription: user.currentSubscription,
          lastActiveDate: user.lastActiveDate,
          streak: user.streak,
          avatar: user.avatar,
          status: user.status
        },
        message: 'Успешный вход в систему'
      },
      message: 'Успешный вход в систему'
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('❌ Ошибка входа:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Внутренняя ошибка сервера'
    }, { status: 500 });
  }
} 