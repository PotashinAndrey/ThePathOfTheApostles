import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Принудительно создаем новый клиент при каждом запуске
export const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

// В режиме разработки используем глобальный клиент для предотвращения переподключений
if (process.env.NODE_ENV !== 'production') {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = prisma;
  }
} 