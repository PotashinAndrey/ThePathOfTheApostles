import { prisma } from '../src/lib/prisma';

async function testTaskCompletion() {
  console.log('🧪 Тестируем логику завершения и автоактивации заданий...\n');

  try {
    // 1. Находим пользователя с активными заданиями
    const user = await prisma.user.findFirst({
      where: {
        meta: {
          activeTasks: {
            isEmpty: false
          }
        }
      },
      include: {
        meta: true
      }
    });

    if (!user || !user.meta) {
      console.log('❌ Пользователь с активными заданиями не найден');
      return;
    }

    console.log(`👤 Тестируем с пользователем: ${user.email}`);
    console.log(`📋 Активные задания: ${user.meta.activeTasks}`);
    console.log(`✅ Завершенные задания: ${user.meta.completedTasks}\n`);

    // 2. Берем первое активное задание
    const activeTaskWrapperId = user.meta.activeTasks[0];
    
    if (!activeTaskWrapperId) {
      console.log('❌ Нет активных заданий для тестирования');
      return;
    }

    // 3. Получаем информацию о TaskWrapper
    const taskWrapper = await prisma.taskWrapper.findUnique({
      where: { id: activeTaskWrapperId },
      include: {
        task: true,
        apostle: true
      }
    });

    if (!taskWrapper) {
      console.log('❌ TaskWrapper не найден');
      return;
    }

    console.log(`🎯 Тестируем завершение: "${taskWrapper.task.name}" (order: ${taskWrapper.order})`);

    // 4. Получаем Challenge для проверки логики
    const challenge = await prisma.challenge.findUnique({
      where: { id: taskWrapper.challengeId }
    });

    if (!challenge) {
      console.log('❌ Challenge не найден');
      return;
    }

    console.log(`🏆 Испытание: "${challenge.name}"`);
    console.log(`📝 Порядок заданий в испытании: ${challenge.orderedTasks}`);
    
    // Находим позицию текущего задания
    const currentIndex = challenge.orderedTasks.indexOf(activeTaskWrapperId);
    const nextIndex = currentIndex + 1;
    
    console.log(`📍 Текущее задание на позиции: ${currentIndex + 1} из ${challenge.orderedTasks.length}`);
    
    if (nextIndex < challenge.orderedTasks.length) {
      const nextTaskWrapperId = challenge.orderedTasks[nextIndex];
      console.log(`⏭️  Следующее задание для автоактивации: ${nextTaskWrapperId}\n`);
    } else {
      console.log(`🏁 Это последнее задание в испытании!\n`);
    }

    // 5. Симулируем завершение задания
    console.log('🔄 Выполняем завершение задания...\n');

    // Перемещаем из активных в завершенные
    const currentActiveTasks = user.meta.activeTasks;
    const currentCompletedTasks = user.meta.completedTasks;
    
    const updatedActiveTasks = currentActiveTasks.filter(id => id !== activeTaskWrapperId);
    const updatedCompletedTasks = [...currentCompletedTasks, activeTaskWrapperId];

    // Создаем результат выполнения
    await prisma.taskWrapperResult.create({
      data: {
        taskWrapperId: activeTaskWrapperId,
        userId: user.id,
        content: 'Тестовое завершение задания',
        result: 'Задание завершено в рамках тестирования'
      }
    });

    // Обновляем метаданные пользователя
    await prisma.userMeta.update({
      where: { id: user.meta.id },
      data: {
        activeTasks: updatedActiveTasks,
        completedTasks: updatedCompletedTasks
      }
    });

    console.log('✅ Задание перемещено в завершенные');

    // 6. ЛОГИКА АВТОАКТИВАЦИИ (как в API)
    if (nextIndex < challenge.orderedTasks.length) {
      const nextTaskWrapperId = challenge.orderedTasks[nextIndex];
      
      // Проверяем, что следующее задание еще не активировано и не завершено
      if (!updatedActiveTasks.includes(nextTaskWrapperId) && 
          !updatedCompletedTasks.includes(nextTaskWrapperId)) {
        
        // Автоматически активируем следующее задание
        const finalActiveTasks = [...updatedActiveTasks, nextTaskWrapperId];
        
        await prisma.userMeta.update({
          where: { id: user.meta.id },
          data: {
            activeTasks: finalActiveTasks
          }
        });

        // Получаем информацию о следующем задании
        const nextTaskWrapper = await prisma.taskWrapper.findUnique({
          where: { id: nextTaskWrapperId },
          include: { task: true }
        });

        console.log(`🎯 Автоматически активировано следующее задание: "${nextTaskWrapper?.task.name}" (order: ${nextTaskWrapper?.order})`);
      } else {
        console.log('⚠️  Следующее задание уже активировано или завершено');
      }
    } else {
      console.log('🏆 Испытание завершено! Все задания выполнены.');
    }

    // 7. Показываем итоговое состояние
    const finalUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: { meta: true }
    });

    console.log('\n📊 ИТОГОВОЕ СОСТОЯНИЕ:');
    console.log(`📋 Активные задания: ${finalUser?.meta?.activeTasks || []}`);
    console.log(`✅ Завершенные задания: ${finalUser?.meta?.completedTasks || []}`);

    console.log('\n✅ Тест завершен успешно!');

  } catch (error) {
    console.error('❌ Ошибка тестирования:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Запуск теста
testTaskCompletion(); 