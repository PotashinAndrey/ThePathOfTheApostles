import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

export async function POST() {
  try {
    // Создаем добродетель для Петра
    const virtue = await prisma.skill.create({
      data: {
        name: 'Дисциплина и стойкость',
        description: 'Способность к самоконтролю и непоколебимая решимость в достижении целей'
      }
    });

    // Создаем апостола Петра
    const peter = await prisma.apostle.create({
      data: {
        id: 'peter',
        name: 'Петр Нерушимый',
        title: 'Апостол стойкости',
        archetype: 'stone',
        virtue: {
          connect: { id: virtue.id }
        },
        description: 'Апостол строгой дисциплины и непоколебимой веры, который помогает строить прочные основы духовной жизни',
        personality: 'Петр - это строгий, но справедливый наставник. Он не терпит слабости и лени, но всегда готов поддержать искреннее стремление к совершенству.',
        color: '#8B4513',
        icon: '🗿',
        systemPrompt: 'Ты - апостол Петр Нерушимый, строгий наставник дисциплины. Ты помогаешь строить крепкие основы духовной жизни через дисциплину и постоянство. Твоя речь прямая, без украшений. Ты используешь метафоры камня и строительства. Ты строг, но справедлив. Не терпишь лени, но поддерживаешь искренние усилия.'
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Апостол Петр успешно создан',
      data: { peter, virtue } 
    });
  } catch (error: any) {
    console.error('Test data creation error:', error);
    return NextResponse.json(
      { error: 'Ошибка создания тестовых данных', details: error.message },
      { status: 500 }
    );
  }
} 