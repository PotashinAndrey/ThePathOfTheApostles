import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NavigationProp, ParamListBase } from '@react-navigation/native';
import { useThemeStore } from '../stores/themeStore';
import { useUserStore } from '../stores/userStore';
import apiService from '../services/apiNew';
import { UserProfileResponse } from '../types/api';

export const ProfileScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<ParamListBase>>();
  const { theme } = useThemeStore();
  const { user } = useUserStore();
  const [profile, setProfile] = useState<UserProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const profileData = await apiService.getUserProfile();
      setProfile(profileData);
    } catch (error) {
      console.error('Ошибка загрузки профиля:', error);
      Alert.alert('Ошибка', 'Не удалось загрузить профиль');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const handleAchievementsPress = () => {
    navigation.navigate('Achievements');
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: theme.colors.text }]}>
            Загрузка профиля...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!profile) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: theme.colors.text }]}>
            Не удалось загрузить профиль
          </Text>
          <TouchableOpacity 
            style={[styles.retryButton, { backgroundColor: theme.colors.primary }]}
            onPress={loadProfile}
          >
            <Text style={[styles.retryButtonText, { color: '#FFFFFF' }]}>
              Повторить
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header with back button */}
      <View style={[styles.headerContainer, { backgroundColor: theme.colors.surface }]}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={[styles.backIcon, { color: theme.colors.text }]}>←</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          Профиль
        </Text>
        <View style={styles.headerPlaceholder} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>

        {/* Avatar Section */}
        <View style={[styles.avatarSection, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.avatarContainer}>
            {profile.avatar ? (
              <Image source={{ uri: profile.avatar }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatarPlaceholder, { backgroundColor: theme.colors.primary }]}>
                                 <Text style={[styles.avatarText, { color: '#FFFFFF' }]}>
                   {profile.name.charAt(0).toUpperCase()}
                 </Text>
              </View>
            )}
          </View>
          
          <View style={styles.userInfo}>
            <Text style={[styles.userName, { color: theme.colors.text }]}>
              {profile.name}
            </Text>
            <Text style={[styles.joinDate, { color: theme.colors.textSecondary }]}>
              Путь начат: {formatDate(profile.joinDate)}
            </Text>
          </View>
        </View>

        {/* Stats Section */}
        <View style={[styles.statsSection, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Статистика
          </Text>
          
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: theme.colors.primary }]}>
                {profile.streak}
              </Text>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                Дни подряд
              </Text>
            </View>
            
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: theme.colors.primary }]}>
                {profile.totalChallengesCompleted}
              </Text>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                Заданий выполнено
              </Text>
            </View>
            
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: theme.colors.primary }]}>
                {profile.totalPathsCompleted}
              </Text>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                Путей пройдено
              </Text>
            </View>
          </View>
        </View>

        {/* Current Path Section */}
        {profile.currentPath && (
          <View style={[styles.currentPathSection, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Текущий путь
            </Text>
            
            <TouchableOpacity 
              style={styles.pathCard}
              onPress={() => navigation.navigate('Path', { pathId: profile.currentPath!.id })}
            >
              <View style={styles.pathHeader}>
                <Text style={styles.pathIcon}>{profile.currentPath.icon}</Text>
                <View style={styles.pathInfo}>
                  <Text style={[styles.pathName, { color: theme.colors.text }]}>
                    {profile.currentPath.name}
                  </Text>
                  <Text style={[styles.pathProgress, { color: theme.colors.textSecondary }]}>
                    Прогресс: {profile.currentPath.progress}%
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/* Achievements Section */}
        <View style={[styles.achievementsSection, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.achievementsHeader}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Достижения
            </Text>
            <TouchableOpacity onPress={handleAchievementsPress}>
              <Text style={[styles.seeAllButton, { color: theme.colors.primary }]}>
                Посмотреть все
              </Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.achievementsGrid}>
            {profile.achievements.slice(0, 4).map((achievement) => (
              <View key={achievement.id} style={styles.achievementItem}>
                <Text style={styles.achievementIcon}>{achievement.icon}</Text>
                <Text style={[styles.achievementName, { color: theme.colors.textSecondary }]}>
                  {achievement.name}
                </Text>
              </View>
            ))}
            
            {profile.achievements.length === 0 && (
              <Text style={[styles.noAchievements, { color: theme.colors.textSecondary }]}>
                Пока нет достижений
              </Text>
            )}
          </View>
        </View>

        {/* Subscription Section */}
        <View style={[styles.subscriptionSection, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Подписка
          </Text>
          
          <TouchableOpacity 
            style={styles.subscriptionCard}
            onPress={() => navigation.navigate('Subscriptions')}
          >
            <Text style={[styles.subscriptionName, { color: theme.colors.text }]}>
              {profile.currentSubscription || 'Базовый план'}
            </Text>
            <Text style={[styles.subscriptionAction, { color: theme.colors.primary }]}>
              Изменить план →
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  headerContainer: {
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
  headerPlaceholder: {
    width: 40,
  },
  avatarSection: {
    margin: 20,
    marginTop: 0,
    padding: 20,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    marginRight: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  joinDate: {
    fontSize: 14,
  },
  statsSection: {
    margin: 20,
    marginTop: 0,
    padding: 20,
    borderRadius: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  currentPathSection: {
    margin: 20,
    marginTop: 0,
    padding: 20,
    borderRadius: 16,
  },
  pathCard: {
    marginTop: 8,
  },
  pathHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pathIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  pathInfo: {
    flex: 1,
  },
  pathName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  pathProgress: {
    fontSize: 14,
  },
  achievementsSection: {
    margin: 20,
    marginTop: 0,
    padding: 20,
    borderRadius: 16,
  },
  achievementsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  seeAllButton: {
    fontSize: 16,
    fontWeight: '600',
  },
  achievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  achievementItem: {
    width: '22%',
    alignItems: 'center',
    marginBottom: 12,
  },
  achievementIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  achievementName: {
    fontSize: 10,
    textAlign: 'center',
  },
  noAchievements: {
    fontSize: 14,
    textAlign: 'center',
    width: '100%',
    paddingVertical: 20,
  },
  subscriptionSection: {
    margin: 20,
    marginTop: 0,
    padding: 20,
    borderRadius: 16,
  },
  subscriptionCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  subscriptionName: {
    fontSize: 16,
    fontWeight: '600',
  },
  subscriptionAction: {
    fontSize: 16,
    fontWeight: '600',
  },
}); 