import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useThemeStore } from '../stores/themeStore';
import { WeeklyTask } from '../constants/peterWeeklyTasks';

interface WeeklyTaskCardProps {
  task: WeeklyTask;
  isCompleted?: boolean;
  onComplete?: () => void;
  onShowDetails?: () => void;
}

export const WeeklyTaskCard: React.FC<WeeklyTaskCardProps> = ({
  task,
  isCompleted = false,
  onComplete,
  onShowDetails,
}) => {
  const { theme } = useThemeStore();

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return '#4CAF50';
      case 'medium': return '#FF9800';
      case 'hard': return '#F44336';
      default: return theme.colors.primary;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'reflection': return '🤔';
      case 'practice': return '🧘‍♂️';
      case 'action': return '⚡';
      case 'ritual': return '🕯️';
      default: return '📝';
    }
  };

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'Легко';
      case 'medium': return 'Средне';
      case 'hard': return 'Сложно';
      default: return difficulty;
    }
  };

  return (
    <View style={[
      styles.container,
      {
        backgroundColor: theme.colors.surface,
        borderColor: theme.colors.border,
        opacity: isCompleted ? 0.8 : 1,
      }
    ]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.dayNumber}>День {task.day}</Text>
          <Text style={styles.typeIcon}>{getTypeIcon(task.type)}</Text>
        </View>
        
        <View style={styles.headerRight}>
          <View style={[
            styles.difficultyBadge,
            { backgroundColor: getDifficultyColor(task.difficulty) + '20' }
          ]}>
            <Text style={[
              styles.difficultyText,
              { color: getDifficultyColor(task.difficulty) }
            ]}>
              {getDifficultyText(task.difficulty)}
            </Text>
          </View>
          
          <Text style={[styles.duration, { color: theme.colors.textSecondary }]}>
            {task.duration}
          </Text>
        </View>
      </View>

      {/* Title */}
      <Text style={[
        styles.title,
        {
          color: theme.colors.text,
          textDecorationLine: isCompleted ? 'line-through' : 'none',
        }
      ]}>
        {task.title}
      </Text>

      {/* Description */}
      <Text style={[
        styles.description,
        { color: theme.colors.textSecondary }
      ]} numberOfLines={3}>
        {task.description}
      </Text>

      {/* Scripture */}
      {task.scripture && (
        <View style={[
          styles.scriptureContainer,
          { backgroundColor: theme.colors.primary + '10' }
        ]}>
          <Text style={[
            styles.scripture,
            { color: theme.colors.primary }
          ]}>
            "{task.scripture}"
          </Text>
        </View>
      )}

      {/* Tips Preview */}
      {task.tips && task.tips.length > 0 && (
        <View style={styles.tipsPreview}>
          <Text style={[
            styles.tipsHeader,
            { color: theme.colors.textSecondary }
          ]}>
            💡 {task.tips.length} совет{task.tips.length > 1 ? 'а' : ''}
          </Text>
        </View>
      )}

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.detailsButton, { borderColor: theme.colors.border }]}
          onPress={onShowDetails}
        >
          <Text style={[styles.detailsButtonText, { color: theme.colors.primary }]}>
            Подробнее
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.completeButton,
            {
              backgroundColor: isCompleted 
                ? theme.colors.success 
                : theme.colors.primary,
            }
          ]}
          onPress={onComplete}
          disabled={isCompleted}
        >
          <Text style={styles.completeButtonText}>
            {isCompleted ? '✓ Выполнено' : 'Выполнить'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 16,
    marginVertical: 8,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  dayNumber: {
    fontSize: 14,
    fontWeight: '600',
    marginRight: 8,
  },
  
  typeIcon: {
    fontSize: 20,
  },
  
  headerRight: {
    alignItems: 'flex-end',
  },
  
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 4,
  },
  
  difficultyText: {
    fontSize: 12,
    fontWeight: '600',
  },
  
  duration: {
    fontSize: 12,
  },
  
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    lineHeight: 24,
  },
  
  description: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  
  scriptureContainer: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#8B4513',
  },
  
  scripture: {
    fontSize: 14,
    fontStyle: 'italic',
    lineHeight: 20,
  },
  
  tipsPreview: {
    marginBottom: 16,
  },
  
  tipsHeader: {
    fontSize: 13,
    fontWeight: '500',
  },
  
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  
  detailsButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  
  detailsButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  
  completeButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  
  completeButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
}); 