import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useThemeStore } from '../stores/themeStore';
import { DailyTaskInfo } from '../types/api';
import apiService from '../services/apiNew';

interface DailyTaskScreenProps {
  navigation?: any;
  route?: {
    params?: {
      taskId: string;
      task?: DailyTaskInfo;
    };
  };
}

export const DailyTaskScreen: React.FC<DailyTaskScreenProps> = ({ navigation, route }) => {
  const { theme } = useThemeStore();
  const [task, setTask] = useState<DailyTaskInfo | null>(route?.params?.task || null);
  const [isLoading, setIsLoading] = useState(!task);
  const [isCompleting, setIsCompleting] = useState(false);
  const [isSkipping, setIsSkipping] = useState(false);

  useEffect(() => {
    if (!task && route?.params?.taskId) {
      loadTask();
    }
  }, [route?.params?.taskId]);

  const loadTask = async () => {
    if (!route?.params?.taskId) return;
    
    try {
      setIsLoading(true);
      const taskData = await apiService.getDailyTask(route.params.taskId);
      setTask(taskData);
    } catch (error) {
      console.error('Ошибка загрузки задания:', error);
      Alert.alert('Ошибка', 'Не удалось загрузить задание');
      navigation?.goBack();
    } finally {
      setIsLoading(false);
    }
  };

  const handleComplete = async () => {
    if (!task) return;

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
              await apiService.completeDailyTask(task.id);
              
              // Обновляем локальное состояние
              setTask(prev => prev ? { ...prev, status: 'completed', completedAt: new Date() } : null);
              
              Alert.alert(
                'Поздравляем! 🎉',
                'Задание успешно выполнено. Завтра вас ждет новое испытание!',
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

  const handleSkip = async () => {
    if (!task) return;

    Alert.alert(
      'Оставить задание',
      'Задание останется активным и вы сможете вернуться к нему завтра.',
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Оставить',
          style: 'default',
          onPress: async () => {
            try {
              setIsSkipping(true);
              await apiService.skipDailyTask(task.id);
              
              Alert.alert(
                'Задание отложено',
                'Вы можете вернуться к нему в любое время.',
                [{ text: 'OK', onPress: () => navigation?.goBack() }]
              );
            } catch (error) {
              console.error('Ошибка пропуска задания:', error);
              Alert.alert('Ошибка', 'Не удалось отложить задание');
            } finally {
              setIsSkipping(false);
            }
          }
        }
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#FF9800';
      case 'completed': return '#4CAF50';
      case 'pending': return '#9E9E9E';
      case 'skipped': return '#F44336';
      default: return theme.colors.primary;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Активно';
      case 'completed': return 'Выполнено';
      case 'pending': return 'Ожидает';
      case 'skipped': return 'Пропущено';
      default: return status;
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
            Загружаем задание...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!task) {
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
          <Text style={[styles.apostleIcon, { color: task.apostle.color }]}>
            {task.apostle.icon}
          </Text>
          <View style={styles.apostleInfo}>
            <Text style={[styles.apostleName, { color: theme.colors.text }]}>
              {task.apostle.name}
            </Text>
            <Text style={[styles.apostleArchetype, { color: task.apostle.color }]}>
              {task.apostle.archetype}
            </Text>
          </View>
        </View>

        {/* Motivational Phrase */}
        {task.motivationalPhrase && (
          <View style={[
            styles.section,
            styles.motivationSection,
            { backgroundColor: theme.colors.primary + '10' }
          ]}>
            <Text style={[styles.motivationIcon]}>💪</Text>
            <Text style={[
              styles.motivationText,
              { color: theme.colors.primary }
            ]}>
              {task.motivationalPhrase}
            </Text>
          </View>
        )}

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

        {/* Completion Info */}
        {task.status === 'completed' && task.completedAt && (
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
                {new Date(task.completedAt).toLocaleDateString('ru-RU', {
                  day: 'numeric',
                  month: 'long',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Action Buttons */}
      {task.status === 'active' && (
        <View style={[styles.actions, { backgroundColor: theme.colors.surface }]}>
          <TouchableOpacity
            style={[styles.skipActionButton, { borderColor: theme.colors.border }]}
            onPress={handleSkip}
            disabled={isSkipping}
          >
            {isSkipping ? (
              <ActivityIndicator size="small" color={theme.colors.textSecondary} />
            ) : (
              <Text style={[styles.skipActionButtonText, { color: theme.colors.textSecondary }]}>
                Оставить на завтра
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.completeActionButton,
              { backgroundColor: theme.colors.success }
            ]}
            onPress={handleComplete}
            disabled={isCompleting}
          >
            {isCompleting ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.completeActionButtonText}>
                Завершить задание
              </Text>
            )}
          </TouchableOpacity>
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
  
  apostleArchetype: {
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
  
  actions: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  
  skipActionButton: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  
  skipActionButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  
  completeActionButton: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  
  completeActionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  
  loadingText: {
    fontSize: 16,
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