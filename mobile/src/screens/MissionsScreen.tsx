import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { useThemeStore } from '../stores/themeStore';
import { useUserStore } from '../stores/userStore';
import { MissionCard } from '../components/MissionCard';
import { TaskWrapperCard } from '../components/TaskWrapperCard';
import { TaskWrapperInfo, PathInfo, UserStatsResponse } from '../types/api';
import apiService from '../services/apiNew';

interface MissionsScreenProps {
  navigation?: any;
}

export const MissionsScreen: React.FC<MissionsScreenProps> = ({ navigation }) => {
  const { theme } = useThemeStore();
  const { missions, currentMission } = useUserStore();
  const [activeTaskWrappers, setActiveTaskWrappers] = useState<TaskWrapperInfo[]>([]);
  const [isLoadingTasks, setIsLoadingTasks] = useState(false);
  const [activePaths, setActivePaths] = useState<PathInfo[]>([]);
  const [completedPaths, setCompletedPaths] = useState<PathInfo[]>([]);
  const [isLoadingStats, setIsLoadingStats] = useState(false);

  const activeMissions = missions.filter(mission => !mission.isCompleted);
  const completedMissions = missions.filter(mission => mission.isCompleted);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    await Promise.all([
      loadActiveTaskWrappers(),
      loadUserStats()
    ]);
  };

  const loadActiveTaskWrappers = async () => {
    try {
      setIsLoadingTasks(true);
      const taskWrappers = await apiService.getActiveTaskWrappers();
      setActiveTaskWrappers(taskWrappers);
    } catch (error) {
      console.error('❌ Ошибка загрузки активных заданий:', error);
      setActiveTaskWrappers([]);
    } finally {
      setIsLoadingTasks(false);
    }
  };

  const loadUserStats = async () => {
    try {
      setIsLoadingStats(true);
      const userStats: UserStatsResponse = await apiService.getUserStats();
      
      setActivePaths(userStats.activePaths || []);
      setCompletedPaths(userStats.completedPaths || []);
    } catch (error) {
      console.error('❌ Ошибка загрузки статистики пользователя:', error);
      setActivePaths([]);
      setCompletedPaths([]);
    } finally {
      setIsLoadingStats(false);
    }
  };

  const handleTaskWrapperPress = (taskWrapper: TaskWrapperInfo) => {
    navigation?.navigate?.('PathTask', {
      taskWrapper: taskWrapper,
    });
  };

  const handleMissionPress = (mission: any) => {
    // Navigate to mission details or update progress
    console.log('Mission pressed:', mission.id);
  };

  const handleNewMission = () => {
    // Navigate to apostle selection or mission generation
    console.log('Create new mission');
  };

  const handlePathPress = (path: PathInfo) => {
    // Navigate to path details
    console.log('Path pressed:', path.id);
  };

  const getMainPath = (): PathInfo | null => {
    const mainPath = activePaths.find(path => path.name === 'Основной путь') || 
                     completedPaths.find(path => path.name === 'Основной путь');
    return mainPath || null;
  };

  const mainPath = getMainPath();
  const hasActiveTask = activeTaskWrappers.length > 0;
  const primaryActiveTask = activeTaskWrappers.length > 0 ? activeTaskWrappers[0] : null;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.colors.text }]}>
            Духовные задания
          </Text>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
            Путь к духовному росту через практические задания
          </Text>
        </View>

        {/* Path Status */}
        {isLoadingStats ? (
          <View style={[styles.pathStatusSection, { backgroundColor: theme.colors.surface }]}>
            <ActivityIndicator size="small" color={theme.colors.primary} />
            <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
              Загружаем информацию о пути...
            </Text>
          </View>
        ) : mainPath ? (
          <TouchableOpacity 
            style={[styles.pathStatusSection, { backgroundColor: theme.colors.surface }]}
            onPress={() => handlePathPress(mainPath)}
          >
            <View style={styles.pathHeader}>
              <View style={styles.pathInfo}>
                <Text style={[styles.pathTitle, { color: theme.colors.text }]}>
                  {mainPath.icon || '🛤️'} {mainPath.name}
                </Text>
                <View style={[
                  styles.pathStatusBadge,
                  { backgroundColor: mainPath.isActive ? theme.colors.success : theme.colors.textSecondary }
                ]}>
                  <Text style={styles.pathStatusText}>
                    {mainPath.isActive ? 'Активен' : 'Завершен'}
                  </Text>
                </View>
              </View>
              <Text style={[styles.pathProgress, { color: theme.colors.primary }]}>
                {mainPath.progress}%
              </Text>
            </View>
            
            <Text style={[styles.pathDescription, { color: theme.colors.textSecondary }]}>
              {mainPath.isActive ? 
                'Путь активирован благодаря вашему текущему заданию. Продолжайте выполнять задания для прогресса.' :
                'Поздравляем! Вы завершили основной путь. Теперь доступны дополнительные задания.'
              }
            </Text>
            
            {mainPath.totalChallenges > 0 && (
              <View style={styles.pathProgressBar}>
                <View 
                  style={[
                    styles.pathProgressFill, 
                    { 
                      backgroundColor: theme.colors.primary,
                      width: `${mainPath.progress}%`
                    }
                  ]} 
                />
              </View>
            )}
          </TouchableOpacity>
        ) : (
          <View style={[styles.pathStatusSection, { backgroundColor: theme.colors.surface }]}>
            <View style={styles.pathHeader}>
              <View style={styles.pathInfo}>
                <Text style={[styles.pathTitle, { color: theme.colors.text }]}>
                  🛤️ Основной путь
                </Text>
                <View style={[
                  styles.pathStatusBadge,
                  { backgroundColor: theme.colors.textSecondary }
                ]}>
                  <Text style={styles.pathStatusText}>Не начат</Text>
                </View>
              </View>
            </View>
            
            <Text style={[styles.pathDescription, { color: theme.colors.textSecondary }]}>
              Получите задание от апостола, чтобы активировать путь и начать духовное развитие.
            </Text>
          </View>
        )}

        {/* Active Path Tasks */}
        {isLoadingTasks ? (
          <View style={styles.loadingSection}>
            <ActivityIndicator size="small" color={theme.colors.primary} />
            <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
              Загружаем задания...
            </Text>
          </View>
        ) : activeTaskWrappers.length > 0 ? (
          <View style={styles.dailyTaskSection}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                🎯 Активные задания
              </Text>
              <View style={[styles.priorityBadge, { backgroundColor: theme.colors.spiritual }]}>
                <Text style={styles.priorityText}>
                  {activeTaskWrappers.length}
                </Text>
              </View>
            </View>
            
            {activeTaskWrappers.map((taskWrapper, index) => (
              <TaskWrapperCard
                key={taskWrapper.id}
                taskWrapper={taskWrapper}
                onPress={() => handleTaskWrapperPress(taskWrapper)}
                onStatusChange={loadActiveTaskWrappers}
                showActions={true}
              />
            ))}
            
            <Text style={[styles.taskDescription, { color: theme.colors.textSecondary }]}>
              Выполняйте задания в удобном для вас темпе для лучшего духовного развития
            </Text>
          </View>
        ) : null}

        {/* Current Mission */}
        {currentMission && (
          <View style={styles.currentMissionSection}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                Текущее задание
              </Text>
              <View style={[styles.priorityBadge, { backgroundColor: theme.colors.spiritual }]}>
                <Text style={styles.priorityText}>Приоритет</Text>
              </View>
            </View>
            <MissionCard
              mission={currentMission}
              onPress={() => handleMissionPress(currentMission)}
            />
          </View>
        )}

        {/* Active Missions */}
        {activeMissions.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Активные задания ({activeMissions.length})
            </Text>
            {activeMissions.map((mission) => (
              <MissionCard
                key={mission.id}
                mission={mission}
                onPress={() => handleMissionPress(mission)}
              />
            ))}
          </View>
        )}

        {/* New Mission Button - показываем только если НЕТ активного задания пути */}
        {!hasActiveTask && (
          <View style={styles.newMissionSection}>
            <TouchableOpacity
              style={[styles.newMissionButton, { backgroundColor: theme.colors.primary }]}
              onPress={handleNewMission}
            >
              <Text style={styles.newMissionIcon}>✨</Text>
              <Text style={styles.newMissionText}>Получить новое задание</Text>
            </TouchableOpacity>
            
            <Text style={[styles.newMissionDescription, { color: theme.colors.textSecondary }]}>
              Ваш наставник создаст персональное задание для духовного развития
            </Text>
          </View>
        )}

        {/* Info about blocked new mission - показываем если ЕСТЬ активное задание */}
        {hasActiveTask && (
          <View style={[styles.blockedMissionSection, { backgroundColor: theme.colors.surface }]}>
            <Text style={styles.blockedIcon}>⏳</Text>
            <Text style={[styles.blockedTitle, { color: theme.colors.text }]}>
              Завершите текущее задание
            </Text>
            <Text style={[styles.blockedDescription, { color: theme.colors.textSecondary }]}>
              Сначала выполните активное задание пути, а затем сможете получить новое задание
            </Text>
          </View>
        )}

        {/* Other Active Paths */}
        {activePaths.filter(path => path.name !== 'Основной путь').length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Другие активные пути ({activePaths.filter(path => path.name !== 'Основной путь').length})
            </Text>
            {activePaths.filter(path => path.name !== 'Основной путь').map((path) => (
              <TouchableOpacity
                key={path.id}
                style={[styles.pathCard, { backgroundColor: theme.colors.surface }]}
                onPress={() => handlePathPress(path)}
              >
                <View style={styles.pathCardHeader}>
                  <Text style={[styles.pathCardTitle, { color: theme.colors.text }]}>
                    {path.icon} {path.name}
                  </Text>
                  <Text style={[styles.pathCardProgress, { color: theme.colors.primary }]}>
                    {path.progress}%
                  </Text>
                </View>
                <Text style={[styles.pathCardDescription, { color: theme.colors.textSecondary }]}>
                  {path.description}
                </Text>
                <View style={styles.pathProgressBar}>
                  <View 
                    style={[
                      styles.pathProgressFill, 
                      { 
                        backgroundColor: theme.colors.primary,
                        width: `${path.progress}%`
                      }
                    ]} 
                  />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Completed Missions */}
        {completedMissions.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Завершенные задания ({completedMissions.length})
            </Text>
            {completedMissions.slice(0, 5).map((mission) => (
              <MissionCard
                key={mission.id}
                mission={mission}
                onPress={() => handleMissionPress(mission)}
              />
            ))}
            
            {completedMissions.length > 5 && (
              <TouchableOpacity style={styles.showMoreButton}>
                <Text style={[styles.showMoreText, { color: theme.colors.primary }]}>
                  Показать еще {completedMissions.length - 5} заданий
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* No Missions State */}
        {missions.length === 0 && !hasActiveTask && !isLoadingTasks && (
          <View style={[styles.emptyState, { backgroundColor: theme.colors.surface }]}>
            <Text style={styles.emptyIcon}>🎯</Text>
            <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
              Начните свой духовный путь
            </Text>
            <Text style={[styles.emptyDescription, { color: theme.colors.textSecondary }]}>
              Выберите наставника и получите первое задание для развития души и характера
            </Text>
            <TouchableOpacity
              style={[styles.startButton, { backgroundColor: theme.colors.primary }]}
              onPress={handleNewMission}
            >
              <Text style={styles.startButtonText}>Начать путь</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Stats */}
        {(missions.length > 0 || activePaths.length > 0 || completedPaths.length > 0) && (
          <View style={[styles.statsSection, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.statsTitle, { color: theme.colors.text }]}>
              Статистика пути
            </Text>
            
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, { color: theme.colors.spiritual }]}>
                  {completedMissions.length + completedPaths.length}
                </Text>
                <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                  Завершено
                </Text>
              </View>
              
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, { color: theme.colors.gold }]}>
                  {activeMissions.length + activePaths.length}
                </Text>
                <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                  В процессе
                </Text>
              </View>
              
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, { color: theme.colors.success }]}>
                  {mainPath ? Math.round(mainPath.progress) : 0}%
                </Text>
                <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                  Основной путь
                </Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 22,
    textAlign: 'center',
  },
  pathStatusSection: {
    margin: 20,
    padding: 16,
    borderRadius: 16,
    marginBottom: 8,
  },
  pathHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  pathInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  pathTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginRight: 12,
  },
  pathStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  pathStatusText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '500',
  },
  pathProgress: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  pathDescription: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 8,
  },
  pathProgressBar: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  pathProgressFill: {
    height: '100%',
    borderRadius: 2,
  },
  pathCard: {
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 16,
    borderRadius: 16,
  },
  pathCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  pathCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  pathCardProgress: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  pathCardDescription: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 12,
  },
  currentMissionSection: {
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  priorityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priorityText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
  newMissionSection: {
    padding: 20,
    alignItems: 'center',
  },
  newMissionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 24,
    marginBottom: 12,
  },
  newMissionIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  newMissionText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  newMissionDescription: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  blockedMissionSection: {
    margin: 20,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
  },
  blockedIcon: {
    fontSize: 32,
    marginBottom: 12,
  },
  blockedTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  blockedDescription: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  showMoreButton: {
    padding: 16,
    alignItems: 'center',
  },
  showMoreText: {
    fontSize: 14,
    fontWeight: '500',
  },
  emptyState: {
    margin: 20,
    padding: 32,
    borderRadius: 20,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 24,
  },
  startButton: {
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 24,
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  statsSection: {
    margin: 20,
    padding: 20,
    borderRadius: 16,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  loadingSection: {
    margin: 20,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 12,
  },
  dailyTaskSection: {
    marginBottom: 24,
  },
  taskDescription: {
    fontSize: 12,
    lineHeight: 16,
    textAlign: 'center',
    fontStyle: 'italic',
    marginHorizontal: 20,
    marginTop: 8,
  },
}); 