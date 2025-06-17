import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useThemeStore } from '../stores/themeStore';
import { DailyTaskInfo } from '../types/api';

interface DailyTaskWidgetProps {
  task: DailyTaskInfo;
  onPress?: () => void;
  onComplete?: () => void;
  onSkip?: () => void;
  showActions?: boolean;
  compact?: boolean;
}

export const DailyTaskWidget: React.FC<DailyTaskWidgetProps> = ({
  task,
  onPress,
  onComplete,
  onSkip,
  showActions = false,
  compact = false,
}) => {
  const { theme } = useThemeStore();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#FF9800';
      case 'completed': return '#4CAF50';
      case 'pending': return '#9E9E9E';
      case 'skipped': return '#F44336';
      default: return theme.colors.primary;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Активно';
      case 'completed': return 'Выполнено';
      case 'pending': return 'Ожидает';
      case 'skipped': return 'Пропущено';
      default: return status;
    }
  };

  if (compact) {
    return (
      <TouchableOpacity
        style={[
          styles.compactContainer,
          {
            backgroundColor: theme.colors.surface,
            borderColor: getStatusColor(task.status),
          }
        ]}
        onPress={onPress}
        activeOpacity={0.8}
      >
        <View style={styles.compactContent}>
          <Text style={styles.compactIcon}>📋</Text>
          <View style={styles.compactInfo}>
            <Text style={[
              styles.compactTaskName,
              {
                color: theme.colors.text,
                textDecorationLine: task.status === 'completed' ? 'line-through' : 'none',
              }
            ]}>
              {task.name}
            </Text>
            <View style={[
              styles.compactStatusBadge,
              { backgroundColor: getStatusColor(task.status) + '20' }
            ]}>
              <Text style={[
                styles.compactStatusText,
                { color: getStatusColor(task.status) }
              ]}>
                День {task.dayNumber} • {getStatusText(task.status)}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.surface,
          borderColor: getStatusColor(task.status),
        }
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={[styles.dayNumber, { color: theme.colors.text }]}>
            День {task.dayNumber}
          </Text>
          <View style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(task.status) + '20' }
          ]}>
            <Text style={[
              styles.statusText,
              { color: getStatusColor(task.status) }
            ]}>
              {getStatusText(task.status)}
            </Text>
          </View>
        </View>
        
        <Text style={styles.expandIcon}>📋</Text>
      </View>

      {/* Task Name */}
      <Text style={[
        styles.taskName,
        {
          color: theme.colors.text,
          textDecorationLine: task.status === 'completed' ? 'line-through' : 'none',
        }
      ]}>
        {task.name}
      </Text>

      {/* Motivational Phrase */}
      {task.motivationalPhrase && (
        <Text style={[
          styles.motivationalPhrase,
          { color: theme.colors.primary }
        ]}>
          💪 {task.motivationalPhrase}
        </Text>
      )}

      {/* Action Buttons */}
      {showActions && task.status === 'active' && (
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.skipButton, { borderColor: theme.colors.border }]}
            onPress={(e) => {
              e.stopPropagation();
              onSkip?.();
            }}
          >
            <Text style={[styles.skipButtonText, { color: theme.colors.textSecondary }]}>
              Оставить
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.completeButton,
              { backgroundColor: theme.colors.success }
            ]}
            onPress={(e) => {
              e.stopPropagation();
              onComplete?.();
            }}
          >
            <Text style={styles.completeButtonText}>
              Завершить
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 16,
    marginBottom: 8,
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },

  compactContainer: {
    borderRadius: 8,
    padding: 8,
    marginHorizontal: 16,
    marginBottom: 6,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },

  compactContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  compactIcon: {
    fontSize: 20,
    marginRight: 10,
  },

  compactInfo: {
    flex: 1,
  },

  compactTaskName: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 2,
    lineHeight: 16,
  },

  compactStatusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6,
  },

  compactStatusText: {
    fontSize: 9,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  
  dayNumber: {
    fontSize: 12,
    fontWeight: '600',
    marginRight: 8,
  },
  
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  
  expandIcon: {
    fontSize: 16,
    opacity: 0.6,
  },
  
  taskName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
    lineHeight: 18,
  },
  
  motivationalPhrase: {
    fontSize: 12,
    fontStyle: 'italic',
    lineHeight: 16,
    marginBottom: 8,
  },
  
  actions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  
  skipButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
    alignItems: 'center',
  },
  
  skipButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  
  completeButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  
  completeButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
}); 