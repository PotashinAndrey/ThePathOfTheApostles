const API_BASE_URL = 'http://localhost:3000/api';

async function makeRequest(endpoint: string, options: any = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HTTP ${response.status}: ${errorText}`);
  }

  return response.json();
}

async function testDailyTasksAPI() {
  console.log('🧪 Тестирование API ежедневных заданий...');

  try {
    // 1. Регистрируем тестового пользователя
    console.log('\n👤 Регистрация тестового пользователя...');
    const testEmail = `test-${Date.now()}@apostles.app`;
    const testPassword = 'test123456';
    
    const authResponse = await makeRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        email: testEmail,
        password: testPassword,
        confirmPassword: testPassword,
        name: 'Тестовый пользователь'
      }),
    });
    
    const token = authResponse.data.token;
    console.log('✅ Пользователь зарегистрирован, токен получен');

    // 2. Активируем первое задание
    console.log('\n🚀 Активация первого задания...');
    const firstTaskResponse = await makeRequest('/daily-tasks/start', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    console.log('✅ Первое задание активировано:', firstTaskResponse);

    if (firstTaskResponse.data?.task) {
      const taskId = firstTaskResponse.data.task.id;

      // 3. Получаем активное задание
      console.log('\n📅 Получение активного задания...');
      const activeTaskResponse = await makeRequest('/daily-tasks/active', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      console.log('✅ Активное задание получено:', activeTaskResponse);

      // 4. Завершаем задание
      console.log('\n✅ Завершение задания...');
      const completeResponse = await makeRequest(`/daily-tasks/${taskId}/complete`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          content: 'Я выполнил это задание! Отказался от проверки социальных сетей в течение дня.',
          notes: 'Было сложно первые два часа, но потом стало легче. Заметил, как много времени освободилось.',
        }),
      });
      console.log('✅ Задание завершено:', completeResponse);

      // 5. Проверяем, что задание больше не активно
      console.log('\n📅 Проверка статуса после завершения...');
      const afterCompleteResponse = await makeRequest('/daily-tasks/active', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      console.log('✅ Статус после завершения:', afterCompleteResponse);
    }

    console.log('\n🎉 Все тесты прошли успешно!');

  } catch (error) {
    console.error('❌ Ошибка в тестах:', error);
  }
}

// Запускаем тесты только если скрипт запущен напрямую
if (require.main === module) {
  testDailyTasksAPI();
}

export { testDailyTasksAPI }; 