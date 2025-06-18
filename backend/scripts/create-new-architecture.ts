import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createNewArchitecture() {
  console.log('🚀 Создаем новую архитектуру Task->TaskWrapper->Challenge->Path...');

  try {
    // 1. Данные заданий Петра (из предыдущего скрипта seed-daily-tasks.ts)
    const peterTasksData = [
      {
        name: 'Принятие вызова',
        description: 'Найди одну привычку, которая тебе мешает, и откажись от неё на один день. Это может быть проверка соцсетей, сладости или что-то другое. Главное - осознанно выбрать и продержаться.',
        dayNumber: 1,
        motivationalPhrase: 'Путь в тысячу миль начинается с одного шага. Сделай его сегодня.'
      },
      {
        name: 'Тело - храм силы',
        description: 'Выполни простое физическое упражнение, которое требует выносливости: 50 отжиманий (можно с колен), планка на 2 минуты или 500 приседаний в течение дня. Если это слишком легко - увеличь нагрузку. Если тяжело - сделай половину, но не сдавайся.',
        dayNumber: 2,
        motivationalPhrase: 'Тело может вынести почти всё. Это разум нужно убедить.'
      },
      {
        name: 'Порядок из хаоса',
        description: 'Выбери один беспорядочный участок своей жизни (рабочий стол, шкаф, папку с файлами) и приведи его в полный порядок. Делай это медленно, вдумчиво, наслаждаясь процессом создания структуры.',
        dayNumber: 3,
        motivationalPhrase: 'Внешний порядок рождает внутренний покой.'
      },
      {
        name: 'Испытание молчанием',
        description: 'В течение 2 часов (выбери удобное время) не говори ни слова, кроме самого необходимого. Используй это время для наблюдения за собой и окружающими. Запиши свои наблюдения.',
        dayNumber: 4,
        motivationalPhrase: 'В тишине рождается мудрость, в молчании крепнет сила.'
      },
      {
        name: 'Мост через пропасть',
        description: 'Найди человека, с которым у тебя есть недопонимание или конфликт. Сделай первый шаг к примирению: позвони, напиши сообщение или встреться лично. Не ожидай немедленного результата - важна твоя готовность протянуть руку.',
        dayNumber: 5,
        motivationalPhrase: 'Стойкость - не когда ты стоишь один, а когда ты протягиваешь руку другому.'
      },
      {
        name: 'Корни глубокой веры',
        description: 'Проведи 15 минут в тишине, размышляя о том, что для тебя действительно важно в жизни. Можешь молиться, медитировать или просто думать. Запиши 3 главные ценности, которые будут твоими опорами в трудные времена.',
        dayNumber: 6,
        motivationalPhrase: 'Знай, во что ты веришь, тогда буря не сможет тебя сломить.'
      },
      {
        name: 'Сила через отдавание',
        description: 'Сделай что-то хорошее для другого человека, не ожидая благодарности. Помоги незнакомцу, поддержи друга, сделай добровольческую работу или просто искренне выслушай кого-то. Истинная стойкость рождается, когда мы думаем не только о себе.',
        dayNumber: 7,
        motivationalPhrase: 'Истинная сила проявляется не в том, что ты можешь взять, а в том, что готов отдать.'
      }
    ];

    // 2. Получаем апостола Петра
    const peter = await prisma.apostle.findFirst({
      where: { name: 'Пётр' }
    });

    if (!peter) {
      console.error('❌ Апостол Пётр не найден');
      return;
    }

    console.log(`👤 Найден апостол: ${peter.name}`);

    // 3. Создаем базовые Task сущности
    const tasks = [];
    for (const taskData of peterTasksData) {
      const task = await prisma.task.create({
        data: {
          id: `peter-task-${taskData.dayNumber}`,
          name: taskData.name,
          description: taskData.description
        }
      });
      tasks.push({ task, order: taskData.dayNumber });
      console.log(`✅ Создано базовое задание: ${task.name}`);
    }

    // 4. Создаем испытание Петра
    const peterChallenge = await prisma.challenge.create({
      data: {
        id: 'peter-stoykost-challenge',
        name: 'Испытание Стойкости',
        description: 'Недельное испытание от апостола Петра для развития внутренней силы и дисциплины',
        apostleId: peter.id,
        orderedTasks: [] // Заполним после создания оберток
      }
    });

    console.log(`✅ Создано испытание: ${peterChallenge.name}`);

    // 5. Создаем TaskWrapper обертки для каждого задания
    const taskWrappers = [];
    for (const { task, order } of tasks) {
      const wrapper = await prisma.taskWrapper.create({
        data: {
          id: `peter-wrapper-${order}`,
          challengeId: peterChallenge.id,
          taskId: task.id,
          order: order,
          apostleId: peter.id,
          icon: '🗿' // Иконка Петра
        }
      });
      
      taskWrappers.push(wrapper);
      console.log(`✅ Создана обертка ${wrapper.order}: ${task.name}`);
    }

    // 6. Обновляем испытание с упорядоченным списком оберток
    await prisma.challenge.update({
      where: { id: peterChallenge.id },
      data: {
        orderedTasks: taskWrappers.map(w => w.id)
      }
    });

    console.log('✅ Обновлено испытание с упорядоченными задачами');

    // 7. Создаем основной путь
    const mainPath = await prisma.path.create({
      data: {
        id: 'main-path',
        name: 'Основной путь',
        description: 'Вступительный путь духовного развития с испытаниями от апостолов',
        icon: '🛤️',
        challenges: [peterChallenge.id]
      }
    });

    console.log('✅ Создан основной путь');

    console.log('🎉 Новая архитектура создана успешно!');
    console.log('\n📋 Что создано:');
    console.log(`- ${tasks.length} базовых заданий (Task)`);
    console.log(`- ${taskWrappers.length} оберток заданий (TaskWrapper)`);
    console.log(`- 1 испытание Петра (Challenge)`);
    console.log(`- 1 основной путь (Path)`);

    console.log('\n🔄 Структура:');
    console.log(`Path: ${mainPath.name} (${mainPath.id})`);
    console.log(`  Challenge: ${peterChallenge.name} (${peterChallenge.id})`);
    taskWrappers.forEach((wrapper, index) => {
      const task = tasks[index];
      console.log(`    TaskWrapper ${wrapper.order}: ${task.task.name} (${wrapper.id})`);
    });

  } catch (error) {
    console.error('❌ Ошибка при создании архитектуры:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Запуск создания архитектуры
if (require.main === module) {
  createNewArchitecture()
    .catch((error) => {
      console.error('💥 Критическая ошибка:', error);
      process.exit(1);
    });
}

export default createNewArchitecture; 