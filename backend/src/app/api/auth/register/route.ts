import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  console.log('🚀 Backend API /auth/register получил запрос');
  
  try {
    const body = await request.json();
    console.log('📦 Тело запроса регистрации:', { ...body, password: '[СКРЫТО]' });
    
    const { email, password, name } = body;

    // Валидация входных данных
    if (!email || !password || !name) {
      console.error('❌ Недостает обязательных параметров');
      return NextResponse.json(
        { error: 'Недостает обязательных параметров: email, password, name' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      console.error('❌ Пароль слишком короткий');
      return NextResponse.json(
        { error: 'Пароль должен содержать минимум 6 символов' },
        { status: 400 }
      );
    }

    // Проверяем что пользователь с таким email не существует
    console.log('🔍 Проверка существования пользователя с email:', email);
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      console.error('❌ Пользователь с таким email уже существует');
      return NextResponse.json(
        { error: 'Пользователь с таким email уже существует' },
        { status: 409 }
      );
    }

    // Хешируем пароль
    console.log('🔐 Хеширование пароля...');
    const saltRounds = 12;
    const salt = await bcrypt.genSalt(saltRounds);
    const passwordHash = await bcrypt.hash(password, salt);
    console.log('✅ Пароль захеширован');

    // Создаем пользователя
    console.log('👤 Создание пользователя в БД...');
    const user = await prisma.user.create({
      data: {
        email,
        name,
        passwordHash,
        salt,
        currentApostleId: 'peter', // По умолчанию назначаем Петра
      },
      select: {
        id: true,
        email: true,
        name: true,
        currentApostleId: true,
        joinDate: true,
      }
    });

    console.log('✅ Пользователь создан:', user.email);

    // Возвращаем данные пользователя (без пароля)
    return NextResponse.json({
      user,
      message: 'Пользователь успешно зарегистрирован'
    }, { status: 201 });

  } catch (error) {
    console.error('❌ Ошибка регистрации:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
} 