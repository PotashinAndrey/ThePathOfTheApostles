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
import { createOrUpdateUser } from '../services/api';

export const AuthScreen: React.FC = () => {
  const { theme } = useThemeStore();
  const { setUser } = useUserStore();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  const handleQuickLogin = async () => {
    console.log('🚀 Быстрый вход для разработки');
    setIsLoading(true);
    
    try {
      const devUser = {
        id: 'dev-user-' + Date.now(),
        email: 'dev@apostles.app',
        name: 'Разработчик',
        currentApostle: APOSTLES.find(a => a.id === 'peter'),
        joinDate: new Date(),
        lastActiveDate: new Date(),
      };
      
      console.log('👤 Создаем dev пользователя:', devUser);
      
      // Синхронизируем с backend
      try {
        await createOrUpdateUser({
          id: devUser.id,
          email: devUser.email,
          name: devUser.name,
          currentApostleId: devUser.currentApostle?.id,
        });
        console.log('✅ Пользователь синхронизирован с backend');
      } catch (error) {
        console.warn('⚠️ Не удалось синхронизировать с backend, продолжаем локально:', error);
      }
      
      setUser(devUser);
      console.log('✅ Пользователь создан:', devUser);
    } catch (error) {
      console.error('❌ Ошибка быстрого входа:', error);
      Alert.alert('Ошибка', 'Не удалось войти в систему');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAuth = async () => {
    if (!email.trim()) {
      Alert.alert('Ошибка', 'Введите email');
      return;
    }

    if (isRegistering && !name.trim()) {
      Alert.alert('Ошибка', 'Введите имя');
      return;
    }

    setIsLoading(true);
    console.log('🔐 Начинаем авторизацию:', { email, name, isRegistering });

    try {
      const user = {
        id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        email: email.trim(),
        name: isRegistering ? name.trim() : email.split('@')[0],
        currentApostle: APOSTLES.find(a => a.id === 'peter'),
        joinDate: new Date(),
        lastActiveDate: new Date(),
      };

      console.log('👤 Создаем пользователя:', user);

      // Синхронизируем с backend
      try {
        await createOrUpdateUser({
          id: user.id,
          email: user.email,
          name: user.name,
          currentApostleId: user.currentApostle?.id,
        });
        console.log('✅ Пользователь синхронизирован с backend');
      } catch (error) {
        console.warn('⚠️ Не удалось синхронизировать с backend, продолжаем локально:', error);
      }

      // Симулируем задержку API
      await new Promise(resolve => setTimeout(resolve, 1000));

      setUser(user);
      console.log('✅ Авторизация успешна, пользователь:', user);
    } catch (error) {
      console.error('❌ Ошибка авторизации:', error);
      Alert.alert('Ошибка', 'Не удалось войти в систему');
    } finally {
      setIsLoading(false);
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

        {/* Quick Dev Login */}
        <View style={styles.quickLogin}>
          <TouchableOpacity
            style={[styles.quickButton, { backgroundColor: '#FF6B6B' }]}
            onPress={handleQuickLogin}
          >
            <Text style={styles.quickButtonText}>
              ⚡ Быстрый вход (Dev)
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.divider}>
          <View style={[styles.dividerLine, { backgroundColor: theme.colors.border }]} />
          <Text style={[styles.dividerText, { color: theme.colors.textSecondary }]}>или</Text>
          <View style={[styles.dividerLine, { backgroundColor: theme.colors.border }]} />
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

          {isRegistering && (
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
          )}

          <TouchableOpacity
            style={[
              styles.authButton,
              {
                backgroundColor: email.trim() && (!isRegistering || name.trim())
                  ? '#4ECDC4'
                  : theme.colors.border,
              }
            ]}
            onPress={handleAuth}
            disabled={!email.trim() || (isRegistering && !name.trim()) || isLoading}
          >
            <Text style={[
              styles.authButtonText,
              { color: email.trim() && (!isRegistering || name.trim()) ? 'white' : theme.colors.textSecondary }
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
            onPress={() => setIsRegistering(!isRegistering)}
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

        {/* Dev Info */}
        <View style={styles.devInfo}>
          <Text style={[styles.devInfoText, { color: theme.colors.textSecondary }]}>
            🔧 Режим разработки{'\n'}
            Используйте "Быстрый вход" для мгновенного доступа
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
  quickLogin: {
    marginBottom: 20,
  },
  quickButton: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  quickButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
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
  devInfo: {
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 193, 7, 0.1)',
  },
  devInfoText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
}); 