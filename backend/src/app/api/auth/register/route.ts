import { NextRequest, NextResponse } from 'next/server';
import { 
  validateEmail, 
  validatePassword, 
  createUserWithProgress, 
  generateToken 
} from '../../../../lib/auth';
import { prisma } from '../../../../lib/prisma';
import { RegisterRequest, AuthResponse, ApiResponse } from '../../../../types/api';

export async function POST(request: NextRequest) {
  console.log('🚀 Backend API /auth/register получил запрос');
  
  try {
    const body: RegisterRequest = await request.json();
    console.log('📦 Тело запроса регистрации:', { ...body, password: '[СКРЫТО]', confirmPassword: '[СКРЫТО]' });
    
    const { email, password, confirmPassword, name } = body;

    // Валидация входных данных
    if (!email || !password || !confirmPassword || !name) {
      console.error('❌ Недостает обязательных параметров');
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Недостает обязательных параметров: email, password, confirmPassword, name'
      }, { status: 400 });
    }

    // Проверка совпадения паролей
    if (password !== confirmPassword) {
      console.error('❌ Пароли не совпадают');
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Пароли не совпадают'
      }, { status: 400 });
    }

    // Валидация email
    if (!validateEmail(email)) {
      console.error('❌ Невалидный email');
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Невалидный email адрес'
      }, { status: 400 });
    }

    // Валидация пароля
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      console.error('❌ Невалидный пароль:', passwordValidation.errors);
      return NextResponse.json<ApiResponse>({
        success: false,
        error: passwordValidation.errors.join(', ')
      }, { status: 400 });
    }

    // Валидация имени
    if (name.length < 2 || name.length > 50) {
      console.error('❌ Невалидное имя');
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Имя должно содержать от 2 до 50 символов'
      }, { status: 400 });
    }

    // Проверяем что пользователь с таким email не существует
    console.log('🔍 Проверка существования пользователя с email:', email);
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      console.error('❌ Пользователь с таким email уже существует');
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Пользователь с таким email уже существует'
      }, { status: 409 });
    }

    // Создаем пользователя с прогрессом
    console.log('👤 Создание пользователя в БД...');
    const user = await createUserWithProgress({
      email,
      name,
      password
    });

    console.log('✅ Пользователь создан:', user.email);

    // Генерируем токен
    const token = generateToken(user);

    // Возвращаем данные пользователя
    const response: ApiResponse<AuthResponse> = {
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          joinDate: user.joinDate,
          lastActiveDate: user.joinDate,
          streak: 0,
          status: user.status,
        },
        message: 'Пользователь успешно зарегистрирован'
      },
      message: 'Пользователь успешно зарегистрирован'
    };

    return NextResponse.json(response, { status: 201 });

  } catch (error) {
    console.error('❌ Ошибка регистрации:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Внутренняя ошибка сервера'
    }, { status: 500 });
  }
} 