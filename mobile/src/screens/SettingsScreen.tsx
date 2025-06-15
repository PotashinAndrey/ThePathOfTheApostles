import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  TextInput,
  Switch,
  Modal,
} from 'react-native';
import { useThemeStore } from '../stores/themeStore';
import { useUserStore } from '../stores/userStore';
import apiService from '../services/apiNew';
import { UserProfileResponse, ChangePasswordRequest } from '../types/api';

export const SettingsScreen: React.FC<any> = ({ navigation }) => {
  const { theme, mode, toggleTheme } = useThemeStore();
  const { user, logout } = useUserStore();
  const [profile, setProfile] = useState<UserProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Edit name modal
  const [showNameModal, setShowNameModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [nameLoading, setNameLoading] = useState(false);
  
  // Change password modal
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordLoading, setPasswordLoading] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const profileData = await apiService.getUserProfile();
      setProfile(profileData);
      setNewName(profileData.name);
    } catch (error) {
      console.error('Ошибка загрузки профиля:', error);
      Alert.alert('Ошибка', 'Не удалось загрузить профиль');
    } finally {
      setLoading(false);
    }
  };

  const handleNameSave = async () => {
    if (!newName.trim()) {
      Alert.alert('Ошибка', 'Имя не может быть пустым');
      return;
    }

    try {
      setNameLoading(true);
      await apiService.updateUserProfile({ name: newName.trim() });
      setProfile(prev => prev ? { ...prev, name: newName.trim() } : null);
      setShowNameModal(false);
      Alert.alert('Успех', 'Имя обновлено');
    } catch (error) {
      console.error('Ошибка обновления имени:', error);
      Alert.alert('Ошибка', 'Не удалось обновить имя');
    } finally {
      setNameLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      Alert.alert('Ошибка', 'Все поля должны быть заполнены');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      Alert.alert('Ошибка', 'Новые пароли не совпадают');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      Alert.alert('Ошибка', 'Пароль должен содержать минимум 6 символов');
      return;
    }

    try {
      setPasswordLoading(true);
      await apiService.changePassword(passwordData as ChangePasswordRequest);
      setShowPasswordModal(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      Alert.alert('Успех', 'Пароль изменен');
    } catch (error) {
      console.error('Ошибка смены пароля:', error);
      Alert.alert('Ошибка', error instanceof Error ? error.message : 'Не удалось изменить пароль');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Выход',
      'Вы уверены, что хотите выйти из аккаунта?',
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Выйти',
          style: 'destructive',
          onPress: async () => {
            await apiService.logout();
            logout();
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: theme.colors.text }]}>
            Загрузка настроек...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={[styles.backButton, { color: theme.colors.primary }]}>← Назад</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
            Настройки
          </Text>
        </View>

        {/* Profile Section */}
        <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Профиль
          </Text>

          <TouchableOpacity 
            style={styles.settingItem}
            onPress={() => setShowNameModal(true)}
          >
            <View style={styles.settingInfo}>
              <Text style={[styles.settingLabel, { color: theme.colors.text }]}>
                Имя
              </Text>
              <Text style={[styles.settingValue, { color: theme.colors.textSecondary }]}>
                {profile?.name || 'Не указано'}
              </Text>
            </View>
            <Text style={[styles.settingArrow, { color: theme.colors.textSecondary }]}>
              →
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.settingItem}
            onPress={() => setShowPasswordModal(true)}
          >
            <View style={styles.settingInfo}>
              <Text style={[styles.settingLabel, { color: theme.colors.text }]}>
                Пароль
              </Text>
              <Text style={[styles.settingValue, { color: theme.colors.textSecondary }]}>
                Изменить пароль
              </Text>
            </View>
            <Text style={[styles.settingArrow, { color: theme.colors.textSecondary }]}>
              →
            </Text>
          </TouchableOpacity>
        </View>

        {/* App Settings Section */}
        <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Настройки приложения
          </Text>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingLabel, { color: theme.colors.text }]}>
                Темная тема
              </Text>
              <Text style={[styles.settingValue, { color: theme.colors.textSecondary }]}>
                {mode === 'dark' ? 'Включена' : 'Выключена'}
              </Text>
            </View>
            <Switch
              value={mode === 'dark'}
              onValueChange={toggleTheme}
              trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
              thumbColor={mode === 'dark' ? '#FFFFFF' : '#f4f3f4'}
            />
          </View>
        </View>

        {/* Subscription Section */}
        <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Подписка
          </Text>

          <TouchableOpacity 
            style={styles.settingItem}
            onPress={() => navigation.navigate('Subscriptions')}
          >
            <View style={styles.settingInfo}>
              <Text style={[styles.settingLabel, { color: theme.colors.text }]}>
                Текущий план
              </Text>
              <Text style={[styles.settingValue, { color: theme.colors.textSecondary }]}>
                {profile?.currentSubscription || 'Базовый'}
              </Text>
            </View>
            <Text style={[styles.settingArrow, { color: theme.colors.textSecondary }]}>
              →
            </Text>
          </TouchableOpacity>
        </View>

        {/* Actions Section */}
        <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
          <TouchableOpacity 
            style={[styles.logoutButton, { backgroundColor: theme.colors.error }]}
            onPress={handleLogout}
          >
            <Text style={[styles.logoutButtonText, { color: '#FFFFFF' }]}>
              Выйти из аккаунта
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Name Edit Modal */}
      <Modal
        visible={showNameModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowNameModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
              Изменить имя
            </Text>
            
            <TextInput
              style={[styles.modalInput, { 
                backgroundColor: theme.colors.background,
                color: theme.colors.text,
                borderColor: theme.colors.border,
              }]}
              value={newName}
              onChangeText={setNewName}
              placeholder="Введите новое имя"
              placeholderTextColor={theme.colors.textSecondary}
              autoFocus
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, { backgroundColor: theme.colors.border }]}
                onPress={() => setShowNameModal(false)}
                disabled={nameLoading}
              >
                <Text style={[styles.modalButtonText, { color: theme.colors.text }]}>
                  Отмена
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, { backgroundColor: theme.colors.primary }]}
                onPress={handleNameSave}
                disabled={nameLoading}
              >
                <Text style={[styles.modalButtonText, { color: '#FFFFFF' }]}>
                  {nameLoading ? 'Сохранение...' : 'Сохранить'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Password Change Modal */}
      <Modal
        visible={showPasswordModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowPasswordModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
              Изменить пароль
            </Text>
            
            <TextInput
              style={[styles.modalInput, { 
                backgroundColor: theme.colors.background,
                color: theme.colors.text,
                borderColor: theme.colors.border,
              }]}
              value={passwordData.currentPassword}
              onChangeText={(text) => setPasswordData(prev => ({ ...prev, currentPassword: text }))}
              placeholder="Текущий пароль"
              placeholderTextColor={theme.colors.textSecondary}
              secureTextEntry
            />
            
            <TextInput
              style={[styles.modalInput, { 
                backgroundColor: theme.colors.background,
                color: theme.colors.text,
                borderColor: theme.colors.border,
              }]}
              value={passwordData.newPassword}
              onChangeText={(text) => setPasswordData(prev => ({ ...prev, newPassword: text }))}
              placeholder="Новый пароль"
              placeholderTextColor={theme.colors.textSecondary}
              secureTextEntry
            />
            
            <TextInput
              style={[styles.modalInput, { 
                backgroundColor: theme.colors.background,
                color: theme.colors.text,
                borderColor: theme.colors.border,
              }]}
              value={passwordData.confirmPassword}
              onChangeText={(text) => setPasswordData(prev => ({ ...prev, confirmPassword: text }))}
              placeholder="Подтвердите новый пароль"
              placeholderTextColor={theme.colors.textSecondary}
              secureTextEntry
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, { backgroundColor: theme.colors.border }]}
                onPress={() => {
                  setShowPasswordModal(false);
                  setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                }}
                disabled={passwordLoading}
              >
                <Text style={[styles.modalButtonText, { color: theme.colors.text }]}>
                  Отмена
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, { backgroundColor: theme.colors.primary }]}
                onPress={handlePasswordChange}
                disabled={passwordLoading}
              >
                <Text style={[styles.modalButtonText, { color: '#FFFFFF' }]}>
                  {passwordLoading ? 'Изменение...' : 'Изменить'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingTop: 10,
  },
  backButton: {
    fontSize: 16,
    fontWeight: '600',
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  section: {
    margin: 20,
    marginTop: 0,
    padding: 20,
    borderRadius: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  settingInfo: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  settingValue: {
    fontSize: 14,
  },
  settingArrow: {
    fontSize: 18,
    marginLeft: 12,
  },
  logoutButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    padding: 24,
    borderRadius: 16,
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  modalButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
}); 