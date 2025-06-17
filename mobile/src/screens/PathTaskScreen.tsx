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
import { PathTask, ApostleBlock } from '../constants/learningPath';

interface PathTaskScreenProps {
  navigation?: any;
  route?: {
    params?: {
      task: PathTask;
      block: ApostleBlock;
    };
  };
}

export const PathTaskScreen: React.FC<PathTaskScreenProps> = ({ navigation, route }) => {
  const { theme } = useThemeStore();
  const [isCompleting, setIsCompleting] = useState(false);
  
  const task = route?.params?.task;
  const block = route?.params?.block;

  if (!task || !block) {
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

  const handleStartTask = () => {
    Alert.alert(
      'Начать задание',
      'Вы готовы приступить к выполнению этого задания?',
      [
        { text: 'Не сейчас', style: 'cancel' },
        {
          text: 'Начать',
          style: 'default',
          onPress: () => {
            // TODO: Логика активации задания
            Alert.alert(
              'Задание активировано! 🎯',
              'Теперь вы можете выполнять это задание. Удачи!',
              [{ text: 'OK', onPress: () => navigation?.goBack() }]
            );
          }
        }
      ]
    );
  };

  const handleCompleteTask = () => {
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
              setIsCompleting(true);
              
              // TODO: Логика завершения задания
              await new Promise(resolve => setTimeout(resolve, 1000));
              
              Alert.alert(
                'Поздравляем! 🎉',
                'Задание успешно выполнено. Следующее задание теперь доступно!',
                [{ text: 'OK', onPress: () => navigation?.goBack() }]
              );
            } catch (error) {
              console.error('Ошибка завершения задания:', error);
              Alert.alert('Ошибка', 'Не удалось завершить задание');
            } finally {
              setIsCompleting(false);
            }
          }
        }
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return '#FF9800';
      case 'completed':
        return '#4CAF50';
      case 'available':
        return block.color;
      case 'locked':
      default:
        return theme.colors.textSecondary;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Активно';
      case 'completed':
        return 'Выполнено';
      case 'available':
        return 'Доступно';
      case 'locked':
      default:
        return 'Заблокировано';
    }
  };

  const canInteract = task.status === 'available' || task.status === 'active';

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
            День {task.dayNumber}
          </Text>
          <View style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(task.status) + '20' }
          ]}>
            <Text style={[
              styles.statusText,
              { color: getStatusColor(task.status) }
            ]}>
              {getStatusText(task.status)}
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
              textDecorationLine: task.status === 'completed' ? 'line-through' : 'none',
            }
          ]}>
            {task.name}
          </Text>
        </View>

        {/* Apostle Info */}
        <View style={[styles.section, styles.apostleSection]}>
          <Text style={[styles.apostleIcon, { color: block.color }]}>
            {block.icon}
          </Text>
          <View style={styles.apostleInfo}>
            <Text style={[styles.apostleName, { color: theme.colors.text }]}>
              {block.name}
            </Text>
            <Text style={[styles.apostleTitle, { color: block.color }]}>
              {block.title}
            </Text>
          </View>
        </View>

        {/* Motivational Phrase */}
        <View style={[
          styles.section,
          styles.motivationSection,
          { backgroundColor: block.color + '10' }
        ]}>
          <Text style={styles.motivationIcon}>💪</Text>
          <Text style={[
            styles.motivationText,
            { color: block.color }
          ]}>
            {task.motivationalPhrase}
          </Text>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Описание задания
          </Text>
          <Text style={[
            styles.description,
            { color: theme.colors.textSecondary }
          ]}>
            {task.description}
          </Text>
        </View>

        {/* Progress in Block */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Прогресс в блоке
          </Text>
          <View style={styles.progressContainer}>
            <Text style={[styles.progressText, { color: theme.colors.textSecondary }]}>
              Задание {task.dayNumber} из {block.totalTasks}
            </Text>
            <View style={[styles.progressBar, { backgroundColor: theme.colors.border }]}>
              <View
                style={[
                  styles.progressFill,
                  {
                    backgroundColor: block.color,
                    width: `${(task.dayNumber / block.totalTasks) * 100}%`,
                  },
                ]}
              />
            </View>
          </View>
        </View>

        {/* Completion Status */}
        {task.status === 'completed' && (
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
        {task.status === 'locked' && (
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
      {canInteract && (
        <View style={[styles.actions, { backgroundColor: theme.colors.surface }]}>
          {task.status === 'available' ? (
            <TouchableOpacity
              style={[
                styles.startButton,
                { backgroundColor: block.color }
              ]}
              onPress={handleStartTask}
            >
              <Text style={styles.startButtonText}>
                Начать задание
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[
                styles.completeButton,
                { backgroundColor: theme.colors.success }
              ]}
              onPress={handleCompleteTask}
              disabled={isCompleting}
            >
              <Text style={styles.completeButtonText}>
                {isCompleting ? 'Завершаем...' : 'Завершить задание'}
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
    textTransform: 'uppercase',
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
  
  motivationSection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  
  motivationIcon: {
    fontSize: 24,
  },
  
  motivationText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    fontStyle: 'italic',
    lineHeight: 22,
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
  
  progressContainer: {
    gap: 8,
  },
  
  progressText: {
    fontSize: 14,
    fontWeight: '500',
  },
  
  progressBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  
  progressFill: {
    height: '100%',
    borderRadius: 4,
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
  
  startButton: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  
  completeButton: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  
  completeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: 32,
  },
  
  errorText: {
    fontSize: 16,
    textAlign: 'center',
  },
  
  backButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
}); 