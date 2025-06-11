import OpenAI from 'openai';

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateApostleResponse(
  apostleId: string,
  userMessage: string,
  context: string[] = [],
  systemPrompt: string
): Promise<string> {
  console.log('🤖 generateApostleResponse вызвана');
  console.log('📝 Параметры:');
  console.log('- apostleId:', apostleId);
  console.log('- userMessage:', userMessage);
  console.log('- context:', context);
  console.log('- systemPrompt длина:', systemPrompt.length);
  
  try {
    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      {
        role: 'system',
        content: systemPrompt,
      },
      // Add context from previous messages
      ...context.slice(-4).map((msg, index) => ({
        role: (index % 2 === 0 ? 'user' : 'assistant') as 'user' | 'assistant',
        content: msg,
      })),
      {
        role: 'user',
        content: userMessage,
      },
    ];

    console.log('📨 Подготовлены сообщения для OpenAI:', messages);
    console.log('🔑 OpenAI API Key установлен:', !!process.env.OPENAI_API_KEY);
    console.log('🔑 OpenAI API Key длина:', process.env.OPENAI_API_KEY?.length || 0);

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages,
      max_tokens: 300,
      temperature: 0.7,
      presence_penalty: 0.1,
      frequency_penalty: 0.1,
    });

    console.log('✅ Получен ответ от OpenAI API');
    console.log('📊 Использование токенов:', response.usage);
    
    const generatedResponse = response.choices[0]?.message?.content || 'Прости, я не могу ответить прямо сейчас.';
    console.log('📤 Сгенерированный ответ:', generatedResponse);
    
    return generatedResponse;
  } catch (error) {
    console.error('❌ Ошибка OpenAI API:', error);
    console.error('❌ Детали ошибки OpenAI:', {
      message: (error as Error)?.message,
      name: (error as Error)?.name,
      stack: (error as Error)?.stack,
      // OpenAI specific error details
      status: (error as any)?.status,
      code: (error as any)?.code,
      type: (error as any)?.type,
    });
    throw new Error('Ошибка при генерации ответа');
  }
}

export async function generateMission(
  apostleId: string,
  userId: string,
  difficulty: 'easy' | 'medium' | 'hard',
  apostlePersonality: string
): Promise<{
  title: string;
  description: string;
  tasks: string[];
  duration: number;
}> {
  try {
    const difficultySettings = {
      easy: { duration: '3-4 дня', complexity: 'простые и достижимые' },
      medium: { duration: '5-6 дней', complexity: 'умеренно сложные' },
      hard: { duration: '7-10 дней', complexity: 'вызывающие и трансформирующие' },
    };

    const setting = difficultySettings[difficulty];

    const prompt = `Ты ${apostlePersonality}. Создай духовное задание для развития человека.
    
Требования:
- Длительность: ${setting.duration}
- Сложность: ${setting.complexity}
- Задачи должны быть практическими и выполнимыми
- Фокус на духовном и характерном развитии
- От 3 до 5 конкретных задач

Формат ответа (JSON):
{
  "title": "Название задания",
  "description": "Подробное описание цели и смысла задания",
  "tasks": ["Задача 1", "Задача 2", "Задача 3"],
  "duration": число_дней
}`;

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 500,
      temperature: 0.8,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error('Пустой ответ от AI');

    const mission = JSON.parse(content);
    return mission;
  } catch (error) {
    console.error('Mission generation error:', error);
    // Fallback mission
    return {
      title: 'Путь осознанности',
      description: 'Развитие внимательности и присутствия в каждом моменте жизни.',
      tasks: [
        'Ежедневная 10-минутная медитация',
        'Ведение дневника благодарности',
        'Осознанный прием пищи один раз в день',
      ],
      duration: difficulty === 'easy' ? 3 : difficulty === 'medium' ? 5 : 7,
    };
  }
} 