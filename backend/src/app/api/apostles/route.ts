import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

export async function GET() {
  try {
    const apostles = await prisma.apostle.findMany({
      select: {
        id: true,
        name: true,
        archetype: true,
        virtue: true,
        description: true,
        personality: true,
        color: true,
        icon: true,
        welcomeMessage: true,
      },
    });

    return NextResponse.json(apostles);
  } catch (error) {
    console.error('Apostles API error:', error);
    return NextResponse.json(
      { error: 'Ошибка при получении данных об апостолах' },
      { status: 500 }
    );
  }
} 