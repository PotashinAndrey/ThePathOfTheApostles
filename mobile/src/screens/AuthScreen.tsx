import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useThemeStore } from '../stores/themeStore';
import { useUserStore } from '../stores/userStore';
import { APOSTLES } from '../constants/apostles';
import apiService from '../services/apiNew';

export const AuthScreen: React.FC = () => {
  const { theme } = useThemeStore();
  const { setUser, setLoading } = useUserStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  const handleAuth = async () => {
    if (!email.trim()) {
      Alert.alert('Ошибка', 'Введите email');
      return;
    }

    if (!password.trim()) {
      Alert.alert('Ошибка', 'Введите пароль');
      return;
    }

    if (isRegistering && !name.trim()) {
      Alert.alert('Ошибка', 'Введите имя');
      return;
    }

    if (isRegistering && !confirmPassword.trim()) {
      Alert.alert('Ошибка', 'Подтвердите пароль');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Ошибка', 'Пароль должен содержать минимум 6 символов');
      return;
    }

    if (isRegistering && password !== confirmPassword) {
      Alert.alert('Ошибка', 'Пароли не совпадают');
      return;
    }

    setIsLoading(true);
    setLoading(true); // Устанавливаем глобальное состояние загрузки
    console.log('🔐 Начинаем авторизацию:', { email, isRegistering });

    try {
      let response;
      
      if (isRegistering) {
        console.log('📝 Регистрация нового пользователя');
        response = await apiService.register({
          email,
          password,
          confirmPassword,
          name
        });
        
        // После успешной регистрации уже авторизованы (получаем токен)
        console.log('✅ Регистрация успешна с автоматическим входом');
      } else {
        console.log('🔐 Вход существующего пользователя');
        response = await apiService.login({ email, password });
      }

      console.log('✅ Авторизация успешна:', response);

      // Создаем объект пользователя с апостолом (по умолчанию первый)
      const currentApostle = APOSTLES[0];
      
      const user = {
        id: response.user.id,
        email: response.user.email,
        name: response.user.name,
        currentApostle,
        joinDate: new Date(response.user.joinDate),
        lastActiveDate: new Date(),
      };

      // Сохраняем пользователя и токен (setUser автоматически вызовет setLoading(false))
      setUser(user, response.token);
      
      console.log('✅ Пользователь сохранен в store:', user);
      console.log('🎫 Токен сохранен');

    } catch (error) {
      console.error('❌ Ошибка авторизации:', error);
      
      // Обрабатываем разные типы ошибок безопасно
      let errorMessage = 'Не удалось войти в систему';
      
      if (error instanceof Error) {
        const message = error.message.toLowerCase();
        
        if (message.includes('неверные учетные данные')) {
          errorMessage = 'Неверный email или пароль';
        } else if (message.includes('слишком много попыток')) {
          errorMessage = error.message; // Показываем сообщение о блокировке
        } else if (message.includes('network') || message.includes('fetch')) {
          errorMessage = 'Проблема с сетью. Проверьте интернет-соединение';
        } else {
          errorMessage = 'Произошла ошибка при входе в систему';
        }
      }
      
      Alert.alert('Вход в систему', errorMessage);
    } finally {
      setIsLoading(false);
      setLoading(false); // Сбрасываем глобальное состояние загрузки
    }
  };

  // Быстрый вход для разработки (создает тестового пользователя)
  const handleDevLogin = async () => {
    console.log('⚡ Быстрый вход для разработки');
    setIsLoading(true);
    setLoading(true); // Устанавливаем глобальное состояние загрузки
    
    try {
      const devEmail = `dev-${Date.now()}@apostles.app`;
      const devPassword = 'dev123456';
      const devName = 'Разработчик';
      
      console.log('📝 Создаем dev пользователя:', devEmail);
      
      // Регистрируем dev пользователя
      const response = await apiService.register({
        email: devEmail,
        password: devPassword,
        confirmPassword: devPassword,
        name: devName
      });
      
      // Создаем объект пользователя
      const currentApostle = APOSTLES.find(a => a.id === 'peter') || APOSTLES[0];
      
      const user = {
        id: response.user.id,
        email: response.user.email,
        name: response.user.name,
        currentApostle,
        joinDate: new Date(),
        lastActiveDate: new Date(),
      };

      setUser(user, response.token);
      console.log('✅ Dev пользователь создан и авторизован');
      
    } catch (error) {
      console.error('❌ Ошибка dev входа:', error);
      
      let errorMessage = 'Не удалось создать dev пользователя';
      if (error instanceof Error && error.message.includes('слишком много попыток')) {
        errorMessage = error.message;
      }
      
      Alert.alert('Dev вход', errorMessage);
    } finally {
      setIsLoading(false);
      setLoading(false); // Сбрасываем глобальное состояние загрузки
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.colors.text }]}>
            🙏 Путь Апостолов
          </Text>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
            Духовное развитие с AI-наставниками
          </Text>
        </View>

        {/* Auth Form */}
        <View style={styles.form}>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
                color: theme.colors.text,
              }
            ]}
            placeholder="Email"
            placeholderTextColor={theme.colors.textSecondary}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            editable={!isLoading}
          />

          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
                color: theme.colors.text,
              }
            ]}
            placeholder="Пароль (минимум 6 символов)"
            placeholderTextColor={theme.colors.textSecondary}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            editable={!isLoading}
          />

          {isRegistering && (
            <>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.colors.surface,
                    borderColor: theme.colors.border,
                    color: theme.colors.text,
                  }
                ]}
                placeholder="Подтвердите пароль"
                placeholderTextColor={theme.colors.textSecondary}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                editable={!isLoading}
              />
              
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.colors.surface,
                    borderColor: theme.colors.border,
                    color: theme.colors.text,
                  }
                ]}
                placeholder="Имя"
                placeholderTextColor={theme.colors.textSecondary}
                value={name}
                onChangeText={setName}
                editable={!isLoading}
              />
            </>
          )}

          <TouchableOpacity
            style={[
              styles.authButton,
              {
                backgroundColor: email.trim() && password.trim() && (!isRegistering || (name.trim() && confirmPassword.trim()))
                  ? '#4ECDC4'
                  : theme.colors.border,
              }
            ]}
            onPress={handleAuth}
            disabled={!email.trim() || !password.trim() || (isRegistering && (!name.trim() || !confirmPassword.trim())) || isLoading}
          >
            <Text style={[
              styles.authButtonText,
              { color: email.trim() && password.trim() && (!isRegistering || (name.trim() && confirmPassword.trim())) ? 'white' : theme.colors.textSecondary }
            ]}>
              {isLoading 
                ? '⏳ Обработка...' 
                : isRegistering 
                  ? '📝 Зарегистрироваться' 
                  : '🚪 Войти'
              }
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.switchMode}
            onPress={() => {
              setIsRegistering(!isRegistering);
              setConfirmPassword(''); // Очищаем поле подтверждения пароля при переключении
            }}
            disabled={isLoading}
          >
            <Text style={[styles.switchModeText, { color: theme.colors.primary }]}>
              {isRegistering 
                ? 'Уже есть аккаунт? Войти' 
                : 'Нет аккаунта? Зарегистрироваться'
              }
            </Text>
          </TouchableOpacity>
        </View>

        {/* Dev Login */}
        <View style={styles.devSection}>
          <View style={styles.divider}>
            <View style={[styles.dividerLine, { backgroundColor: theme.colors.border }]} />
            <Text style={[styles.dividerText, { color: theme.colors.textSecondary }]}>для разработки</Text>
            <View style={[styles.dividerLine, { backgroundColor: theme.colors.border }]} />
          </View>

          <TouchableOpacity
            style={[styles.devButton, { backgroundColor: '#FF6B6B' }]}
            onPress={handleDevLogin}
            disabled={isLoading}
          >
            <Text style={styles.devButtonText}>
              ⚡ Быстрый вход (Dev)
            </Text>
          </TouchableOpacity>
        </View>

        {/* Info */}
        <View style={styles.info}>
          <Text style={[styles.infoText, { color: theme.colors.textSecondary }]}>
            🔐 Безопасная авторизация{'\n'}
            Пароли хешируются с солью{'\n'}
            JWT токены для сессий
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
  form: {
    marginBottom: 30,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    marginBottom: 16,
  },
  authButton: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  authButtonText: {
    fontSize: 18,
    fontWeight: '600',
  },
  switchMode: {
    alignItems: 'center',
  },
  switchModeText: {
    fontSize: 16,
    textDecorationLine: 'underline',
  },
  devSection: {
    marginBottom: 20,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
  },
  devButton: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  devButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  info: {
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(76, 205, 196, 0.1)',
  },
  infoText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
}); 