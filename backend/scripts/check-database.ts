import { prisma } from '../src/lib/prisma';

async function checkDatabase() {
  try {
    console.log('🔍 Проверяем состояние базы данных...\n');

    // Проверяем пути
    const paths = await prisma.path.findMany({
      select: { id: true, name: true, challenges: true }
    });
    console.log('🛤️ Пути:');
    paths.forEach(path => {
      console.log(`  - ${path.id}: ${path.name} (${path.challenges.length} challenges)`);
    });

    // Проверяем Challenge
    const challenges = await prisma.challenge.findMany({
      select: { id: true, name: true, orderedTasks: true }
    });
    console.log('\n🎯 Испытания:');
    challenges.forEach(challenge => {
      console.log(`  - ${challenge.id}: ${challenge.name} (${challenge.orderedTasks.length} tasks)`);
    });

    // Проверяем TaskWrapper
    const taskWrappers = await prisma.taskWrapper.findMany({
      include: { task: { select: { name: true } } },
      orderBy: { order: 'asc' }
    });
    console.log('\n📋 TaskWrapper:');
    taskWrappers.forEach(tw => {
      console.log(`  - ${tw.id}: Order ${tw.order} - ${tw.task.name}`);
    });

    // Проверяем пользователей с активными путями
    const users = await prisma.user.findMany({
      include: {
        meta: {
          include: {
            paths: true
          }
        }
      }
    });
    console.log('\n👥 Пользователи:');
    users.forEach(user => {
      const activePaths = user.meta?.paths?.activePathIds || [];
      const activeTasks = user.meta?.activeTasks || [];
      const completedTasks = user.meta?.completedTasks || [];
      console.log(`  - ${user.email}: активные пути: ${activePaths.length}, активные задания: ${activeTasks.length}, завершенные: ${completedTasks.length}`);
      if (activePaths.length > 0) {
        console.log(`    Активные пути: ${activePaths.join(', ')}`);
      }
      if (activeTasks.length > 0) {
        console.log(`    Активные задания: ${activeTasks.join(', ')}`);
      }
    });

    console.log('\n✅ Проверка завершена');

  } catch (error) {
    console.error('❌ Ошибка проверки базы данных:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase(); 