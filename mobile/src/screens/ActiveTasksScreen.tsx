import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { useThemeStore } from '../stores/themeStore';
import { useUserStore } from '../stores/userStore';
import { TaskWrapperCard } from '../components/TaskWrapperCard';
import { TaskWrapperInfo } from '../types/api';
import apiService from '../services/apiNew';

interface ActiveTasksScreenProps {
  navigation?: any;
}

export const ActiveTasksScreen: React.FC<ActiveTasksScreenProps> = ({ navigation }) => {
  const { theme } = useThemeStore();
  const { user } = useUserStore();
  const [activeTaskWrappers, setActiveTaskWrappers] = useState<TaskWrapperInfo[]>([]);
  const [completedTaskWrappers, setCompletedTaskWrappers] = useState<TaskWrapperInfo[]>([]);
  const [allTaskWrappers, setAllTaskWrappers] = useState<TaskWrapperInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'active' | 'completed' | 'all'>('active');

  const loadTaskWrappers = useCallback(async () => {
    try {
      console.log('🔄 Загружаем TaskWrappers...');
      
      // Получаем все TaskWrapper
      const allTasks = await apiService.getAllTaskWrappers();
      console.log('📝 Получено заданий:', allTasks.length);
      
      // Фильтруем по статусу
      const activeTasks = allTasks.filter(tw => tw.isActive && !tw.isCompleted);
      const completedTasks = allTasks.filter(tw => tw.isCompleted);
      
      console.log('⚡ Активных заданий:', activeTasks.length);
      console.log('✅ Завершенных заданий:', completedTasks.length);
      
      setAllTaskWrappers(allTasks);
      setActiveTaskWrappers(activeTasks);
      setCompletedTaskWrappers(completedTasks);
      
    } catch (error) {
      console.error('❌ Ошибка загрузки заданий:', error);
      Alert.alert('Ошибка', 'Не удалось загрузить задания');
    }
  }, []);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await loadTaskWrappers();
      setIsLoading(false);
    };
    
    loadData();
  }, [loadTaskWrappers]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadTaskWrappers();
    setIsRefreshing(false);
  };

  const handleTaskWrapperPress = (taskWrapper: TaskWrapperInfo) => {
    navigation?.navigate?.('PathTask', {
      taskWrapper: taskWrapper,
    });
  };

  const getCurrentTaskWrappers = () => {
    switch (selectedTab) {
      case 'active':
        return activeTaskWrappers;
      case 'completed':
        return completedTaskWrappers;
      case 'all':
        return allTaskWrappers;
      default:
        return activeTaskWrappers;
    }
  };

  const getTabTitle = () => {
    switch (selectedTab) {
      case 'active':
        return `Активные задания (${activeTaskWrappers.length})`;
      case 'completed':
        return `Выполненные (${completedTaskWrappers.length})`;
      case 'all':
        return `Все задания (${allTaskWrappers.length})`;
      default:
        return 'Активные задания';
    }
  };

  const getEmptyMessage = () => {
    switch (selectedTab) {
      case 'active':
        return 'У вас пока нет активных заданий.\nПерейдите на страницу "Путь" чтобы активировать задания.';
      case 'completed':
        return 'Вы еще не выполнили ни одного задания.\nПриступайте к выполнению активных заданий!';
      case 'all':
        return 'Заданий не найдено.\nВозможно, еще не созданы задания в системе.';
      default:
        return 'Заданий не найдено';
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
            Загружаем ваши задания...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          Мои задания
        </Text>
        
        <TouchableOpacity
          style={[styles.refreshButton, { borderColor: theme.colors.primary }]}
          onPress={handleRefresh}
          disabled={isRefreshing}
        >
          {isRefreshing ? (
            <ActivityIndicator size="small" color={theme.colors.primary} />
          ) : (
            <Text style={[styles.refreshButtonText, { color: theme.colors.primary }]}>
              🔄
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={[styles.tabsContainer, { backgroundColor: theme.colors.surface }]}>
        <TouchableOpacity
          style={[
            styles.tab,
            selectedTab === 'active' && { backgroundColor: theme.colors.primary + '20' }
          ]}
          onPress={() => setSelectedTab('active')}
        >
          <Text style={[
            styles.tabText,
            { color: selectedTab === 'active' ? theme.colors.primary : theme.colors.textSecondary }
          ]}>
            Активные ({activeTaskWrappers.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tab,
            selectedTab === 'completed' && { backgroundColor: theme.colors.success + '20' }
          ]}
          onPress={() => setSelectedTab('completed')}
        >
          <Text style={[
            styles.tabText,
            { color: selectedTab === 'completed' ? theme.colors.success : theme.colors.textSecondary }
          ]}>
            Выполненные ({completedTaskWrappers.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tab,
            selectedTab === 'all' && { backgroundColor: theme.colors.textSecondary + '20' }
          ]}
          onPress={() => setSelectedTab('all')}
        >
          <Text style={[
            styles.tabText,
            { color: selectedTab === 'all' ? theme.colors.text : theme.colors.textSecondary }
          ]}>
            Все ({allTaskWrappers.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
      >
        {/* Section Title */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            {getTabTitle()}
          </Text>
        </View>

        {/* Task Wrappers List */}
        {getCurrentTaskWrappers().length > 0 ? (
          getCurrentTaskWrappers().map((taskWrapper) => (
            <TaskWrapperCard
              key={taskWrapper.id}
              taskWrapper={taskWrapper}
              onPress={handleTaskWrapperPress}
              onStatusChange={loadTaskWrappers}
              showActions={true}
            />
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyIcon]}>
              {selectedTab === 'active' ? '📋' : selectedTab === 'completed' ? '🎉' : '📚'}
            </Text>
            <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
              {selectedTab === 'active' ? 'Нет активных заданий' : 
               selectedTab === 'completed' ? 'Пока нет выполненных заданий' : 
               'Заданий не найдено'}
            </Text>
            <Text style={[styles.emptyMessage, { color: theme.colors.textSecondary }]}>
              {getEmptyMessage()}
            </Text>
            
            {selectedTab === 'active' && (
              <TouchableOpacity
                style={[styles.goToPathButton, { backgroundColor: theme.colors.primary }]}
                onPress={() => navigation?.navigate?.('Path')}
              >
                <Text style={styles.goToPathButtonText}>
                  Перейти к Пути Апостолов
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
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

  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },

  refreshButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },

  refreshButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },

  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },

  tab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
  },

  tabText: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },

  content: {
    flex: 1,
  },

  sectionHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },

  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingTop: 80,
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

  emptyMessage: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 24,
  },

  goToPathButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },

  goToPathButtonText: {
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
    fontWeight: '500',
  },

  bottomSpacing: {
    height: 20,
  },
}); 