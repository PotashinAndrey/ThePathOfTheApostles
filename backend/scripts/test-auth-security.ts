// Скрипт для тестирования безопасности авторизации
import fetch from 'node-fetch';

const API_BASE = 'http://localhost:3000/api';

interface AuthTestResult {
  status: number;
  message: string;
  time: number;
}

async function testAuthEndpoint(email: string, password: string): Promise<AuthTestResult> {
  const startTime = Date.now();
  
  try {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    
    const data = await response.json() as any;
    const endTime = Date.now();
    
    return {
      status: response.status,
      message: data.error || data.message || 'No message',
      time: endTime - startTime
    };
  } catch (error) {
    const endTime = Date.now();
    return {
      status: 0,
      message: (error as Error).message,
      time: endTime - startTime
    };
  }
}

async function testUserEnumeration() {
  console.log('\n🧪 Тест User Enumeration Prevention');
  console.log('=====================================');
  
  // Тест с существующим пользователем (неверный пароль)
  console.log('📧 Тестируем существующий email с неверным паролем...');
  const existingResult = await testAuthEndpoint('admin@apostles.app', 'wrongpassword');
  
  // Тест с несуществующим пользователем
  console.log('📧 Тестируем несуществующий email...');
  const nonExistingResult = await testAuthEndpoint('nonexistent@example.com', 'anypassword');
  
  console.log('\n📊 Результаты:');
  console.log(`Существующий email: ${existingResult.status} - "${existingResult.message}" (${existingResult.time}ms)`);
  console.log(`Несуществующий email: ${nonExistingResult.status} - "${nonExistingResult.message}" (${nonExistingResult.time}ms)`);
  
  // Анализ
  const sameMessage = existingResult.message === nonExistingResult.message;
  const sameStatus = existingResult.status === nonExistingResult.status;
  const timeDiff = Math.abs(existingResult.time - nonExistingResult.time);
  
  console.log('\n🔍 Анализ безопасности:');
  console.log(`✅ Одинаковые сообщения: ${sameMessage ? 'ДА' : 'НЕТ ⚠️'}`);
  console.log(`✅ Одинаковые статусы: ${sameStatus ? 'ДА' : 'НЕТ ⚠️'}`);
  console.log(`✅ Разница во времени: ${timeDiff}ms ${timeDiff < 100 ? '(хорошо)' : '⚠️ (подозрительно)'}`);
  
  return { sameMessage, sameStatus, timeDiff };
}

async function testRateLimiting() {
  console.log('\n🧪 Тест Rate Limiting');
  console.log('====================');
  
  const testEmail = `test-${Date.now()}@example.com`;
  const results: AuthTestResult[] = [];
  
  console.log(`📧 Тестируем rate limiting для: ${testEmail}`);
  console.log('Выполняем 7 попыток входа...\n');
  
  for (let i = 1; i <= 7; i++) {
    console.log(`Попытка ${i}/7...`);
    const result = await testAuthEndpoint(testEmail, `wrongpassword${i}`);
    results.push(result);
    
    console.log(`  ${result.status} - "${result.message}" (${result.time}ms)`);
    
    // Небольшая пауза между запросами
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  console.log('\n🔍 Анализ Rate Limiting:');
  const blockedRequests = results.filter(r => r.status === 429);
  console.log(`✅ Заблокированные запросы: ${blockedRequests.length}`);
  console.log(`✅ Блокировка началась с попытки: ${results.findIndex(r => r.status === 429) + 1 || 'не найдена'}`);
  
  if (blockedRequests.length > 0) {
    console.log(`✅ Сообщение о блокировке: "${blockedRequests[0].message}"`);
  }
  
  return {
    totalAttempts: results.length,
    blockedCount: blockedRequests.length,
    firstBlockAt: results.findIndex(r => r.status === 429) + 1
  };
}

async function testSecurityHeaders() {
  console.log('\n🧪 Тест Security Headers');
  console.log('========================');
  
  try {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'User-Agent': 'SecurityTestBot/1.0',
        'X-Real-IP': '192.168.1.100'
      },
      body: JSON.stringify({ email: 'test@example.com', password: 'test' })
    });
    
    console.log('📋 Response Headers:');
    response.headers.forEach((value, key) => {
      if (key.toLowerCase().includes('security') || 
          key.toLowerCase().includes('cors') || 
          key.toLowerCase().includes('content')) {
        console.log(`  ${key}: ${value}`);
      }
    });
    
  } catch (error) {
    console.error('❌ Ошибка тестирования headers:', error);
  }
}

async function runAllTests() {
  console.log('🛡️ ТЕСТ БЕЗОПАСНОСТИ АВТОРИЗАЦИИ');
  console.log('==================================');
  console.log('Сервер должен быть запущен на http://localhost:3000\n');
  
  try {
    // Проверяем доступность API
    console.log('🔌 Проверяем доступность API...');
    await fetch(`${API_BASE}/auth/login`, { method: 'POST' });
    console.log('✅ API доступен\n');
  } catch (error) {
    console.error('❌ API недоступен. Запустите сервер: npm run dev');
    return;
  }
  
  const userEnumResults = await testUserEnumeration();
  const rateLimitResults = await testRateLimiting();
  await testSecurityHeaders();
  
  console.log('\n📊 ИТОГОВЫЙ ОТЧЕТ БЕЗОПАСНОСТИ');
  console.log('===============================');
  
  // User Enumeration
  const userEnumSecure = userEnumResults.sameMessage && 
                        userEnumResults.sameStatus && 
                        userEnumResults.timeDiff < 100;
  
  console.log(`🔐 User Enumeration Protection: ${userEnumSecure ? '✅ ЗАЩИЩЕНО' : '❌ УЯЗВИМО'}`);
  
  // Rate Limiting
  const rateLimitSecure = rateLimitResults.blockedCount > 0 && 
                         rateLimitResults.firstBlockAt <= 6;
  
  console.log(`🚫 Rate Limiting Protection: ${rateLimitSecure ? '✅ РАБОТАЕТ' : '❌ НЕ РАБОТАЕТ'}`);
  
  // Общая оценка
  const overallSecure = userEnumSecure && rateLimitSecure;
  console.log(`\n🛡️ ОБЩАЯ БЕЗОПАСНОСТЬ: ${overallSecure ? '✅ ХОРОШАЯ' : '⚠️ ТРЕБУЕТ ВНИМАНИЯ'}`);
  
  if (!overallSecure) {
    console.log('\n⚠️ Рекомендации:');
    if (!userEnumSecure) {
      console.log('- Проверьте единообразие сообщений об ошибках');
      console.log('- Убедитесь что timing attack защита работает');
    }
    if (!rateLimitSecure) {
      console.log('- Проверьте настройки rate limiting');
      console.log('- Убедитесь что RateLimiter корректно инициализирован');
    }
  }
}

// Запуск тестов
runAllTests().catch(console.error); 