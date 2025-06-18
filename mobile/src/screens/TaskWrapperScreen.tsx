import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useThemeStore } from '../stores/themeStore';
import { useTaskWrapperStore } from '../stores/taskWrapperStore';
import { TaskWrapperInfo } from '../types/api';

interface TaskWrapperScreenProps {
  navigation?: any;
  route?: {
    params?: {
      taskWrapper: TaskWrapperInfo;
    };
  };
}

export const TaskWrapperScreen: React.FC<TaskWrapperScreenProps> = ({ navigation, route }) => {
  const { theme } = useThemeStore();
  const { activateTaskWrapper, completeTaskWrapper } = useTaskWrapperStore();
  const [isProcessing, setIsProcessing] = useState(false);
  
  const taskWrapper = route?.params?.taskWrapper;

  if (!taskWrapper) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: theme.colors.textSecondary }]}>
            Задание не найдено
          </Text>
          <TouchableOpacity
            style={[styles.backButton, { backgroundColor: theme.colors.primary }]}
            onPress={() => navigation?.goBack()}
          >
            <Text style={styles.backButtonText}>Назад</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const handleActivateTask = async () => {
    Alert.alert(
      'Активировать задание',
      'Вы готовы приступить к выполнению этого задания?',
      [
        { text: 'Не сейчас', style: 'cancel' },
        {
          text: 'Активировать',
          style: 'default',
          onPress: async () => {
            try {
              setIsProcessing(true);
              await activateTaskWrapper(taskWrapper.id);
              
              Alert.alert(
                'Задание активировано! 🎯',
                'Теперь вы можете выполнять это задание. Удачи!',
                [{ text: 'OK', onPress: () => navigation?.goBack() }]
              );
            } catch (error) {
              console.error('Ошибка активации задания:', error);
              Alert.alert('Ошибка', 'Не удалось активировать задание');
            } finally {
              setIsProcessing(false);
            }
          }
        }
      ]
    );
  };

  const handleCompleteTask = async () => {
    Alert.alert(
      'Завершить задание',
      'Вы действительно выполнили это задание?',
      [
        { text: 'Нет', style: 'cancel' },
        {
          text: 'Да, завершить',
          style: 'default',
          onPress: async () => {
            try {
              setIsProcessing(true);
              await completeTaskWrapper(taskWrapper.id);
              
              Alert.alert(
                'Поздравляем! 🎉',
                'Задание успешно выполнено. Следующее задание теперь доступно!',
                [{ text: 'OK', onPress: () => navigation?.goBack() }]
              );
            } catch (error) {
              console.error('Ошибка завершения задания:', error);
              Alert.alert('Ошибка', 'Не удалось завершить задание');
            } finally {
              setIsProcessing(false);
            }
          }
        }
      ]
    );
  };

  const getStatusColor = () => {
    if (taskWrapper.isCompleted) return '#4CAF50';
    if (taskWrapper.isActive) return '#FF9800';
    if (taskWrapper.isAvailable) return taskWrapper.apostle.color;
    return theme.colors.textSecondary;
  };

  const getStatusText = () => {
    if (taskWrapper.isCompleted) return 'Выполнено';
    if (taskWrapper.isActive) return 'Активно';
    if (taskWrapper.isAvailable) return 'Доступно';
    return 'Заблокировано';
  };

  const getStatusIcon = () => {
    if (taskWrapper.isCompleted) return '✅';
    if (taskWrapper.isActive) return '🎯';
    if (taskWrapper.isAvailable) return '⭐';
    return '🔒';
  };

  const canActivate = taskWrapper.isAvailable && !taskWrapper.isActive && !taskWrapper.isCompleted;
  const canComplete = taskWrapper.isActive && !taskWrapper.isCompleted;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
        <TouchableOpacity 
          style={styles.headerBackButton}
          onPress={() => navigation?.goBack()}
        >
          <Text style={[styles.headerBackText, { color: theme.colors.primary }]}>
            ← Назад
          </Text>
        </TouchableOpacity>
        
        <View style={styles.headerInfo}>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
            Задание #{taskWrapper.order}
          </Text>
          <View style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor() + '20' }
          ]}>
            <Text style={[
              styles.statusText,
              { color: getStatusColor() }
            ]}>
              {getStatusIcon()} {getStatusText()}
            </Text>
          </View>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Task Title */}
        <View style={styles.section}>
          <Text style={[
            styles.taskTitle,
            {
              color: theme.colors.text,
              textDecorationLine: taskWrapper.isCompleted ? 'line-through' : 'none',
            }
          ]}>
            {taskWrapper.task.name}
          </Text>
        </View>

        {/* Task Icon */}
        <View style={styles.iconSection}>
          <Text style={styles.taskIcon}>
            {taskWrapper.icon}
          </Text>
        </View>

        {/* Apostle Info */}
        <View style={[styles.section, styles.apostleSection]}>
          <Text style={[styles.apostleIcon, { color: taskWrapper.apostle.color }]}>
            {taskWrapper.apostle.icon}
          </Text>
          <View style={styles.apostleInfo}>
            <Text style={[styles.apostleName, { color: theme.colors.text }]}>
              {taskWrapper.apostle.name}
            </Text>
            <Text style={[styles.apostleTitle, { color: taskWrapper.apostle.color }]}>
              {taskWrapper.apostle.title}
            </Text>
            <Text style={[styles.apostleArchetype, { color: theme.colors.textSecondary }]}>
              {taskWrapper.apostle.archetype}
            </Text>
          </View>
        </View>

        {/* Apostle Description */}
        <View style={[
          styles.section,
          styles.apostleDescriptionSection,
          { backgroundColor: taskWrapper.apostle.color + '10' }
        ]}>
          <Text style={[
            styles.apostleDescription,
            { color: taskWrapper.apostle.color }
          ]}>
            {taskWrapper.apostle.description}
          </Text>
        </View>

        {/* Personality */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Личность апостола
          </Text>
          <Text style={[
            styles.personality,
            { color: theme.colors.textSecondary }
          ]}>
            {taskWrapper.apostle.personality}
          </Text>
        </View>

        {/* Virtue */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Добродетель
          </Text>
          <Text style={[
            styles.virtue,
            { color: taskWrapper.apostle.color }
          ]}>
            {taskWrapper.apostle.virtue.name}: {taskWrapper.apostle.virtue.description}
          </Text>
        </View>

        {/* Task Description */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Описание задания
          </Text>
          <Text style={[
            styles.description,
            { color: theme.colors.textSecondary }
          ]}>
            {taskWrapper.task.description}
          </Text>
        </View>

        {/* Completion Status */}
        {taskWrapper.isCompleted && (
          <View style={[
            styles.section,
            styles.completionSection,
            { backgroundColor: theme.colors.success + '10' }
          ]}>
            <Text style={styles.completionIcon}>✅</Text>
            <View style={styles.completionInfo}>
              <Text style={[styles.completionTitle, { color: theme.colors.success }]}>
                Задание выполнено!
              </Text>
              <Text style={[styles.completionDate, { color: theme.colors.textSecondary }]}>
                Отличная работа! Переходите к следующему заданию.
              </Text>
            </View>
          </View>
        )}

        {/* Locked Status */}
        {!taskWrapper.isAvailable && (
          <View style={[
            styles.section,
            styles.lockedSection,
            { backgroundColor: theme.colors.textSecondary + '10' }
          ]}>
            <Text style={styles.lockedIcon}>🔒</Text>
            <View style={styles.lockedInfo}>
              <Text style={[styles.lockedTitle, { color: theme.colors.textSecondary }]}>
                Задание заблокировано
              </Text>
              <Text style={[styles.lockedDescription, { color: theme.colors.textSecondary }]}>
                Выполните предыдущие задания, чтобы разблокировать это.
              </Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Action Buttons */}
      {(canActivate || canComplete) && (
        <View style={[styles.actions, { backgroundColor: theme.colors.surface }]}>
          {canActivate ? (
            <TouchableOpacity
              style={[
                styles.activateButton,
                { backgroundColor: taskWrapper.apostle.color }
              ]}
              onPress={handleActivateTask}
              disabled={isProcessing}
            >
              <Text style={styles.activateButtonText}>
                {isProcessing ? 'Активируем...' : 'Активировать задание'}
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[
                styles.completeButton,
                { backgroundColor: theme.colors.success }
              ]}
              onPress={handleCompleteTask}
              disabled={isProcessing}
            >
              <Text style={styles.completeButtonText}>
                {isProcessing ? 'Завершаем...' : 'Завершить задание'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  
  errorText: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 24,
  },
  
  backButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  
  headerBackButton: {
    paddingVertical: 8,
    paddingRight: 8,
  },
  
  headerBackText: {
    fontSize: 16,
    fontWeight: '600',
  },
  
  headerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  
  section: {
    marginVertical: 12,
  },
  
  taskTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    lineHeight: 32,
    textAlign: 'center',
  },
  
  iconSection: {
    alignItems: 'center',
    marginVertical: 8,
  },
  
  taskIcon: {
    fontSize: 48,
  },
  
  apostleSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  
  apostleIcon: {
    fontSize: 32,
  },
  
  apostleInfo: {
    alignItems: 'center',
  },
  
  apostleName: {
    fontSize: 16,
    fontWeight: '600',
  },
  
  apostleTitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  
  apostleArchetype: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  
  apostleDescriptionSection: {
    padding: 16,
    borderRadius: 12,
  },
  
  apostleDescription: {
    fontSize: 16,
    fontWeight: '500',
    fontStyle: 'italic',
    lineHeight: 22,
    textAlign: 'center',
  },
  
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  
  description: {
    fontSize: 16,
    lineHeight: 24,
  },
  
  personality: {
    fontSize: 16,
    lineHeight: 24,
  },
  
  virtue: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '500',
  },
  
  completionSection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  
  completionIcon: {
    fontSize: 24,
  },
  
  completionInfo: {
    flex: 1,
  },
  
  completionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  
  completionDate: {
    fontSize: 14,
  },
  
  lockedSection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  
  lockedIcon: {
    fontSize: 24,
  },
  
  lockedInfo: {
    flex: 1,
  },
  
  lockedTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  
  lockedDescription: {
    fontSize: 14,
  },
  
  actions: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  
  activateButton: {
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  
  activateButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  
  completeButton: {
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  
  completeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
}); 