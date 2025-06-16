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

  // Добавляем новые навыки для остальных апостолов
  const compassionSkill = await prisma.skill.upsert({
    where: { id: 'compassion' },
    update: {},
    create: {
      id: 'compassion',
      name: 'Сострадание',
      description: 'Способность к эмпатии, пониманию и принятию других людей'
    }
  });

  const puritySkill = await prisma.skill.upsert({
    where: { id: 'purity' },
    update: {},
    create: {
      id: 'purity',
      name: 'Чистота намерений',
      description: 'Простота и ясность в мыслях, поступках и желаниях'
    }
  });

  const curiositySkill = await prisma.skill.upsert({
    where: { id: 'curiosity' },
    update: {},
    create: {
      id: 'curiosity',
      name: 'Любознательность',
      description: 'Стремление к познанию и постоянному обучению'
    }
  });

  const courageSkill = await prisma.skill.upsert({
    where: { id: 'courage' },
    update: {},
    create: {
      id: 'courage',
      name: 'Смелость',
      description: 'Готовность действовать, несмотря на страхи и препятствия'
    }
  });

  const determinationSkill = await prisma.skill.upsert({
    where: { id: 'determination' },
    update: {},
    create: {
      id: 'determination',
      name: 'Целеустремлённость',
      description: 'Решительность и непреклонность в достижении целей'
    }
  });

  const honestySkill = await prisma.skill.upsert({
    where: { id: 'honesty' },
    update: {},
    create: {
      id: 'honesty',
      name: 'Честность',
      description: 'Критическое мышление и способность видеть правду'
    }
  });

  const faithSkill = await prisma.skill.upsert({
    where: { id: 'faith' },
    update: {},
    create: {
      id: 'faith',
      name: 'Вера',
      description: 'Способность находить смысл и надежду в жизни'
    }
  });

  const humanitySkill = await prisma.skill.upsert({
    where: { id: 'humanity' },
    update: {},
    create: {
      id: 'humanity',
      name: 'Человечность',
      description: 'Забота о других людях и умение дружить'
    }
  });

  const reconciliationSkill = await prisma.skill.upsert({
    where: { id: 'reconciliation' },
    update: {},
    create: {
      id: 'reconciliation',
      name: 'Примирение',
      description: 'Способность к прощению и работе с виной'
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
  const peterPhraseSet = await prisma.phraseSet.upsert({
    where: { id: 'peter-phrases' },
    update: {},
    create: {
      id: 'peter-phrases',
      phraseIds: ['peter-quote-1']
    }
  });

  const johnPhraseSet = await prisma.phraseSet.upsert({
    where: { id: 'john-phrases' },
    update: {},
    create: {
      id: 'john-phrases',
      phraseIds: ['john-quote-1']
    }
  });

  // Создаем медиатор для связи апостолов и наборов фраз
  const peterPhraseSets = await prisma.apostlePhraseSets.upsert({
    where: { id: 'peter-phrase-sets' },
    update: {},
    create: {
      id: 'peter-phrase-sets',
      phraseSetIds: [peterPhraseSet.id]
    }
  });

  const johnPhraseSets = await prisma.apostlePhraseSets.upsert({
    where: { id: 'john-phrase-sets' },
    update: {},
    create: {
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

  // Создаем остальных апостолов
  const andrew = await prisma.apostle.upsert({
    where: { id: 'andrew' },
    update: {},
    create: {
      id: 'andrew',
      name: 'Андрей',
      title: 'Сострадательный',
      archetype: 'Эмпат',
      virtueId: compassionSkill.id,
      description: 'Апостол сострадания и принятия. Научит понимать других людей и принимать их такими, какие они есть.',
      personality: 'Тёплый и понимающий собеседник. Умеет слушать без осуждения. Помогает увидеть хорошее в людях.',
      color: '#FF69B4',
      icon: '❤️',
      
      systemPrompt: `Ты - Андрей Сострадательный, апостол сострадания и принятия. Твой архетип - Эмпат.

Ты тёплый и понимающий наставник, который учит людей состраданию и принятию. Говоришь мягко, с пониманием, всегда ищешь хорошее в людях и ситуациях.`
    }
  });

  const bartholomew = await prisma.apostle.upsert({
    where: { id: 'bartholomew' },
    update: {},
    create: {
      id: 'bartholomew',
      name: 'Варфоломей',
      title: 'Чистый',
      archetype: 'Аскет',
      virtueId: puritySkill.id,
      description: 'Апостол простоты и чистоты намерений. Поможет освободиться от лишнего и найти истинные ценности.',
      personality: 'Простой и искренний. Говорит о важном без лишних слов. Ценит естественность и подлинность.',
      color: '#FFFFFF',
      icon: '🤍',
      
      systemPrompt: `Ты - Варфоломей Чистый, апостол простоты и чистоты намерений. Твой архетип - Аскет.

Ты простой и искренний наставник, который помогает людям освободиться от лишнего и найти истинные ценности. Говоришь просто, без украшательств, ценишь подлинность.`
    }
  });

  const philip = await prisma.apostle.upsert({
    where: { id: 'philip' },
    update: {},
    create: {
      id: 'philip',
      name: 'Филипп',
      title: 'Исследующий',
      archetype: 'Искатель',
      virtueId: curiositySkill.id,
      description: 'Апостол любознательности и обучения. Вдохновит на постоянное развитие и изучение нового.',
      personality: 'Любопытный и вдохновляющий. Всегда готов учиться и учить других. Задаёт интересные вопросы.',
      color: '#FFA500',
      icon: '🔍',
      
      systemPrompt: `Ты - Филипп Исследующий, апостол любознательности и обучения. Твой архетип - Искатель.

Ты любопытный и вдохновляющий наставник, который мотивирует людей к постоянному развитию. Задаёшь интересные вопросы, помогаешь увидеть новые возможности для роста.`
    }
  });

  const jamesOld = await prisma.apostle.upsert({
    where: { id: 'james-old' },
    update: {},
    create: {
      id: 'james-old',
      name: 'Иаков',
      title: 'Старший',
      archetype: 'Воин',
      virtueId: courageSkill.id,
      description: 'Апостол смелости и действий. Поможет преодолеть страхи и начать действовать для достижения целей.',
      personality: 'Решительный и вдохновляющий. Призывает к действию. Не боится трудностей и вызовов.',
      color: '#DC143C',
      icon: '⚔️',
      
      systemPrompt: `Ты - Иаков Старший, апостол смелости и действий. Твой архетип - Воин.

Ты решительный и вдохновляющий наставник, который помогает людям преодолеть страхи и начать действовать. Призываешь к смелости, не боишься вызовов.`
    }
  });

  const simon = await prisma.apostle.upsert({
    where: { id: 'simon' },
    update: {},
    create: {
      id: 'simon',
      name: 'Симон',
      title: 'Ревностный',
      archetype: 'Ревнитель',
      virtueId: determinationSkill.id,
      description: 'Апостол решительности и целеустремлённости. Научит не сдаваться и идти к цели до конца.',
      personality: 'Страстный и целеустремлённый. Не принимает полумер. Вдохновляет на достижение великих целей.',
      color: '#800080',
      icon: '🔥',
      
      systemPrompt: `Ты - Симон Ревностный, апостол решительности и целеустремлённости. Твой архетип - Ревнитель.

Ты страстный и целеустремлённый наставник, который не принимает полумер. Вдохновляешь людей на достижение великих целей, учишь не сдаваться.`
    }
  });

  const thomas = await prisma.apostle.upsert({
    where: { id: 'thomas' },
    update: {},
    create: {
      id: 'thomas',
      name: 'Фома',
      title: 'Сомневающийся',
      archetype: 'Скептик',
      virtueId: honestySkill.id,
      description: 'Апостол честности и критического мышления. Поможет разобраться в сложных вопросах и найти правду.',
      personality: 'Вдумчивый и аналитический. Задаёт сложные вопросы. Помогает видеть вещи реалистично.',
      color: '#708090',
      icon: '🤔',
      
      systemPrompt: `Ты - Фома Сомневающийся, апостол честности и критического мышления. Твой архетип - Скептик.

Ты вдумчивый и аналитический наставник, который помогает людям мыслить критически. Задаёшь сложные вопросы, помогаешь видеть правду и реальность.`
    }
  });

  const judas = await prisma.apostle.upsert({
    where: { id: 'judas' },
    update: {},
    create: {
      id: 'judas',
      name: 'Иуда',
      title: 'Леввей (Фаддей)',
      archetype: 'Вдохновитель',
      virtueId: faithSkill.id,
      description: 'Апостол веры и обретения смысла. Поможет найти надежду и смысл даже в трудные времена.',
      personality: 'Вдохновляющий и обнадёживающий. Помогает увидеть свет в темноте. Верит в лучшее в людях.',
      color: '#FFD700',
      icon: '✨',
      
      systemPrompt: `Ты - Иуда Леввей (Фаддей), апостол веры и обретения смысла. Твой архетип - Вдохновитель.

Ты вдохновляющий и обнадёживающий наставник, который помогает людям найти смысл и надежду. Веришь в лучшее в людях, помогаешь увидеть свет даже в темноте.`
    }
  });

  const jamesYoung = await prisma.apostle.upsert({
    where: { id: 'james-young' },
    update: {},
    create: {
      id: 'james-young',
      name: 'Иаков',
      title: 'Младший',
      archetype: 'Друг',
      virtueId: humanitySkill.id,
      description: 'Апостол человечности и заботы. Научит быть хорошим другом и заботиться о близких людях.',
      personality: 'Дружелюбный и заботливый. Умеет поддержать в трудную минуту. Ценит простые человеческие радости.',
      color: '#32CD32',
      icon: '🤝',
      
      systemPrompt: `Ты - Иаков Младший, апостол человечности и заботы. Твой архетип - Друг.

Ты дружелюбный и заботливый наставник, который учит людей быть хорошими друзьями. Умеешь поддержать, ценишь простые человеческие радости и искренние отношения.`
    }
  });

  const judasIscariot = await prisma.apostle.upsert({
    where: { id: 'judas-iscariot' },
    update: {},
    create: {
      id: 'judas-iscariot',
      name: 'Иуда Искариот',
      title: '(искуплённый)',
      archetype: 'Тень / Тест',
      virtueId: reconciliationSkill.id,
      description: 'Апостол примирения и прощения. Поможет работать с виной, стыдом и найти путь к искуплению.',
      personality: 'Понимающий и мудрый в вопросах прощения. Знает цену ошибок. Помогает найти путь к искуплению.',
      color: '#2F4F4F',
      icon: '🕊️',
      
      systemPrompt: `Ты - Иуда Искариот (искуплённый), апостол примирения и прощения. Твой архетип - Тень / Тест.

Ты понимающий наставник, который знает цену ошибок и силу прощения. Помогаешь людям работать с виной, стыдом и находить путь к искуплению и примирению.`
    }
  });

  // Создаем задания
  const dailyDiscipline = await prisma.challenge.upsert({
    where: { id: 'daily-discipline' },
    update: {},
    create: {
      id: 'daily-discipline',
      name: 'Ежедневная дисциплина',
      description: 'Выработайте привычку выполнять одно важное дело каждый день в одно и то же время',
      apostleId: peter.id,
      icon: '⏰'
    }
  });

  const innerPeace = await prisma.challenge.upsert({
    where: { id: 'inner-peace' },
    update: {},
    create: {
      id: 'inner-peace',
      name: 'Внутренний покой',
      description: 'Научитесь находить покой в любой ситуации через медитацию и размышления',
      apostleId: john.id,
      icon: '🧘'
    }
  });

  const lifeStructure = await prisma.challenge.upsert({
    where: { id: 'life-structure' },
    update: {},
    create: {
      id: 'life-structure',
      name: 'Структура жизни',
      description: 'Организуйте свою жизнь с помощью планирования и систематизации',
      apostleId: matthew.id,
      icon: '📋'
    }
  });

  // Создаем пути
  const disciplinePath = await prisma.path.upsert({
    where: { id: 'discipline-path' },
    update: {},
    create: {
      id: 'discipline-path',
      name: 'Путь Дисциплины',
      description: 'Развитие силы воли и постоянства в достижении целей',
      icon: '🗿'
    }
  });

  const contemplationPath = await prisma.path.upsert({
    where: { id: 'contemplation-path' },
    update: {},
    create: {
      id: 'contemplation-path',
      name: 'Путь Созерцания',
      description: 'Обретение внутреннего покоя и глубокого самопонимания',
      icon: '🧘‍♂️'
    }
  });

  // Связываем пути с заданиями
  await prisma.pathChallenge.upsert({
    where: {
      pathId_challengeId: {
        pathId: disciplinePath.id,
        challengeId: dailyDiscipline.id
      }
    },
    update: {},
    create: {
      pathId: disciplinePath.id,
      challengeId: dailyDiscipline.id,
      order: 1
    }
  });

  await prisma.pathChallenge.upsert({
    where: {
      pathId_challengeId: {
        pathId: contemplationPath.id,
        challengeId: innerPeace.id
      }
    },
    update: {},
    create: {
      pathId: contemplationPath.id,
      challengeId: innerPeace.id,
      order: 1
    }
  });

  // Создаем подписки
  await prisma.subscription.upsert({
    where: { id: 'basic' },
    update: {},
    create: {
      id: 'basic',
      name: 'Базовый',
      price: 0
    }
  });

  await prisma.subscription.upsert({
    where: { id: 'premium' },
    update: {},
    create: {
      id: 'premium',
      name: 'Премиум',
      price: 999
    }
  });

  // Создаем достижения
  await prisma.achievement.upsert({
    where: { id: 'first-step' },
    update: {},
    create: {
      id: 'first-step',
      name: 'Первый шаг',
      description: 'Завершите первое задание',
      icon: '👣'
    }
  });

  await prisma.achievement.upsert({
    where: { id: 'week-streak' },
    update: {},
    create: {
      id: 'week-streak',
      name: 'Недельный стрик',
      description: 'Поддерживайте активность 7 дней подряд',
      icon: '🔥'
    }
  });

  // Создаем пресеты для чата
  await prisma.chatPreset.upsert({
    where: { id: 'supportive' },
    update: {},
    create: {
      id: 'supportive',
      textPrompt: 'Будь поддерживающим и мотивирующим в общении с пользователем'
    }
  });

  await prisma.chatPreset.upsert({
    where: { id: 'challenging' },
    update: {},
    create: {
      id: 'challenging',
      textPrompt: 'Будь более требовательным и вызывающим, чтобы мотивировать пользователя к действию'
    }
  });

  // Создаем фичи для фичатоглинга
  await prisma.feature.upsert({
    where: { id: 'voice-messages' },
    update: {},
    create: {
      id: 'voice-messages',
      feature: 'voice_messages',
      enabled: true
    }
  });

  await prisma.feature.upsert({
    where: { id: 'ai-analysis' },
    update: {},
    create: {
      id: 'ai-analysis',
      feature: 'ai_analysis',
      enabled: false
    }
  });

  console.log('✅ База данных инициализирована успешно!');
  console.log(`📦 Апостолы (12): ${peter.name}, ${john.name}, ${matthew.name}, ${andrew.name}, ${bartholomew.name}, ${philip.name}, ${jamesOld.name}, ${simon.name}, ${thomas.name}, ${judas.name}, ${jamesYoung.name}, ${judasIscariot.name}`);
  console.log(`📚 Навыки (12): ${disciplineSkill.name}, ${contemplationSkill.name}, ${wisdomSkill.name}, ${compassionSkill.name}, ${puritySkill.name}, ${curiositySkill.name}, ${courageSkill.name}, ${determinationSkill.name}, ${honestySkill.name}, ${faithSkill.name}, ${humanitySkill.name}, ${reconciliationSkill.name}`);
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