import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useThemeStore } from '../stores/themeStore';
import { TaskWrapperInfo } from '../types/api';
import apiService from '../services/apiNew';

interface TaskWrapperCardProps {
  taskWrapper: TaskWrapperInfo;
  onPress?: (taskWrapper: TaskWrapperInfo) => void;
  onStatusChange?: () => void; // Callback для обновления UI после изменения статуса
  showActions?: boolean; // Показывать ли кнопки действий
}

export const TaskWrapperCard: React.FC<TaskWrapperCardProps> = ({
  taskWrapper,
  onPress,
  onStatusChange,
  showActions = true,
}) => {
  const { theme } = useThemeStore();
  const [isLoading, setIsLoading] = useState(false);

  const getStatusColor = () => {
    if (taskWrapper.isCompleted) return theme.colors.success;
    if (taskWrapper.isActive) return theme.colors.primary;
    if (taskWrapper.isAvailable) return theme.colors.textSecondary;
    return '#999999'; // Заблокированные задания
  };

  const getStatusText = () => {
    if (taskWrapper.isCompleted) return 'Выполнено';
    if (taskWrapper.isActive) return 'Активно';
    if (taskWrapper.isAvailable) return 'Доступно';
    return 'Заблокировано';
  };

  const getStatusIcon = () => {
    if (taskWrapper.isCompleted) return '✅';
    if (taskWrapper.isActive) return '⚡';
    if (taskWrapper.isAvailable) return '📋';
    return '🔒';
  };

  const handleActivate = async () => {
    Alert.alert(
      'Начать задание',
      `Вы готовы приступить к выполнению задания "${taskWrapper.task.name}"?`,
      [
        { text: 'Не сейчас', style: 'cancel' },
        {
          text: 'Начать',
          style: 'default',
          onPress: async () => {
            try {
              setIsLoading(true);
              await apiService.activateTaskWrapper(taskWrapper.id);
              
              Alert.alert(
                'Задание активировано! 🎯',
                'Теперь вы можете выполнять это задание. Удачи!',
                [{ text: 'OK', onPress: onStatusChange }]
              );
            } catch (error) {
              console.error('Ошибка активации задания:', error);
              Alert.alert('Ошибка', 'Не удалось активировать задание');
            } finally {
              setIsLoading(false);
            }
          }
        }
      ]
    );
  };

  const handleComplete = async () => {
    Alert.alert(
      'Завершить задание',
      `Вы действительно выполнили задание "${taskWrapper.task.name}"?`,
      [
        { text: 'Нет', style: 'cancel' },
        {
          text: 'Да, завершить',
          style: 'default',
          onPress: async () => {
            try {
              setIsLoading(true);
              await apiService.completeTaskWrapper(taskWrapper.id);
              
              Alert.alert(
                'Поздравляем! 🎉',
                'Задание успешно выполнено. Продолжайте духовный рост!',
                [{ text: 'OK', onPress: onStatusChange }]
              );
            } catch (error) {
              console.error('Ошибка завершения задания:', error);
              Alert.alert('Ошибка', 'Не удалось завершить задание');
            } finally {
              setIsLoading(false);
            }
          }
        }
      ]
    );
  };

  const handleSkip = async () => {
    Alert.alert(
      'Пропустить задание',
      `Вы уверены, что хотите пропустить задание "${taskWrapper.task.name}"? Это не повлияет на ваш прогресс негативно.`,
      [
        { text: 'Не пропускать', style: 'cancel' },
        {
          text: 'Пропустить',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsLoading(true);
              await apiService.skipTaskWrapper(taskWrapper.id, 'Пользователь решил пропустить задание');
              
              Alert.alert(
                'Задание пропущено',
                'Не переживайте, вы можете продолжить духовный путь с другими заданиями.',
                [{ text: 'OK', onPress: onStatusChange }]
              );
            } catch (error) {
              console.error('Ошибка пропуска задания:', error);
              Alert.alert('Ошибка', 'Не удалось пропустить задание');
            } finally {
              setIsLoading(false);
            }
          }
        }
      ]
    );
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        { 
          backgroundColor: theme.colors.surface,
          borderColor: getStatusColor() + '30',
        }
      ]}
      onPress={() => onPress?.(taskWrapper)}
      disabled={isLoading}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.taskInfo}>
          <Text style={[styles.taskName, { color: theme.colors.text }]}>
            {taskWrapper.task.name}
          </Text>
          <Text style={[styles.taskOrder, { color: theme.colors.textSecondary }]}>
            Задание {taskWrapper.order}
          </Text>
        </View>
        
        <View style={[
          styles.statusBadge,
          { backgroundColor: getStatusColor() + '20' }
        ]}>
          <Text style={[styles.statusIcon, { color: getStatusColor() }]}>
            {getStatusIcon()}
          </Text>
          <Text style={[
            styles.statusText,
            { color: getStatusColor() }
          ]}>
            {getStatusText()}
          </Text>
        </View>
      </View>

      {/* Task Description */}
      <Text style={[
        styles.taskDescription,
        { 
          color: theme.colors.textSecondary,
          textDecorationLine: taskWrapper.isCompleted ? 'line-through' : 'none',
        }
      ]}>
        {taskWrapper.task.description}
      </Text>

      {/* Apostle Info */}
      {taskWrapper.apostle && (
        <View style={styles.apostleInfo}>
          <Text style={styles.apostleIcon}>
            {taskWrapper.apostle.icon}
          </Text>
          <Text style={[styles.apostleName, { color: taskWrapper.apostle.color }]}>
            {taskWrapper.apostle.name}
          </Text>
        </View>
      )}

      {/* Action Buttons */}
      {showActions && !isLoading && (
        <View style={styles.actions}>
          {/* Заблокированное задание */}
          {!taskWrapper.isAvailable && !taskWrapper.isCompleted && (
            <View style={[
              styles.blockedBadge,
              { backgroundColor: '#f5f5f5', borderColor: '#ddd', borderWidth: 1 }
            ]}>
              <Text style={[styles.blockedText, { color: '#999' }]}>
                🔒 Завершите предыдущее задание
              </Text>
            </View>
          )}

          {/* Доступное для активации задание */}
          {taskWrapper.isAvailable && !taskWrapper.isActive && !taskWrapper.isCompleted && (
            <TouchableOpacity
              style={[
                styles.actionButton,
                styles.activateButton,
                { backgroundColor: taskWrapper.apostle?.color || theme.colors.primary }
              ]}
              onPress={handleActivate}
            >
              <Text style={styles.actionButtonText}>
                Начать задание
              </Text>
            </TouchableOpacity>
          )}

          {/* Активное задание */}
          {taskWrapper.isActive && !taskWrapper.isCompleted && (
            <View style={styles.activeActions}>
              <TouchableOpacity
                style={[
                  styles.actionButton,
                  styles.completeButton,
                  { backgroundColor: theme.colors.success }
                ]}
                onPress={handleComplete}
              >
                <Text style={styles.actionButtonText}>
                  Завершить
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.actionButton,
                  styles.skipButton,
                  { 
                    backgroundColor: 'transparent',
                    borderWidth: 1,
                    borderColor: theme.colors.textSecondary,
                  }
                ]}
                onPress={handleSkip}
              >
                <Text style={[
                  styles.actionButtonText,
                  { color: theme.colors.textSecondary }
                ]}>
                  Пропустить
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Завершенное задание */}
          {taskWrapper.isCompleted && (
            <View style={[
              styles.completedBadge,
              { backgroundColor: theme.colors.success + '10' }
            ]}>
              <Text style={[styles.completedText, { color: theme.colors.success }]}>
                ✅ Задание выполнено!
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Loading Indicator */}
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="small" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
            Обновляем статус...
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 16,
    marginHorizontal: 20,
    marginBottom: 12,
    borderWidth: 1,
  },
  
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  
  taskInfo: {
    flex: 1,
    marginRight: 12,
  },
  
  taskName: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 22,
  },
  
  taskOrder: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  
  statusIcon: {
    fontSize: 14,
  },
  
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  
  taskDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  
  apostleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  
  apostleIcon: {
    fontSize: 16,
  },
  
  apostleName: {
    fontSize: 14,
    fontWeight: '500',
  },
  
  actions: {
    marginTop: 8,
  },
  
  activeActions: {
    flexDirection: 'row',
    gap: 12,
  },
  
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  
  activateButton: {
    // Стили определяются динамически
  },
  
  completeButton: {
    // Стили определяются динамически
  },
  
  skipButton: {
    // Стили определяются динамически
  },
  
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  
  completedBadge: {
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  
  completedText: {
    fontSize: 14,
    fontWeight: '600',
  },

  blockedBadge: {
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  
  blockedText: {
    fontSize: 14,
    fontWeight: '500',
  },
  
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  
  loadingText: {
    fontSize: 12,
    fontWeight: '500',
  },
}); 