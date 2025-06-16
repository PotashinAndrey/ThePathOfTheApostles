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
import { useUserStore } from '../stores/userStore';
import apiService from '../services/apiNew';
import { UserStatsResponse, ChallengeInfo, PathInfo } from '../types/api';

export const HomeScreen: React.FC<any> = ({ navigation }) => {
  const { theme, mode, toggleTheme } = useThemeStore();
  const { user } = useUserStore();
  const [stats, setStats] = useState<UserStatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const userStats = await apiService.getUserStats();
      setStats(userStats);
    } catch (error) {
      console.error('Ошибка загрузки данных:', error);
      Alert.alert('Ошибка', 'Не удалось загрузить данные');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Доброе утро';
    if (hour < 18) return 'Добрый день';
    return 'Добрый вечер';
  };

  const getMotivationalQuote = () => {
    const quotes = [
      'Каждый день — это новая возможность стать лучше.',
      'Путь к мудрости начинается с одного шага.',
      'В тишине сердца рождается истинная сила.',
      'Терпение и постоянство превращают тутовый лист в шелк.',
      'Дисциплина - это мост между целями и достижениями.',
      'Сильный человек не тот, кто никогда не падает, а тот, кто встает каждый раз.',
    ];
    return quotes[Math.floor(Math.random() * quotes.length)];
  };

  const handlePathPress = () => {
    if (stats?.currentPath) {
      navigation.navigate('Path', { pathId: stats.currentPath.id });
    } else {
      navigation.navigate('Path');
    }
  };

  const handleChallengePress = (challenge: ChallengeInfo) => {
    navigation.navigate('Challenge', { challengeId: challenge.id });
  };

  const handleChatPress = () => {
    if (stats?.currentPath) {
      // Навигация к чату с апостолом текущего пути
      navigation.navigate('Chat', { 
        screen: 'ChatDetail', 
        params: { apostleId: stats.currentPath.challenges[0]?.apostle?.id } 
      });
    } else {
      navigation.navigate('Chat');
    }
  };

  const handleStartPathPress = () => {
    // Навигация к выбору апостола или пути
    navigation.navigate('Apostles');
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: theme.colors.text }]}>
            Загрузка...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.primary}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.greetingContainer}>
            <Text style={[styles.greeting, { color: theme.colors.text }]}>
              {getGreeting()}, {user?.name || 'Путник'}
            </Text>
            <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
              {getMotivationalQuote()}
            </Text>
          </View>
          
          <TouchableOpacity
            style={[styles.themeToggle, { backgroundColor: theme.colors.surface }]}
            onPress={toggleTheme}
          >
            <Text style={{ fontSize: 20 }}>
              {mode === 'light' ? '🌙' : '☀️'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Streak Stats */}
        {stats && (stats.streak > 0 || stats.totalDays > 0) && (
          <View style={styles.statsContainer}>
            <View style={[styles.statCard, { backgroundColor: theme.colors.surface }]}>
              <Text style={[styles.statNumber, { color: theme.colors.spiritual }]}>
                {stats.streak}
              </Text>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                Дней подряд
              </Text>
              <Text style={styles.streakIcon}>🔥</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: theme.colors.surface }]}>
              <Text style={[styles.statNumber, { color: theme.colors.gold }]}>
                {stats.totalDays}
              </Text>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                Всего дней
              </Text>
              <Text style={styles.streakIcon}>📅</Text>
            </View>
          </View>
        )}

        {/* Current Path Progress */}
        {stats?.currentPath ? (
          <View style={[styles.currentPathCard, { backgroundColor: theme.colors.surface }]}>
            <View style={styles.pathHeader}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                Текущий путь
              </Text>
              <TouchableOpacity onPress={handlePathPress}>
                <Text style={[styles.viewAllButton, { color: theme.colors.primary }]}>
                  Перейти к пути →
                </Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.pathInfo}>
              <Text style={styles.pathIcon}>{stats.currentPath.icon}</Text>
              <View style={styles.pathDetails}>
                <Text style={[styles.pathName, { color: theme.colors.text }]}>
                  {stats.currentPath.name}
                </Text>
                <Text style={[styles.pathDescription, { color: theme.colors.textSecondary }]}>
                  {stats.currentPath.description}
                </Text>
              </View>
            </View>

            {/* Progress Bar */}
            <View style={styles.progressContainer}>
              <View style={styles.progressInfo}>
                <Text style={[styles.progressLabel, { color: theme.colors.text }]}>
                  Прогресс: {stats.currentPath.completedChallenges} из {stats.currentPath.totalChallenges} заданий
                </Text>
                <Text style={[styles.progressPercentage, { color: theme.colors.primary }]}>
                  {Math.round(stats.currentPath.progress)}%
                </Text>
              </View>
              
              <View style={[styles.progressBar, { backgroundColor: theme.colors.border }]}>
                <View 
                  style={[
                    styles.progressFill,
                    { 
                      backgroundColor: theme.colors.primary,
                      width: `${stats.currentPath.progress}%`
                    }
                  ]} 
                />
              </View>
            </View>

            <Text style={[styles.motivationalText, { color: theme.colors.textSecondary }]}>
              "Каждый шаг приближает вас к цели. Продолжайте путь!"
            </Text>
          </View>
        ) : (
          <View style={[styles.noPathCard, { backgroundColor: theme.colors.surface }]}>
            <Text style={styles.noPathIcon}>🛤️</Text>
            <Text style={[styles.noPathTitle, { color: theme.colors.text }]}>
              Начните свой путь
            </Text>
            <Text style={[styles.noPathDescription, { color: theme.colors.textSecondary }]}>
              Выберите апостола и начните свое путешествие к лучшей версии себя
            </Text>
            <TouchableOpacity 
              style={[styles.startButton, { backgroundColor: theme.colors.primary }]}
              onPress={handleStartPathPress}
            >
              <Text style={styles.startButtonText}>Начать путь</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Active Challenges */}
        {stats?.activeChallenges && stats.activeChallenges.length > 0 && (
          <View style={styles.challengesSection}>
            <View style={styles.challengesHeader}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                Текущие задания
              </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Missions')}>
                <Text style={[styles.viewAllButton, { color: theme.colors.primary }]}>
                  Все задания →
                </Text>
              </TouchableOpacity>
            </View>
            
            {stats.activeChallenges.slice(0, 3).map((challenge) => (
              <TouchableOpacity
                key={challenge.id}
                style={[styles.challengeCard, { backgroundColor: theme.colors.surface }]}
                onPress={() => handleChallengePress(challenge)}
              >
                <View style={styles.challengeHeader}>
                  <Text style={styles.challengeIcon}>{challenge.icon || '🎯'}</Text>
                  <View style={styles.challengeInfo}>
                    <Text style={[styles.challengeName, { color: theme.colors.text }]}>
                      {challenge.name}
                    </Text>
                    <Text style={[styles.challengeDescription, { color: theme.colors.textSecondary }]}>
                      {challenge.description}
                    </Text>
                  </View>
                  <Text style={[styles.challengeArrow, { color: theme.colors.textSecondary }]}>
                    →
                  </Text>
                </View>
                
                {challenge.apostle && (
                  <Text style={[styles.challengeApostle, { color: theme.colors.primary }]}>
                    с {challenge.apostle.name}
                  </Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Chat Button */}
        {stats?.currentPath && (
          <View style={styles.chatSection}>
            <TouchableOpacity 
              style={[styles.chatButton, { backgroundColor: theme.colors.primary }]}
              onPress={handleChatPress}
            >
              <Text style={styles.chatButtonIcon}>💬</Text>
              <Text style={styles.chatButtonText}>Поговорить с апостолом</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Быстрые действия
          </Text>
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: theme.colors.primary }]}
              onPress={() => navigation.navigate('Chat')}
            >
              <Text style={styles.actionIcon}>💬</Text>
              <Text style={styles.actionText}>Беседы</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: theme.colors.spiritual }]}
              onPress={() => navigation.navigate('Missions')}
            >
              <Text style={styles.actionIcon}>🎯</Text>
              <Text style={styles.actionText}>Задания</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: theme.colors.gold }]}
              onPress={() => navigation.navigate('Profile')}
            >
              <Text style={styles.actionIcon}>📊</Text>
              <Text style={styles.actionText}>Профиль</Text>
            </TouchableOpacity>
          </View>
        </View>
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
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 20,
    paddingTop: 10,
  },
  greetingContainer: {
    flex: 1,
  },
  greeting: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    fontStyle: 'italic',
  },
  themeToggle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 6,
    alignItems: 'center',
    position: 'relative',
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  streakIcon: {
    position: 'absolute',
    top: 8,
    right: 8,
    fontSize: 16,
  },
  currentPathCard: {
    margin: 20,
    marginTop: 0,
    padding: 20,
    borderRadius: 16,
  },
  pathHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  viewAllButton: {
    fontSize: 14,
    fontWeight: '500',
  },
  pathInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  pathIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  pathDetails: {
    flex: 1,
  },
  pathName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  pathDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  progressContainer: {
    marginBottom: 12,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    flex: 1,
  },
  progressPercentage: {
    fontSize: 14,
    fontWeight: '600',
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  motivationalText: {
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  noPathCard: {
    margin: 20,
    marginTop: 0,
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
  },
  noPathIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  noPathTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  noPathDescription: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 20,
  },
  startButton: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 24,
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  challengesSection: {
    margin: 20,
    marginTop: 0,
  },
  challengesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  challengeCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  challengeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  challengeIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  challengeInfo: {
    flex: 1,
  },
  challengeName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  challengeDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  challengeArrow: {
    fontSize: 18,
    marginLeft: 8,
  },
  challengeApostle: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 8,
    marginLeft: 36,
  },
  chatSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  chatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 16,
  },
  chatButtonIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  chatButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  quickActions: {
    padding: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 16,
    marginHorizontal: 6,
    borderRadius: 16,
    alignItems: 'center',
  },
  actionIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  actionText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
}); 