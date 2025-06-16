import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useThemeStore } from '../stores/themeStore';
import { useUserStore } from '../stores/userStore';

export const AchievementsScreen: React.FC = () => {
  const navigation = useNavigation();
  const { theme } = useThemeStore();
  const { user } = useUserStore();

  // Mock achievements data - в реальном приложении это будет из API
  const achievements = [
    {
      id: '1',
      title: 'Первые шаги',
      description: 'Завершили первое задание',
      icon: '🎯',
      unlocked: true,
      progress: 100,
      points: 50,
    },
    {
      id: '2',
      title: 'Духовный искатель',
      description: 'Прочитали 10 молитв',
      icon: '🙏',
      unlocked: true,
      progress: 100,
      points: 100,
    },
    {
      id: '3',
      title: 'Путешественник',
      description: 'Посетили 5 святых мест',
      icon: '⛪',
      unlocked: false,
      progress: 60,
      points: 200,
    },
    {
      id: '4',
      title: 'Наставник',
      description: 'Помогли 3 людям в духовном пути',
      icon: '👥',
      unlocked: false,
      progress: 33,
      points: 300,
    },
    {
      id: '5',
      title: 'Мастер молитвы',
      description: 'Молились 30 дней подряд',
      icon: '🌟',
      unlocked: false,
      progress: 0,
      points: 500,
    },
  ];

  const totalPoints = achievements
    .filter(a => a.unlocked)
    .reduce((sum, a) => sum + a.points, 0);

  const renderAchievement = (achievement: any) => (
    <View 
      key={achievement.id}
      style={[
        styles.achievementCard,
        { backgroundColor: theme.colors.surface },
        !achievement.unlocked && styles.lockedCard
      ]}
    >
      <View style={styles.achievementIcon}>
        <Text style={[
          styles.iconText,
          !achievement.unlocked && styles.lockedIcon
        ]}>
          {achievement.unlocked ? achievement.icon : '🔒'}
        </Text>
      </View>

      <View style={styles.achievementContent}>
        <Text style={[
          styles.achievementTitle,
          { color: achievement.unlocked ? theme.colors.text : theme.colors.textSecondary }
        ]}>
          {achievement.title}
        </Text>
        <Text style={[styles.achievementDescription, { color: theme.colors.textSecondary }]}>
          {achievement.description}
        </Text>

        {!achievement.unlocked && achievement.progress > 0 && (
          <View style={styles.progressContainer}>
            <View style={[styles.progressBar, { backgroundColor: theme.colors.border }]}>
              <View 
                style={[
                  styles.progressFill,
                  { 
                    backgroundColor: theme.colors.primary,
                    width: `${achievement.progress}%`
                  }
                ]}
              />
            </View>
            <Text style={[styles.progressText, { color: theme.colors.textSecondary }]}>
              {achievement.progress}%
            </Text>
          </View>
        )}

        <View style={styles.pointsContainer}>
          <Text style={[styles.pointsText, { color: theme.colors.primary }]}>
            {achievement.points} очков
          </Text>
          {achievement.unlocked && (
            <Text style={[styles.unlockedText, { color: theme.colors.success }]}>
              ✓ Разблокировано
            </Text>
          )}
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          Достижения
        </Text>
        <View style={styles.placeholder} />
      </View>

      {/* Stats Section */}
      <View style={[styles.statsSection, { backgroundColor: theme.colors.surface }]}>
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: theme.colors.primary }]}>
            {totalPoints}
          </Text>
          <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
            Всего очков
          </Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: theme.colors.success }]}>
            {achievements.filter(a => a.unlocked).length}
          </Text>
          <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
            Разблокировано
          </Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: theme.colors.textSecondary }]}>
            {achievements.length}
          </Text>
          <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
            Всего
          </Text>
        </View>
      </View>

      {/* Achievements List */}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.achievementsList}>
          {achievements.map(renderAchievement)}
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  backButton: {
    padding: 8,
  },
  backIcon: {
    fontSize: 24,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  placeholder: {
    width: 40,
  },
  statsSection: {
    flexDirection: 'row',
    paddingVertical: 20,
    paddingHorizontal: 16,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  achievementsList: {
    padding: 16,
  },
  achievementCard: {
    flexDirection: 'row',
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  lockedCard: {
    opacity: 0.7,
  },
  achievementIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  iconText: {
    fontSize: 30,
  },
  lockedIcon: {
    fontSize: 24,
    opacity: 0.5,
  },
  achievementContent: {
    flex: 1,
    justifyContent: 'center',
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  achievementDescription: {
    fontSize: 14,
    marginBottom: 8,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressBar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    marginRight: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '500',
    width: 35,
  },
  pointsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pointsText: {
    fontSize: 14,
    fontWeight: '600',
  },
  unlockedText: {
    fontSize: 12,
    fontWeight: '500',
  },
}); 