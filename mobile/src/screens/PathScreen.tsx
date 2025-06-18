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
import { useTaskWrapperStore } from '../stores/taskWrapperStore';
import { TaskWrapperCard } from '../components/TaskWrapperCard';
import { TaskWrapperInfo, PathInfo, ChallengeInfo } from '../types/api';
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
  const { lastUpdated, getTaskWrapper } = useTaskWrapperStore(); // Выносим getTaskWrapper на верхний уровень
  const [pathsData, setPathsData] = useState<PathInfo[]>([]);
  const [expandedChallenges, setExpandedChallenges] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [hasActivePath, setHasActivePath] = useState<boolean>(false);
  const [isStartingPath, setIsStartingPath] = useState<boolean>(false);

  useEffect(() => {
    loadPathsData();
  }, []);

  // Слушаем изменения в taskWrapperStore и перезагружаем данные пути
  useEffect(() => {
    if (lastUpdated && pathsData.length > 0) {
      console.log('🔄 PathScreen: TaskWrapper store обновлен, перезагружаем данные пути');
      loadPathsData();
    }
  }, [lastUpdated]);

  const loadPathsData = async () => {
    try {
      setLoading(true);
      
      // Загружаем пути с полной информацией о заданиях
      const paths = await apiService.getPaths();
      setPathsData(paths);
      
      // Проверяем есть ли активные пути
      const hasActive = paths.some(path => path.isActive);
      setHasActivePath(hasActive);
      
      // Автоматически разворачиваем первое испытание активного пути
      if (hasActive) {
        const activePath = paths.find(path => path.isActive);
        if (activePath && activePath.challenges.length > 0) {
          const firstChallenge = activePath.challenges[0];
          setExpandedChallenges({ [firstChallenge.id]: true });
        }
      }
      
    } catch (error) {
      console.error('Ошибка загрузки путей:', error);
      setPathsData([]);
      setHasActivePath(false);
    } finally {
      setLoading(false);
    }
  };

  const handleStartMainPath = async () => {
    try {
      setIsStartingPath(true);
      
      Alert.alert(
        'Начать Путь Апостолов',
        'Вы готовы начать свое духовное путешествие? Первое задание будет активировано автоматически.',
        [
          { text: 'Не сейчас', style: 'cancel' },
          {
            text: 'Начать путь',
            style: 'default',
            onPress: async () => {
              try {
                await apiService.startPath('main-path');
                
                Alert.alert(
                  'Путь начат! 🎯',
                  'Добро пожаловать в Путь Апостолов! Ваше первое задание активировано.',
                  [{ text: 'OK', onPress: loadPathsData }]
                );
              } catch (error) {
                console.error('Ошибка активации пути:', error);
                Alert.alert('Ошибка', 'Не удалось активировать путь');
              }
            }
          }
        ]
      );
    } catch (error) {
      console.error('Ошибка:', error);
    } finally {
      setIsStartingPath(false);
    }
  };

  const handleToggleChallenge = (challengeId: string) => {
    setExpandedChallenges(prev => ({
      ...prev,
      [challengeId]: !prev[challengeId],
    }));
  };

  const handleTaskWrapperPress = (taskWrapper: TaskWrapperInfo) => {
    navigation?.navigate?.('TaskWrapper', {
      taskWrapper: taskWrapper,
    });
  };

  const refreshTaskWrappers = async () => {
    // Перезагружаем весь путь после изменения статуса задания
    await loadPathsData();
  };

  const getOverallProgress = () => {
    if (pathsData.length === 0) return 0;
    const activePath = pathsData.find(path => path.isActive);
    return activePath ? activePath.progress : 0;
  };

  const getCompletedChallengesCount = () => {
    if (pathsData.length === 0) return 0;
    const activePath = pathsData.find(path => path.isActive);
    return activePath ? activePath.completedChallenges : 0;
  };

  const getTotalChallengesCount = () => {
    if (pathsData.length === 0) return 0;
    const activePath = pathsData.find(path => path.isActive);
    return activePath ? activePath.totalChallenges : 0;
  };

  const getActiveTasksCount = () => {
    if (pathsData.length === 0) return 0;
    const activePath = pathsData.find(path => path.isActive);
    if (!activePath) return 0;
    
    return activePath.challenges.reduce((count, challenge) => {
      return count + challenge.tasks.filter(task => {
        const storeTask = getTaskWrapper(task.id);
        const actualTask = storeTask || task;
        return actualTask.isActive;
      }).length;
    }, 0);
  };

  const renderChallenge = (challenge: ChallengeInfo) => {
    const isExpanded = expandedChallenges[challenge.id] || false;
    
    // Получаем актуальные данные TaskWrapper'ов из store
    const updatedTasks = challenge.tasks.map(task => {
      const storeTask = getTaskWrapper(task.id);
      return storeTask || task; // Используем данные из store если доступны, иначе из challenge
    });
    
    const activeTasks = updatedTasks.filter(task => task.isActive);
    const completedTasks = updatedTasks.filter(task => task.isCompleted);

    return (
      <View key={challenge.id} style={[styles.challengeCard, { backgroundColor: theme.colors.surface }]}>
        {/* Challenge Header */}
        <TouchableOpacity 
          style={styles.challengeHeader}
          onPress={() => handleToggleChallenge(challenge.id)}
        >
          <View style={styles.challengeInfo}>
            <Text style={[styles.challengeIcon, { color: challenge.apostle.color }]}>
              {challenge.apostle.icon}
            </Text>
            <View style={styles.challengeText}>
              <Text style={[styles.challengeName, { color: theme.colors.text }]}>
                {challenge.name}
              </Text>
              <Text style={[styles.challengeApostle, { color: challenge.apostle.color }]}>
                {challenge.apostle.name} • {challenge.apostle.archetype}
              </Text>
              <Text style={[styles.challengeProgress, { color: theme.colors.textSecondary }]}>
                {completedTasks.length} из {challenge.totalTasks} заданий выполнено
              </Text>
            </View>
          </View>
          
          <View style={styles.challengeActions}>
            {challenge.isCompleted && (
              <Text style={styles.completedBadge}>✅</Text>
            )}
            {activeTasks.length > 0 && (
              <View style={[styles.activeBadge, { backgroundColor: challenge.apostle.color }]}>
                <Text style={styles.activeBadgeText}>{activeTasks.length}</Text>
              </View>
            )}
            <Text style={[styles.expandIcon, { color: theme.colors.textSecondary }]}>
              {isExpanded ? '▼' : '▶'}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Progress Bar */}
        <View style={[styles.progressBar, { backgroundColor: theme.colors.border }]}>
          <View
            style={[
              styles.progressFill,
              {
                backgroundColor: challenge.apostle.color,
                width: `${Math.round((completedTasks.length / challenge.totalTasks) * 100)}%`,
              },
            ]}
          />
        </View>

        {/* Tasks List */}
        {isExpanded && (
          <View style={styles.tasksList}>
            <Text style={[styles.tasksTitle, { color: theme.colors.text }]}>
              Задания испытания:
            </Text>
            {updatedTasks
              .sort((a, b) => a.order - b.order)
              .map((taskWrapper) => (
                                 <TaskWrapperCard
                   key={taskWrapper.id}
                   taskWrapper={taskWrapper}
                   onPress={() => handleTaskWrapperPress(taskWrapper)}
                   showActions={true}
                 />
              ))}
          </View>
        )}
      </View>
    );
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
      {hasActivePath && (
        <View style={[styles.overallProgress, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.progressInfo}>
            <Text style={[styles.progressTitle, { color: theme.colors.text }]}>
              Общий прогресс
            </Text>
            <Text style={[styles.progressSubtitle, { color: theme.colors.textSecondary }]}>
              {getCompletedChallengesCount()} из {getTotalChallengesCount()} испытаний завершено
            </Text>
            {getActiveTasksCount() > 0 && (
              <Text style={[styles.activeTasksInfo, { color: theme.colors.primary }]}>
                Активных заданий: {getActiveTasksCount()}
              </Text>
            )}
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
      )}

      {/* Start Path Button */}
      {!hasActivePath && !loading && (
        <View style={[styles.startPathSection, { backgroundColor: theme.colors.surface, borderColor: theme.colors.primary }]}>
          <Text style={[styles.startPathIcon]}>🚀</Text>
          <Text style={[styles.startPathTitle, { color: theme.colors.text }]}>
            Добро пожаловать в Путь Апостолов!
          </Text>
          <Text style={[styles.startPathDescription, { color: theme.colors.textSecondary }]}>
            Начните свое духовное путешествие. Первое задание будет активировано автоматически.
          </Text>
          <TouchableOpacity
            style={[
              styles.startPathButton,
              { backgroundColor: theme.colors.primary },
              isStartingPath && { opacity: 0.7 }
            ]}
            onPress={handleStartMainPath}
            disabled={isStartingPath}
          >
            {isStartingPath ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.startPathButtonText}>
                Начать Путь Апостолов
              </Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      {/* Path Content */}
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {hasActivePath && pathsData.map((path) => {
          if (!path.isActive) return null;
          
          return (
            <View key={path.id}>
              {/* Path Description */}
              <View style={styles.pathDescription}>
                <Text style={[styles.descriptionText, { color: theme.colors.textSecondary }]}>
                  {path.description}
                </Text>
              </View>

              {/* Challenges */}
              {path.challenges.map(renderChallenge)}
            </View>
          );
        })}

        {/* Coming Soon */}
        {hasActivePath && (
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
          </View>
        )}

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
  activeTasksInfo: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 2,
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
  startPathSection: {
    marginHorizontal: 12,
    marginVertical: 8,
    padding: 20,
    borderRadius: 16,
    borderWidth: 2,
    borderStyle: 'solid',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  startPathIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  startPathTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  startPathDescription: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 20,
  },
  startPathButton: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 16,
    minWidth: 200,
    alignItems: 'center',
  },
  startPathButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  challengeCard: {
    marginHorizontal: 12,
    marginVertical: 6,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  challengeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  challengeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  challengeIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  challengeText: {
    flex: 1,
  },
  challengeName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  challengeApostle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  challengeProgress: {
    fontSize: 12,
  },
  challengeActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  completedBadge: {
    fontSize: 20,
  },
  activeBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    minWidth: 20,
    alignItems: 'center',
  },
  activeBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  expandIcon: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  tasksList: {
    marginTop: 8,
  },
  tasksTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
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
    marginBottom: 8,
    textAlign: 'center',
  },
  comingSoonText: {
    fontSize: 14,
    lineHeight: 20,
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
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
}); 