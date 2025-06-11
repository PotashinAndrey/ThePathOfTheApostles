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

export const MissionsScreen: React.FC = () => {
  const { theme } = useThemeStore();
  const { missions, currentMission } = useUserStore();

  const activeMissions = missions.filter(mission => !mission.isCompleted);
  const completedMissions = missions.filter(mission => mission.isCompleted);

  const handleMissionPress = (mission: any) => {
    // Navigate to mission details or update progress
    console.log('Mission pressed:', mission.id);
  };

  const handleNewMission = () => {
    // Navigate to apostle selection or mission generation
    console.log('Create new mission');
  };

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

        {/* New Mission Button */}
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
        {missions.length === 0 && (
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
        {missions.length > 0 && (
          <View style={[styles.statsSection, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.statsTitle, { color: theme.colors.text }]}>
              Статистика пути
            </Text>
            
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, { color: theme.colors.spiritual }]}>
                  {completedMissions.length}
                </Text>
                <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                  Завершено
                </Text>
              </View>
              
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, { color: theme.colors.gold }]}>
                  {activeMissions.length}
                </Text>
                <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                  В процессе
                </Text>
              </View>
              
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, { color: theme.colors.success }]}>
                  {Math.round(completedMissions.reduce((acc, m) => acc + m.progress, 0) / Math.max(missions.length, 1))}%
                </Text>
                <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                  Средний прогресс
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
}); 