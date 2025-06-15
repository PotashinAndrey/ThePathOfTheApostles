import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Dimensions,
} from 'react-native';
import { useThemeStore } from '../stores/themeStore';
import apiService from '../services/apiNew';
import { PathInfo, ChallengeInfo } from '../types/api';

const { width } = Dimensions.get('window');

export const PathScreen: React.FC<any> = ({ navigation, route }) => {
  const { theme } = useThemeStore();
  const { pathId } = route.params || {};
  const [path, setPath] = useState<PathInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (pathId) {
      loadPath(pathId);
    } else {
      loadCurrentPath();
    }
  }, [pathId]);

  const loadPath = async (id: string) => {
    try {
      setLoading(true);
      const pathData = await apiService.getPath(id);
      setPath(pathData);
    } catch (error) {
      console.error('Ошибка загрузки пути:', error);
      Alert.alert('Ошибка', 'Не удалось загрузить путь');
    } finally {
      setLoading(false);
    }
  };

  const loadCurrentPath = async () => {
    try {
      setLoading(true);
      const stats = await apiService.getUserStats();
      if (stats.currentPath) {
        setPath(stats.currentPath);
      } else {
        Alert.alert('Информация', 'У вас нет активного пути');
        navigation.goBack();
      }
    } catch (error) {
      console.error('Ошибка загрузки текущего пути:', error);
      Alert.alert('Ошибка', 'Не удалось загрузить текущий путь');
    } finally {
      setLoading(false);
    }
  };

  const handleChallengePress = (challenge: ChallengeInfo) => {
    if (challenge.isCompleted || challenge.isActive) {
      navigation.navigate('Challenge', { challengeId: challenge.id });
    }
  };

  const getChallengeStatusColor = (challenge: ChallengeInfo) => {
    if (challenge.isCompleted) {
      return theme.colors.success;
    } else if (challenge.isActive) {
      return theme.colors.primary;
    } else {
      return theme.colors.border;
    }
  };

  const getChallengeStatusIcon = (challenge: ChallengeInfo) => {
    if (challenge.isCompleted) {
      return '✅';
    } else if (challenge.isActive) {
      return '🎯';
    } else {
      return '⭕';
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: theme.colors.text }]}>
            Загрузка пути...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!path) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: theme.colors.text }]}>
            Путь не найден
          </Text>
          <TouchableOpacity 
            style={[styles.backButton, { backgroundColor: theme.colors.primary }]}
            onPress={() => navigation.goBack()}
          >
            <Text style={[styles.backButtonText, { color: '#FFFFFF' }]}>
              Назад
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={[styles.headerBackButton, { color: theme.colors.primary }]}>← Назад</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
            Путь
          </Text>
        </View>

        <View style={[styles.pathInfo, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.pathHeader}>
            <Text style={styles.pathIcon}>{path.icon}</Text>
            <View style={styles.pathDetails}>
              <Text style={[styles.pathName, { color: theme.colors.text }]}>
                {path.name}
              </Text>
              <Text style={[styles.pathDescription, { color: theme.colors.textSecondary }]}>
                {path.description}
              </Text>
            </View>
          </View>

          <View style={styles.progressContainer}>
            <View style={styles.progressInfo}>
              <Text style={[styles.progressLabel, { color: theme.colors.text }]}>
                Прогресс
              </Text>
              <Text style={[styles.progressText, { color: theme.colors.primary }]}>
                {path.completedChallenges} из {path.totalChallenges} заданий
              </Text>
            </View>
            
            <View style={[styles.progressBar, { backgroundColor: theme.colors.border }]}>
              <View 
                style={[
                  styles.progressFill,
                  { 
                    backgroundColor: theme.colors.primary,
                    width: `${path.progress}%`
                  }
                ]} 
              />
            </View>
            
            <Text style={[styles.progressPercentage, { color: theme.colors.primary }]}>
              {Math.round(path.progress)}%
            </Text>
          </View>
        </View>

        <View style={styles.challengesContainer}>
          <Text style={[styles.challengesTitle, { color: theme.colors.text }]}>
            Карта заданий
          </Text>
          
          <View style={styles.pathMap}>
            {path.challenges
              .sort((a, b) => (a.order || 0) - (b.order || 0))
              .map((challenge, index) => (
                <TouchableOpacity
                  key={challenge.id}
                  style={[
                    styles.challengeNode,
                    {
                      backgroundColor: theme.colors.surface,
                      borderColor: getChallengeStatusColor(challenge),
                    }
                  ]}
                  onPress={() => handleChallengePress(challenge)}
                  disabled={!challenge.isCompleted && !challenge.isActive}
                >
                  <View style={styles.challengeContent}>
                    <Text style={styles.challengeStatusIcon}>
                      {getChallengeStatusIcon(challenge)}
                    </Text>
                    <Text style={[styles.challengeName, { color: theme.colors.text }]}>
                      {challenge.name}
                    </Text>
                    <Text 
                      style={[styles.challengeDescription, { color: theme.colors.textSecondary }]}
                      numberOfLines={2}
                    >
                      {challenge.description}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))
            }
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
  backButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingTop: 10,
  },
  headerBackButton: {
    fontSize: 16,
    fontWeight: '600',
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  pathInfo: {
    margin: 20,
    marginTop: 0,
    padding: 20,
    borderRadius: 16,
  },
  pathHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  pathIcon: {
    fontSize: 48,
    marginRight: 16,
  },
  pathDetails: {
    flex: 1,
  },
  pathName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  pathDescription: {
    fontSize: 16,
    lineHeight: 24,
  },
  progressContainer: {
    marginTop: 8,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  progressText: {
    fontSize: 14,
    fontWeight: '500',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressPercentage: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'right',
  },
  challengesContainer: {
    margin: 20,
    marginTop: 0,
  },
  challengesTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  pathMap: {
    gap: 16,
  },
  challengeNode: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 2,
  },
  challengeContent: {
    alignItems: 'center',
  },
  challengeStatusIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  challengeName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    textAlign: 'center',
  },
  challengeDescription: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
}); 