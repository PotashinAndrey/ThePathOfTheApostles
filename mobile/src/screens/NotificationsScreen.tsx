import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  RefreshControl,
} from 'react-native';
import { useThemeStore } from '../stores/themeStore';
import apiService from '../services/apiNew';
import { NotificationInfo } from '../types/api';

export const NotificationsScreen: React.FC<any> = ({ navigation }) => {
  const { theme } = useThemeStore();
  const [notifications, setNotifications] = useState<NotificationInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const notificationsData = await apiService.getNotifications();
      // Сортируем от новых к старым
      const sortedNotifications = notificationsData.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setNotifications(sortedNotifications);
    } catch (error) {
      console.error('Ошибка загрузки уведомлений:', error);
      Alert.alert('Ошибка', 'Не удалось загрузить уведомления');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadNotifications();
    setRefreshing(false);
  };

  const handleNotificationPress = async (notification: NotificationInfo) => {
    // Отмечаем как прочитанное
    if (!notification.isRead) {
      try {
        await apiService.markNotificationAsRead(notification.id);
        setNotifications(prev => 
          prev.map(n => 
            n.id === notification.id 
              ? { ...n, isRead: true }
              : n
          )
        );
      } catch (error) {
        console.error('Ошибка отметки уведомления:', error);
      }
    }

    // Навигация в зависимости от типа
    if (notification.type === 'CHALLENGE' && notification.relatedId) {
      navigation.navigate('Challenge', { challengeId: notification.relatedId });
    } else if (notification.type === 'PATH' && notification.relatedId) {
      navigation.navigate('Path', { pathId: notification.relatedId });
    } else if (notification.type === 'ACHIEVEMENT' && notification.relatedId) {
      navigation.navigate('Achievements');
    }
  };

  const getNotificationIcon = (type: NotificationInfo['type']) => {
    switch (type) {
      case 'CHALLENGE':
        return '🎯';
      case 'ACHIEVEMENT':
        return '🏆';
      case 'STREAK':
        return '🔥';
      case 'PATH':
        return '🛤️';
      case 'GENERAL':
      default:
        return '📢';
    }
  };

  const getNotificationTypeText = (type: NotificationInfo['type']) => {
    switch (type) {
      case 'CHALLENGE':
        return 'Задание';
      case 'ACHIEVEMENT':
        return 'Достижение';
      case 'STREAK':
        return 'Стрик';
      case 'PATH':
        return 'Путь';
      case 'GENERAL':
      default:
        return 'Общее';
    }
  };

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays === 0) {
      if (diffHours === 0) {
        const diffMinutes = Math.floor(diffMs / (1000 * 60));
        return diffMinutes < 1 ? 'Только что' : `${diffMinutes} мин назад`;
      }
      return `${diffHours} ч назад`;
    } else if (diffDays === 1) {
      return 'Вчера';
    } else if (diffDays < 7) {
      return `${diffDays} дн назад`;
    } else {
      return d.toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'short',
      });
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: theme.colors.text }]}>
            Загрузка уведомлений...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={[styles.backButton, { color: theme.colors.primary }]}>← Назад</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          Уведомления
        </Text>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.primary}
          />
        }
      >
        {notifications.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📭</Text>
            <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
              Нет уведомлений
            </Text>
            <Text style={[styles.emptyDescription, { color: theme.colors.textSecondary }]}>
              Здесь будут появляться уведомления о заданиях, достижениях и прогрессе
            </Text>
          </View>
        ) : (
          notifications.map((notification) => (
            <TouchableOpacity
              key={notification.id}
              style={[
                styles.notificationItem,
                { 
                  backgroundColor: theme.colors.surface,
                  borderLeftColor: notification.isRead ? 'transparent' : theme.colors.primary,
                }
              ]}
              onPress={() => handleNotificationPress(notification)}
            >
              <View style={styles.notificationHeader}>
                <View style={styles.notificationIconContainer}>
                  <Text style={styles.notificationIcon}>
                    {getNotificationIcon(notification.type)}
                  </Text>
                  <View style={styles.notificationTypeContainer}>
                    <Text style={[styles.notificationType, { color: theme.colors.textSecondary }]}>
                      {getNotificationTypeText(notification.type)}
                    </Text>
                    {!notification.isRead && (
                      <View style={[styles.unreadIndicator, { backgroundColor: theme.colors.primary }]} />
                    )}
                  </View>
                </View>
                <Text style={[styles.notificationTime, { color: theme.colors.textSecondary }]}>
                  {formatDate(notification.createdAt)}
                </Text>
              </View>
              
              <Text style={[
                styles.notificationTitle, 
                { 
                  color: theme.colors.text,
                  fontWeight: notification.isRead ? '500' : '600',
                }
              ]}>
                {notification.title}
              </Text>
              
              <Text style={[
                styles.notificationMessage, 
                { 
                  color: theme.colors.textSecondary,
                  opacity: notification.isRead ? 0.7 : 1,
                }
              ]}>
                {notification.message}
              </Text>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  scrollContent: {
    paddingBottom: 100,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    marginTop: 100,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  notificationItem: {
    margin: 20,
    marginTop: 0,
    padding: 20,
    borderRadius: 16,
    borderLeftWidth: 4,
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  notificationIconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  notificationIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  notificationTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  notificationType: {
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  unreadIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 6,
  },
  notificationTime: {
    fontSize: 12,
    marginLeft: 12,
  },
  notificationTitle: {
    fontSize: 16,
    marginBottom: 4,
    lineHeight: 22,
  },
  notificationMessage: {
    fontSize: 14,
    lineHeight: 20,
  },
}); 