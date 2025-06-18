import { prisma } from '../src/lib/prisma';

async function activateFirstTask() {
  try {
    console.log('🚀 Активируем первое задание для пользователей с активным путем...\n');

    // Находим пользователей с активным путем, но без активных заданий
    const users = await prisma.user.findMany({
      include: {
        meta: {
          include: {
            paths: true
          }
        }
      }
    });

    for (const user of users) {
      if (!user.meta?.paths) continue;
      
      const activePaths = user.meta.paths.activePathIds;
      const activeTasks = user.meta.activeTasks;
      
      if (activePaths.length > 0 && activeTasks.length === 0) {
        console.log(`👤 Обрабатываем пользователя: ${user.email}`);
        console.log(`   Активные пути: ${activePaths.join(', ')}`);
        
        // Берем первый активный путь
        const firstPathId = activePaths[0];
        
        // Получаем путь с challenge
        const path = await prisma.path.findUnique({
          where: { id: firstPathId }
        });
        
        if (!path || !path.challenges || path.challenges.length === 0) {
          console.log(`   ⚠️ У пути ${firstPathId} нет испытаний`);
          continue;
        }
        
        // Получаем первое испытание
        const firstChallengeId = path.challenges[0];
        const challenge = await prisma.challenge.findUnique({
          where: { id: firstChallengeId }
        });
        
        if (!challenge || !challenge.orderedTasks || challenge.orderedTasks.length === 0) {
          console.log(`   ⚠️ У испытания ${firstChallengeId} нет заданий`);
          continue;
        }
        
        // Активируем первое задание
        const firstTaskWrapperId = challenge.orderedTasks[0];
        console.log(`   🎯 Активируем задание: ${firstTaskWrapperId}`);
        
        await prisma.userMeta.update({
          where: { id: user.meta.id },
          data: {
            activeTasks: [firstTaskWrapperId]
          }
        });
        
        console.log(`   ✅ Задание активировано для ${user.email}\n`);
      }
    }

    console.log('✅ Обработка завершена');

  } catch (error) {
    console.error('❌ Ошибка активации заданий:', error);
  } finally {
    await prisma.$disconnect();
  }
}

activateFirstTask(); 