# 🌐 Диагностика белого экрана в Web версии

## 🔍 Что мы исправили:

### 1. ✅ Web-совместимый storage (`utils/storage.ts`)
```typescript
// Автоматически использует:
// - localStorage для web (Platform.OS === 'web')
// - AsyncStorage для mobile
```

### 2. ✅ Error Boundary (`App.tsx`)
```typescript
// Ловит и показывает все ошибки React
// Показывает детальную информацию об ошибке
// Кнопка перезагрузки приложения
```

### 3. ✅ Глобальная обработка ошибок
```typescript
// Ловит все JavaScript ошибки
// Отслеживает необработанные Promise
// Детальное логирование в консоль
```

### 4. ✅ Расширенное логирование
```typescript
// AppNavigator логирует все переходы
// storage операции подробно логируются
// Показывает Platform.OS и User Agent
```

## 🔧 Как диагностировать:

### Шаг 1: Откройте Developer Tools
```bash
# После запуска npm run web откройте:
# Chrome: F12 или Ctrl+Shift+I
# Firefox: F12 или Ctrl+Shift+I
# Safari: Cmd+Option+I
```

### Шаг 2: Проверьте Console
Ищите эти сообщения:
```
🚀 App запущен
🔧 Platform: web
🌐 User Agent: Mozilla/5.0...
🔐 AppNavigator: Проверка авторизации
👤 Текущий пользователь: [null или объект]
📦 storage.getItem вызван: user-storage
🌐 localStorage.getItem результат: [null или данные]
✅ Пользователь авторизован: true/false
```

### Шаг 3: Если видите ошибки
Ошибки будут в формате:
```
🚨 Error Boundary поймал ошибку: [описание]
🚨 Глобальная ошибка JavaScript: [описание]
🚨 Файл: [путь] Строка: [номер]
```

### Шаг 4: Проверьте localStorage
В Console выполните:
```javascript
// Проверяем сохраненные данные
localStorage.getItem('user-storage')

// Очищаем storage если нужно
localStorage.clear()
```

## 🎯 Ожидаемое поведение:

### При первом запуске:
```
📦 storage.getItem вызван: user-storage Platform: web
🌐 localStorage.getItem результат: null
👤 Текущий пользователь: null
✅ Пользователь авторизован: false
🔐 Рендерим AuthScreen для неавторизованного пользователя
🧭 Navigation state изменен: Auth
```

### После авторизации:
```
💾 storage.setItem вызван: user-storage
🌐 Сохраняем в localStorage
✅ storage.setItem успешно
💾 Сохраняем пользователя в store: {id: "dev-user-..."}
✅ Пользователь авторизован: true
📱 Рендерим MainTabs для авторизованного пользователя
🧭 Navigation state изменен: MainTabs
```

## 🚨 Если все еще белый экран:

1. **Очистите cache браузера**: Ctrl+Shift+R (Windows) или Cmd+Shift+R (Mac)
2. **Попробуйте другой браузер**: Chrome, Firefox, Safari
3. **Проверьте Network tab**: есть ли загруженные ресурсы
4. **Инкогнито режим**: чтобы исключить расширения

## 🔄 Команды для сброса:

```bash
# Полная очистка и перезапуск:
cd mobile
rm -rf node_modules/.cache
npm start -- --clear
npm run web
```

## 📱 Сравнение с iOS:

iOS Simulator должен показывать те же логи, но:
```
🔧 Platform: ios
📱 Используем AsyncStorage для mobile
```

Если в iOS работает, а в web нет - проблема точно в web-специфичных модулях. 