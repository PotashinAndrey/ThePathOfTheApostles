import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import { ApostleResponse, ApiResponse } from '../../../types/api';

export async function GET() {
  console.log('🚀 Backend API /apostles получил запрос');
  
  try {
    const apostles = await prisma.apostle.findMany({
      include: {
        virtue: true
      }
    });

    const apostleResponses: ApostleResponse[] = apostles.map(apostle => ({
      id: apostle.id,
      name: apostle.name,
      title: apostle.title,
      description: apostle.description,
      archetype: apostle.archetype,
      personality: apostle.personality,
      color: apostle.color,
      icon: apostle.icon,
      virtue: apostle.virtue ? {
        id: apostle.virtue.id,
        name: apostle.virtue.name,
        description: apostle.virtue.description
      } : undefined
    }));

    console.log('✅ Получены данные об апостолах:', apostleResponses.length);
    
    return NextResponse.json<ApiResponse<ApostleResponse[]>>({
      success: true,
      data: apostleResponses
    });
  } catch (error) {
    console.error('❌ Ошибка получения апостолов:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Ошибка при получении данных об апостолах'
    }, { status: 500 });
  }
} 