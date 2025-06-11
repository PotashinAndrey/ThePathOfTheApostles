import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useThemeStore } from '../stores/themeStore';
import { Mission } from '../stores/userStore';
import { getApostleById } from '../constants/apostles';

interface MissionCardProps {
  mission: Mission;
  onPress?: () => void;
}

export const MissionCard: React.FC<MissionCardProps> = ({ mission, onPress }) => {
  const { theme } = useThemeStore();
  const apostle = getApostleById(mission.apostleId);
  
  const daysRemaining = Math.ceil(
    (mission.endDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );
  
  const progressPercentage = mission.progress;

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.surface,
          borderColor: apostle?.color || theme.colors.border,
          borderLeftWidth: 4,
        },
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={[styles.apostleIcon, { color: apostle?.color }]}>
            {apostle?.icon}
          </Text>
          <View style={styles.titleText}>
            <Text style={[styles.title, { color: theme.colors.text }]}>
              {mission.title}
            </Text>
            <Text style={[styles.apostleName, { color: apostle?.color }]}>
              {apostle?.name}
            </Text>
          </View>
        </View>
        
        <View style={styles.statusContainer}>
          {mission.isCompleted ? (
            <View style={[styles.completedBadge, { backgroundColor: theme.colors.success }]}>
              <Text style={styles.completedText}>✓ Завершено</Text>
            </View>
          ) : (
            <Text style={[styles.daysRemaining, { color: theme.colors.textSecondary }]}>
              {daysRemaining > 0 ? `${daysRemaining} дн.` : 'Сегодня'}
            </Text>
          )}
        </View>
      </View>

      <Text 
        style={[styles.description, { color: theme.colors.textSecondary }]}
        numberOfLines={2}
      >
        {mission.description}
      </Text>

      <View style={styles.progressContainer}>
        <View style={[styles.progressBar, { backgroundColor: theme.colors.border }]}>
          <View 
            style={[
              styles.progressFill,
              { 
                width: `${progressPercentage}%`,
                backgroundColor: apostle?.color || theme.colors.primary,
              }
            ]}
          />
        </View>
        <Text style={[styles.progressText, { color: theme.colors.textSecondary }]}>
          {mission.progress}%
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 16,
    marginVertical: 6,
    marginHorizontal: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  apostleIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  titleText: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  apostleName: {
    fontSize: 12,
    fontWeight: '500',
  },
  statusContainer: {
    alignItems: 'flex-end',
  },
  completedBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  completedText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
  daysRemaining: {
    fontSize: 12,
    fontWeight: '500',
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBar: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    marginRight: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '500',
    minWidth: 35,
    textAlign: 'right',
  },
}); 