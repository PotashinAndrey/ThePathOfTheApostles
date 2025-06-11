import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { useThemeStore } from '../stores/themeStore';
import { useUserStore } from '../stores/userStore';
import { MissionCard } from '../components/MissionCard';

export const HomeScreen: React.FC = () => {
  const { theme, mode, toggleTheme } = useThemeStore();
  const { user, currentMission, streak, totalDays, logout } = useUserStore();

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
    ];
    return quotes[Math.floor(Math.random() * quotes.length)];
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
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

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={[styles.statCard, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.statNumber, { color: theme.colors.spiritual }]}>
              {streak}
            </Text>
            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
              Дней подряд
            </Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.statNumber, { color: theme.colors.gold }]}>
              {totalDays}
            </Text>
            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
              Всего дней
            </Text>
          </View>
        </View>

        {/* Current Apostle */}
        {user?.currentApostle && (
          <View style={[styles.currentApostleCard, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Ваш наставник
            </Text>
            <View style={styles.apostleInfo}>
              <Text style={[styles.apostleIcon, { color: user.currentApostle.color }]}>
                {user.currentApostle.icon}
              </Text>
              <View style={styles.apostleDetails}>
                <Text style={[styles.apostleName, { color: theme.colors.text }]}>
                  {user.currentApostle.name}
                </Text>
                <Text style={[styles.apostleVirtue, { color: user.currentApostle.color }]}>
                  {user.currentApostle.virtue}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Current Mission */}
        {currentMission ? (
          <View style={styles.missionSection}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Текущее задание
            </Text>
            <MissionCard mission={currentMission} />
          </View>
        ) : (
          <View style={[styles.noMissionCard, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.noMissionText, { color: theme.colors.textSecondary }]}>
              У вас пока нет активных заданий
            </Text>
            <TouchableOpacity style={[styles.startButton, { backgroundColor: theme.colors.primary }]}>
              <Text style={styles.startButtonText}>Начать путь</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Быстрые действия
          </Text>
          <View style={styles.actionButtons}>
            <TouchableOpacity style={[styles.actionButton, { backgroundColor: theme.colors.primary }]}>
              <Text style={styles.actionIcon}>💬</Text>
              <Text style={styles.actionText}>Беседа</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionButton, { backgroundColor: theme.colors.spiritual }]}>
              <Text style={styles.actionIcon}>🎯</Text>
              <Text style={styles.actionText}>Задания</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionButton, { backgroundColor: theme.colors.gold }]}>
              <Text style={styles.actionIcon}>📊</Text>
              <Text style={styles.actionText}>Прогресс</Text>
            </TouchableOpacity>
          </View>
          
          {/* Dev Actions */}
          <View style={styles.devActions}>
            <TouchableOpacity 
              style={[styles.logoutButton, { backgroundColor: '#FF6B6B' }]}
              onPress={() => {
                console.log('🚪 Выход из системы');
                logout();
              }}
            >
              <Text style={styles.logoutButtonText}>🚪 Выйти (Dev)</Text>
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
  currentApostleCard: {
    margin: 20,
    padding: 16,
    borderRadius: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  apostleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  apostleIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  apostleDetails: {
    flex: 1,
  },
  apostleName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  apostleVirtue: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  missionSection: {
    marginBottom: 20,
  },
  noMissionCard: {
    margin: 20,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
  },
  noMissionText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
  },
  startButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  startButtonText: {
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
  devActions: {
    marginTop: 16,
  },
  logoutButton: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
}); 