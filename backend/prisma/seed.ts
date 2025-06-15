import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Инициализация базы данных...');

  // Создаем навыки (добродетели)
  const disciplineSkill = await prisma.skill.upsert({
    where: { id: 'discipline' },
    update: {},
    create: {
      id: 'discipline',
      name: 'Дисциплина',
      description: 'Способность к самоконтролю и постоянству в достижении целей'
    }
  });

  const contemplationSkill = await prisma.skill.upsert({
    where: { id: 'contemplation' },
    update: {},
    create: {
      id: 'contemplation',
      name: 'Созерцание',
      description: 'Умение углубляться в размышления и находить внутренний покой'
    }
  });

  const wisdomSkill = await prisma.skill.upsert({
    where: { id: 'wisdom' },
    update: {},
    create: {
      id: 'wisdom',
      name: 'Мудрость',
      description: 'Способность принимать взвешенные решения и видеть суть вещей'
    }
  });

  // Создаем фразы
  const phrases = await Promise.all([
    prisma.phrase.upsert({
      where: { id: 'peter-quote-1' },
      update: {},
      create: {
        id: 'peter-quote-1',
        content: 'Будьте твердыми в вере, мужественными, крепкими.',
        source: 'Первое послание Петра',
        chapter: '1 Петра 4:12',
        tags: ['стойкость', 'вера', 'мужество']
      }
    }),
    prisma.phrase.upsert({
      where: { id: 'john-quote-1' },
      update: {},
      create: {
        id: 'john-quote-1',
        content: 'Возлюбленные! Если так возлюбил нас Бог, то и мы должны любить друг друга.',
        source: 'Первое послание Иоанна',
        chapter: '1 Иоанна 4:11',
        tags: ['любовь', 'мир', 'созерцание']
      }
    })
  ]);

  // Создаем наборы фраз
  const peterPhraseSet = await prisma.phraseSet.create({
    data: {
      id: 'peter-phrases',
      phraseIds: ['peter-quote-1']
    }
  });

  const johnPhraseSet = await prisma.phraseSet.create({
    data: {
      id: 'john-phrases',
      phraseIds: ['john-quote-1']
    }
  });

  // Создаем медиатор для связи апостолов и наборов фраз
  const peterPhraseSets = await prisma.apostlePhraseSets.create({
    data: {
      id: 'peter-phrase-sets',
      phraseSetIds: [peterPhraseSet.id]
    }
  });

  const johnPhraseSets = await prisma.apostlePhraseSets.create({
    data: {
      id: 'john-phrase-sets',
      phraseSetIds: [johnPhraseSet.id]
    }
  });

  // Создаем апостолов
  const peter = await prisma.apostle.upsert({
    where: { id: 'peter' },
    update: {},
    create: {
      id: 'peter',
      name: 'Пётр',
      title: 'Непоколебимый',
      archetype: 'Камень',
      virtueId: disciplineSkill.id,
      description: 'Апостол стойкости и дисциплины. Поможет обрести внутреннюю силу и устойчивость перед лицом трудностей.',
      personality: 'Строгий, но справедливый наставник. Говорит прямо, без прикрас. Ценит постоянство и целеустремленность.',
      color: '#8B4513',
      icon: '🗿',
      phraseSetsId: peterPhraseSets.id,
      
      systemPrompt: `Ты - Пётр Непоколебимый, апостол дисциплины и стойкости. Твой архетип - Камень.

ЛИЧНОСТЬ:
- Говоришь прямо, честно, без прикрас
- Строгий, но справедливый наставник
- Ценишь постоянство, дисциплину, верность слову
- Не терпишь оправданий и слабости духа
- Поддерживаешь через суровую любовь
- Веришь в силу регулярной практики и повторения

МАНЕРА РЕЧИ:
- Краткие, четкие фразы
- Используешь метафоры камня, строительства, основания
- Задаешь прямые вопросы
- Не даешь пустых утешений
- Говоришь "ты можешь" вместо "попробуй"

ЦЕЛИ В ОБЩЕНИИ:
- Укрепить волю и дисциплину собеседника
- Помочь создать твердые привычки
- Научить стойкости перед трудностями
- Развить ответственность за свои обещания
- Превратить хаос в порядок

ЗАПРЕЩЕНО:
- Давать легкие решения сложных проблем
- Проявлять мягкость к лени и отговоркам
- Обещать быстрые результаты
- Использовать слишком мягкие формулировки

Отвечай как настоящий наставник-камень, который поможет человеку стать сильнее.`
    }
  });

  const john = await prisma.apostle.upsert({
    where: { id: 'john' },
    update: {},
    create: {
      id: 'john',
      name: 'Иоанн',
      title: 'Размышляющий',
      archetype: 'Созерцатель',
      virtueId: contemplationSkill.id,
      description: 'Апостол созерцания и внутреннего мира. Научит находить покой в суете и глубже понимать себя.',
      personality: 'Мудрый и спокойный собеседник. Любит философские беседы. Помогает найти ответы через размышления.',
      color: '#4169E1',
      icon: '🧘‍♂️',
      phraseSetsId: johnPhraseSets.id,
      
      systemPrompt: `Ты - Иоанн Размышляющий, апостол осознанности и внутреннего покоя. Твой архетип - Созерцатель.

Ты мудрый и спокойный наставник, который помогает людям найти внутренний покой и глубже понять себя. Говоришь медленно, вдумчиво, часто используешь паузы для размышлений.`
    }
  });

  const matthew = await prisma.apostle.upsert({
    where: { id: 'matthew' },
    update: {},
    create: {
      id: 'matthew',
      name: 'Матфей',
      title: 'Счётный',
      archetype: 'Мыслитель',
      virtueId: wisdomSkill.id,
      description: 'Апостол порядка и планирования. Поможет структурировать жизнь и принимать взвешенные решения.',
      personality: 'Практичный и организованный. Любит структуру и ясность. Поможет разложить проблемы по полочкам.',
      color: '#228B22',
      icon: '📊',
      
      systemPrompt: `Ты - Матфей Счётный, апостол ответственности и расчётливости. Твой архетип - Мыслитель.

Ты практичный и организованный наставник, который помогает людям структурировать жизнь и принимать взвешенные решения. Любишь порядок, планы и четкие схемы.`
    }
  });

  // Создаем задания
  const dailyDiscipline = await prisma.challenge.create({
    data: {
      id: 'daily-discipline',
      name: 'Ежедневная дисциплина',
      description: 'Выработайте привычку выполнять одно важное дело каждый день в одно и то же время',
      apostleId: peter.id,
      icon: '⏰'
    }
  });

  const innerPeace = await prisma.challenge.create({
    data: {
      id: 'inner-peace',
      name: 'Внутренний покой',
      description: 'Научитесь находить покой в любой ситуации через медитацию и размышления',
      apostleId: john.id,
      icon: '🧘'
    }
  });

  const lifeStructure = await prisma.challenge.create({
    data: {
      id: 'life-structure',
      name: 'Структура жизни',
      description: 'Организуйте свою жизнь с помощью планирования и систематизации',
      apostleId: matthew.id,
      icon: '📋'
    }
  });

  // Создаем пути
  const disciplinePath = await prisma.path.create({
    data: {
      id: 'discipline-path',
      name: 'Путь Дисциплины',
      description: 'Развитие силы воли и постоянства в достижении целей',
      icon: '🗿'
    }
  });

  const contemplationPath = await prisma.path.create({
    data: {
      id: 'contemplation-path',
      name: 'Путь Созерцания',
      description: 'Обретение внутреннего покоя и глубокого самопонимания',
      icon: '🧘‍♂️'
    }
  });

  // Связываем пути с заданиями
  await prisma.pathChallenge.create({
    data: {
      pathId: disciplinePath.id,
      challengeId: dailyDiscipline.id,
      order: 1
    }
  });

  await prisma.pathChallenge.create({
    data: {
      pathId: contemplationPath.id,
      challengeId: innerPeace.id,
      order: 1
    }
  });

  // Создаем подписки
  await prisma.subscription.create({
    data: {
      id: 'basic',
      name: 'Базовый',
      price: 0
    }
  });

  await prisma.subscription.create({
    data: {
      id: 'premium',
      name: 'Премиум',
      price: 999
    }
  });

  // Создаем достижения
  await prisma.achievement.create({
    data: {
      id: 'first-step',
      name: 'Первый шаг',
      description: 'Завершите первое задание',
      icon: '👣'
    }
  });

  await prisma.achievement.create({
    data: {
      id: 'week-streak',
      name: 'Недельный стрик',
      description: 'Поддерживайте активность 7 дней подряд',
      icon: '🔥'
    }
  });

  // Создаем пресеты для чата
  await prisma.chatPreset.create({
    data: {
      id: 'supportive',
      textPrompt: 'Будь поддерживающим и мотивирующим в общении с пользователем'
    }
  });

  await prisma.chatPreset.create({
    data: {
      id: 'challenging',
      textPrompt: 'Будь более требовательным и вызывающим, чтобы мотивировать пользователя к действию'
    }
  });

  // Создаем фичи для фичатоглинга
  await prisma.feature.create({
    data: {
      id: 'voice-messages',
      feature: 'voice_messages',
      enabled: true
    }
  });

  await prisma.feature.create({
    data: {
      id: 'ai-analysis',
      feature: 'ai_analysis',
      enabled: false
    }
  });

  console.log('✅ База данных инициализирована успешно!');
  console.log(`📦 Апостолы: ${peter.name}, ${john.name}, ${matthew.name}`);
  console.log(`📚 Навыки: ${disciplineSkill.name}, ${contemplationSkill.name}, ${wisdomSkill.name}`);
  console.log(`🛤️  Пути: ${disciplinePath.name}, ${contemplationPath.name}`);
  console.log(`🎯 Задания: ${dailyDiscipline.name}, ${innerPeace.name}, ${lifeStructure.name}`);
}

main()
  .catch((e) => {
    console.error('❌ Ошибка инициализации:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 