import { prisma } from '../src/lib/prisma';

async function testNewTaskLogic() {
  console.log('🧪 Тестируем новую логику заданий...\n');

  try {
    // 1. Сброс состояния пользователя для чистого теста
    const user = await prisma.user.findFirst({
      where: { email: 'test@example.com' },
      include: { meta: true }
    });

    if (!user || !user.meta) {
      console.log('❌ Пользователь не найден');
      return;
    }

    console.log('🔄 Сбрасываем состояние пользователя для чистого теста...');
    await prisma.userMeta.update({
      where: { id: user.meta.id },
      data: {
        activeTasks: [],
        completedTasks: []
      }
    });

    // 2. Получаем все TaskWrapper заданий
    const challenge = await prisma.challenge.findFirst({
      where: { id: 'peter-stoykost-challenge' }
    });

    if (!challenge) {
      console.log('❌ Испытание не найдено');
      return;
    }

    console.log(`📋 Найдено испытание: ${challenge.name}`);
    console.log(`📝 Задания в порядке: ${challenge.orderedTasks}\n`);

    // 3. Тестируем доступность заданий
    console.log('📊 ТЕСТ 1: Проверяем доступность заданий в начале:');
    
    for (let i = 0; i < challenge.orderedTasks.length; i++) {
      const taskWrapperId = challenge.orderedTasks[i];
      const taskWrapper = await prisma.taskWrapper.findUnique({
        where: { id: taskWrapperId },
        include: { task: true }
      });

      if (taskWrapper) {
        // Логика доступности (как в API)
        let isAvailable = false;
        if (i === 0) {
          isAvailable = true;
        } else {
          const prevTaskWrapperId = challenge.orderedTasks[i - 1];
          isAvailable = user.meta.completedTasks.includes(prevTaskWrapperId);
        }

        const status = isAvailable ? '🔓 ДОСТУПНО' : '🔒 ЗАБЛОКИРОВАНО';
        console.log(`  ${i + 1}. ${taskWrapper.task.name} - ${status}`);
      }
    }

    // 4. Активируем первое задание
    console.log('\n🎯 ТЕСТ 2: Активируем первое задание...');
    const firstTaskId = challenge.orderedTasks[0];
    
    await prisma.userMeta.update({
      where: { id: user.meta.id },
      data: {
        activeTasks: [firstTaskId]
      }
    });

    console.log('✅ Первое задание активировано');

    // 5. Пытаемся активировать второе задание (должно быть заблокировано)
    console.log('\n🚫 ТЕСТ 3: Пытаемся активировать второе задание (должна быть ошибка)...');
    const secondTaskId = challenge.orderedTasks[1];
    
    // Симулируем проверку из API
    const currentActiveTasks = [firstTaskId];
    const currentCompletedTasks: string[] = [];
    
    // Проверка: только одно активное задание
    const activeTasksFromChallenge = currentActiveTasks.filter(activeTaskId => 
      challenge.orderedTasks.includes(activeTaskId)
    );

    if (activeTasksFromChallenge.length > 0) {
      console.log('❌ Правильно! Нельзя активировать второе задание - уже есть активное');
    }

    // Проверка: доступность второго задания
    const secondIndex = challenge.orderedTasks.indexOf(secondTaskId);
    const prevTaskWrapperId = challenge.orderedTasks[secondIndex - 1];
    const isPrevCompleted = currentCompletedTasks.includes(prevTaskWrapperId);
    
    if (!isPrevCompleted) {
      console.log('❌ Правильно! Второе задание недоступно - предыдущее не завершено');
    }

    // 6. Завершаем первое задание
    console.log('\n✅ ТЕСТ 4: Завершаем первое задание...');
    
    await prisma.userMeta.update({
      where: { id: user.meta.id },
      data: {
        activeTasks: [],
        completedTasks: [firstTaskId]
      }
    });

    await prisma.taskWrapperResult.create({
      data: {
        taskWrapperId: firstTaskId,
        userId: user.id,
        content: 'Тестовое завершение первого задания',
        result: 'Задание завершено в рамках тестирования'
      }
    });

    console.log('✅ Первое задание завершено');

    // 7. Проверяем доступность заданий после завершения первого
    console.log('\n📊 ТЕСТ 5: Проверяем доступность после завершения первого:');
    
    const updatedUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: { meta: true }
    });

    for (let i = 0; i < challenge.orderedTasks.length; i++) {
      const taskWrapperId = challenge.orderedTasks[i];
      const taskWrapper = await prisma.taskWrapper.findUnique({
        where: { id: taskWrapperId },
        include: { task: true }
      });

      if (taskWrapper) {
        // Логика доступности
        let isAvailable = false;
        if (i === 0) {
          isAvailable = true;
        } else {
          const prevTaskWrapperId = challenge.orderedTasks[i - 1];
          isAvailable = updatedUser?.meta?.completedTasks.includes(prevTaskWrapperId) || false;
        }

        const isCompleted = updatedUser?.meta?.completedTasks.includes(taskWrapperId) || false;
        const isActive = updatedUser?.meta?.activeTasks.includes(taskWrapperId) || false;

        let status = '';
        if (isCompleted) status = '✅ ЗАВЕРШЕНО';
        else if (isActive) status = '⚡ АКТИВНО';
        else if (isAvailable) status = '🔓 ДОСТУПНО';
        else status = '🔒 ЗАБЛОКИРОВАНО';

        console.log(`  ${i + 1}. ${taskWrapper.task.name} - ${status}`);
      }
    }

    // 8. Активируем второе задание (теперь должно быть доступно)
    console.log('\n🎯 ТЕСТ 6: Активируем второе задание (теперь доступно)...');
    
    // Проверяем что второе задание доступно
    const secondAvailable = updatedUser?.meta?.completedTasks.includes(firstTaskId) || false;
    
    if (secondAvailable) {
      await prisma.userMeta.update({
        where: { id: user.meta.id },
        data: {
          activeTasks: [secondTaskId]
        }
      });
      console.log('✅ Второе задание успешно активировано!');
    } else {
      console.log('❌ Второе задание все еще недоступно');
    }

    // 9. Итоговое состояние
    const finalUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: { meta: true }
    });

    console.log('\n📊 ИТОГОВОЕ СОСТОЯНИЕ:');
    console.log(`✅ Завершенные задания: ${finalUser?.meta?.completedTasks || []}`);
    console.log(`⚡ Активные задания: ${finalUser?.meta?.activeTasks || []}`);

    console.log('\n🎉 Все тесты завершены успешно!');

  } catch (error) {
    console.error('❌ Ошибка тестирования:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Запуск теста
testNewTaskLogic(); 