import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useThemeStore } from '../stores/themeStore';
import { useUserStore } from '../stores/userStore';
import { ApostleBlockCard } from '../components/ApostleBlockCard';
import { DailyTaskWidget } from '../components/DailyTaskWidget';
import { MAIN_LEARNING_PATH } from '../constants/learningPath';
import { ApostleBlock, PathTask, LearningPath } from '../constants/learningPath';
import { DailyTaskInfo } from '../types/api';
import apiService from '../services/apiNew';

interface PathScreenProps {
  navigation?: any;
  route?: {
    params?: {
      pathId?: string;
    };
  };
}

export const PathScreen: React.FC<PathScreenProps> = ({ navigation, route }) => {
  const { theme } = useThemeStore();
  const { user } = useUserStore();
  const [learningPath, setLearningPath] = useState<LearningPath>(MAIN_LEARNING_PATH);
  const [expandedBlocks, setExpandedBlocks] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [activeTask, setActiveTask] = useState<DailyTaskInfo | null>(null);

  useEffect(() => {
    // Разворачиваем первый блок (Петра) по умолчанию
    setExpandedBlocks({
      'peter-block': true,
    });
    
    // TODO: Загрузить прогресс пользователя с сервера
    loadUserProgress();
  }, []);

  const loadUserProgress = async () => {
    try {
      setLoading(true);
      
      // Загружаем активное задание
      const activeTaskData = await apiService.getActiveTask();
      if (activeTaskData.hasActiveTask && activeTaskData.currentTask) {
        setActiveTask(activeTaskData.currentTask);
        updateTaskStatus(activeTaskData.currentTask);
      }
      
    } catch (error) {
      console.error('Ошибка загрузки прогресса:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateTaskStatus = (task: DailyTaskInfo) => {
    setLearningPath(prevPath => ({
      ...prevPath,
      blocks: prevPath.blocks.map(block => {
        if (block.apostleId === task.apostleId) {
          return {
            ...block,
            tasks: block.tasks.map(blockTask => {
              if (blockTask.dayNumber === task.dayNumber) {
                return {
                  ...blockTask,
                  status: task.status as any,
                };
              }
              return blockTask;
            }),
          };
        }
        return block;
      }),
    }));
  };

  const handleToggleExpand = (blockId: string) => {
    setExpandedBlocks(prev => ({
      ...prev,
      [blockId]: !prev[blockId],
    }));
  };

  const handleTaskPress = (task: PathTask, block: ApostleBlock) => {
    navigation?.navigate?.('PathTask', {
      task,
      block,
    });
  };

  const handleActiveTaskPress = () => {
    if (!activeTask) return;
    
    navigation?.navigate?.('DailyTask', {
      taskId: activeTask.id,
      task: activeTask,
    });
  };

  const handleActiveTaskComplete = async () => {
    if (!activeTask) return;

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
              await apiService.completeDailyTask(activeTask.id);
              
              Alert.alert(
                'Поздравляем! 🎉',
                'Задание успешно выполнено. Завтра вас ждет новое испытание!',
                [{ text: 'OK' }]
              );
              
              // Перезагружаем прогресс
              loadUserProgress();
            } catch (error) {
              console.error('Ошибка завершения задания:', error);
              Alert.alert('Ошибка', 'Не удалось завершить задание');
            }
          }
        }
      ]
    );
  };

  const handleActiveTaskSkip = async () => {
    if (!activeTask) return;

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
              await apiService.skipDailyTask(activeTask.id);
              
              Alert.alert(
                'Задание отложено',
                'Вы можете вернуться к нему в любое время.',
                [{ text: 'OK' }]
              );
              
              // Перезагружаем прогресс
              loadUserProgress();
            } catch (error) {
              console.error('Ошибка пропуска задания:', error);
              Alert.alert('Ошибка', 'Не удалось отложить задание');
            }
          }
        }
      ]
    );
  };

  const getOverallProgress = () => {
    const totalTasks = learningPath.blocks.reduce((sum, block) => sum + block.totalTasks, 0);
    const completedTasks = learningPath.blocks.reduce((sum, block) => sum + block.completedTasks, 0);
    return totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  };

  const getCompletedBlocksCount = () => {
    return learningPath.blocks.filter(block => block.progress === 100).length;
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
        <TouchableOpacity 
          style={styles.headerBackButton}
          onPress={() => navigation?.goBack?.()}
        >
          <Text style={[styles.headerBackText, { color: theme.colors.primary }]}>
            ← Назад
          </Text>
        </TouchableOpacity>
        
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          Путь Апостолов
        </Text>
        
        <View style={styles.headerProgress}>
          <Text style={[styles.headerProgressText, { color: theme.colors.primary }]}>
            {getOverallProgress()}%
          </Text>
        </View>
      </View>

      {/* Overall Progress */}
      <View style={[styles.overallProgress, { backgroundColor: theme.colors.surface }]}>
        <View style={styles.progressInfo}>
          <Text style={[styles.progressTitle, { color: theme.colors.text }]}>
            Общий прогресс
          </Text>
          <Text style={[styles.progressSubtitle, { color: theme.colors.textSecondary }]}>
            {getCompletedBlocksCount()} из {learningPath.blocks.length} блоков завершено
          </Text>
        </View>
        
        <View style={[styles.progressBar, { backgroundColor: theme.colors.border }]}>
          <View
            style={[
              styles.progressFill,
              {
                backgroundColor: theme.colors.primary,
                width: `${getOverallProgress()}%`,
              },
            ]}
          />
        </View>
      </View>

             {/* Learning Path Description */}
       <View style={styles.pathDescription}>
         <Text style={[styles.descriptionText, { color: theme.colors.textSecondary }]}>
           {learningPath.description}
         </Text>
       </View>

       {/* Active Task Widget */}
       {activeTask && (
         <View style={[styles.activeTaskSection, { backgroundColor: theme.colors.surface, borderColor: theme.colors.primary }]}>
           <Text style={[styles.activeTaskTitle, { color: theme.colors.text }]}>
             🎯 Задание дня
           </Text>
           <DailyTaskWidget
             task={activeTask}
             onPress={handleActiveTaskPress}
             onComplete={handleActiveTaskComplete}
             onSkip={handleActiveTaskSkip}
             showActions={false}
             compact={true}
           />
         </View>
       )}

       {/* Blocks List */}
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {learningPath.blocks.map((block) => (
          <ApostleBlockCard
            key={block.id}
            block={block}
            isExpanded={expandedBlocks[block.id] || false}
            onToggleExpand={() => handleToggleExpand(block.id)}
            onTaskPress={(task) => handleTaskPress(task, block)}
          />
        ))}

        {/* Coming Soon Blocks */}
        <View style={[
          styles.comingSoonContainer,
          { backgroundColor: theme.colors.surface }
        ]}>
          <Text style={[styles.comingSoonIcon]}>🔮</Text>
          <Text style={[styles.comingSoonTitle, { color: theme.colors.text }]}>
            Скоро будет больше!
          </Text>
          <Text style={[styles.comingSoonText, { color: theme.colors.textSecondary }]}>
            Мы работаем над добавлением заданий от остальных 11 апостолов.
            Каждый принесет свои уникальные уроки и испытания.
          </Text>
          
          <View style={styles.upcomingApostles}>
            <Text style={[styles.upcomingTitle, { color: theme.colors.text }]}>
              Ожидайте:
            </Text>
            <Text style={[styles.upcomingList, { color: theme.colors.textSecondary }]}>
              🕊️ Иоанн - Путь Любви{'\n'}
              📊 Матфей - Путь Мудрости{'\n'}
              ⚡ Павел - Путь Преображения{'\n'}
              И многие другие...
            </Text>
          </View>
        </View>

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.text }]}>
            Загружаем прогресс...
          </Text>
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

  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },

  headerProgress: {
    paddingVertical: 8,
    paddingLeft: 8,
  },

  headerProgressText: {
    fontSize: 16,
    fontWeight: 'bold',
  },

  overallProgress: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },

  progressInfo: {
    marginBottom: 10,
  },

  progressTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 3,
  },

  progressSubtitle: {
    fontSize: 13,
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

  pathDescription: {
    paddingHorizontal: 12,
    paddingVertical: 10,
  },

  descriptionText: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    fontStyle: 'italic',
  },

  activeTaskSection: {
    marginHorizontal: 12,
    marginVertical: 8,
    padding: 12,
    borderRadius: 12,
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  activeTaskTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },

  scrollView: {
    flex: 1,
  },

  scrollContent: {
    paddingBottom: 20,
  },

  comingSoonContainer: {
    marginHorizontal: 12,
    marginVertical: 12,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(0,0,0,0.1)',
    borderStyle: 'dashed',
  },

  comingSoonIcon: {
    fontSize: 36,
    marginBottom: 12,
  },

  comingSoonTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 6,
    textAlign: 'center',
  },

  comingSoonText: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 16,
  },

  upcomingApostles: {
    alignItems: 'center',
  },

  upcomingTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 6,
  },

  upcomingList: {
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
  },

  bottomSpacing: {
    height: 20,
  },

  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },

  loadingText: {
    fontSize: 16,
    fontWeight: '500',
  },
}); 