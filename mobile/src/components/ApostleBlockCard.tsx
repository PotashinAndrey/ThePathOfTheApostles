import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useThemeStore } from '../stores/themeStore';
import { ApostleBlock, PathTask } from '../constants/learningPath';
import { PathTaskNode } from './PathTaskNode';

interface ApostleBlockCardProps {
  block: ApostleBlock;
  onTaskPress?: (task: PathTask) => void;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
}

export const ApostleBlockCard: React.FC<ApostleBlockCardProps> = ({
  block,
  onTaskPress,
  isExpanded = false,
  onToggleExpand,
}) => {
  const { theme } = useThemeStore();

  const getProgressText = () => {
    if (block.completedTasks === 0) {
      return 'Не начато';
    }
    if (block.completedTasks === block.totalTasks) {
      return 'Завершено';
    }
    return `${block.completedTasks} из ${block.totalTasks}`;
  };

  const renderTasksPath = () => {
    return (
      <View style={styles.tasksContainer}>
        {block.tasks.map((task, index) => {
          const isLast = index === block.tasks.length - 1;
          
          return (
            <View key={task.id} style={styles.taskRow}>
              <PathTaskNode
                task={task}
                apostleColor={block.color}
                isLast={isLast}
                onPress={() => onTaskPress?.(task)}
              />
            </View>
          );
        })}
      </View>
    );
  };

  return (
    <View style={[
      styles.container,
      {
        backgroundColor: theme.colors.surface,
        borderColor: block.isUnlocked ? block.color : theme.colors.border,
      }
    ]}>
      {/* Header */}
      <TouchableOpacity
        style={styles.header}
        onPress={onToggleExpand}
        activeOpacity={0.8}
      >
        <View style={styles.headerLeft}>
          <Text style={[styles.apostleIcon, { color: block.color }]}>
            {block.icon}
          </Text>
          <View style={styles.apostleInfo}>
            <Text style={[styles.apostleName, { color: theme.colors.text }]}>
              {block.name}
            </Text>
            <Text style={[styles.apostleTitle, { color: block.color }]}>
              {block.title}
            </Text>
            <Text style={[styles.progressText, { color: theme.colors.textSecondary }]}>
              {getProgressText()}
            </Text>
          </View>
        </View>

        <View style={styles.headerRight}>
          {/* Progress circle */}
          <View style={[styles.progressCircle, { borderColor: block.color }]}>
            <View
              style={[
                styles.progressFill,
                {
                  backgroundColor: block.color,
                  height: `${block.progress}%`,
                },
              ]}
            />
            {block.progress > 0 ? (
              <Text style={[styles.progressNumber, { color: block.color }]}>
                {Math.round(block.progress)}%
              </Text>
            ) : (
              <Text style={[styles.progressIcon, { color: theme.colors.textSecondary }]}>
                🎯
              </Text>
            )}
          </View>

          {/* Expand/collapse indicator */}
          <Text style={[
            styles.expandIcon,
            {
              color: theme.colors.textSecondary,
              transform: [{ rotate: isExpanded ? '180deg' : '0deg' }],
            }
          ]}>
            ⌄
          </Text>
        </View>
      </TouchableOpacity>

      {/* Description */}
      <Text style={[styles.description, { color: theme.colors.textSecondary }]}>
        {block.description}
      </Text>

      {/* Tasks Path */}
      {isExpanded && (
        <View style={styles.expandedContent}>
          <View style={styles.pathHeader}>
            <Text style={[styles.pathTitle, { color: theme.colors.text }]}>
              Путь заданий
            </Text>
            <View style={[styles.pathLine, { backgroundColor: block.color }]} />
          </View>
          
          <View style={styles.pathContainer}>
            {renderTasksPath()}
          </View>
        </View>
      )}

      {/* Locked overlay */}
      {!block.isUnlocked && (
        <View style={styles.lockedOverlay}>
          <Text style={[styles.lockedIcon, { color: theme.colors.textSecondary }]}>
            🔒
          </Text>
          <Text style={[styles.lockedText, { color: theme.colors.textSecondary }]}>
            Заблокировано
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    marginVertical: 6,
    marginHorizontal: 12,
    borderWidth: 2,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
  },

  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  apostleIcon: {
    fontSize: 28,
    marginRight: 12,
  },

  apostleInfo: {
    flex: 1,
  },

  apostleName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 2,
  },

  apostleTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },

  progressText: {
    fontSize: 13,
    fontWeight: '500',
  },

  headerRight: {
    alignItems: 'center',
    gap: 12,
  },

  progressCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    justifyContent: 'flex-end',
    alignItems: 'center',
    overflow: 'hidden',
    position: 'relative',
  },

  progressFill: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
  },

  progressNumber: {
    fontSize: 10,
    fontWeight: 'bold',
    zIndex: 1,
    marginBottom: 1,
  },

  progressIcon: {
    fontSize: 14,
    zIndex: 1,
    marginBottom: 2,
  },

  expandIcon: {
    fontSize: 20,
    fontWeight: 'bold',
  },

  description: {
    paddingHorizontal: 12,
    paddingBottom: 12,
    fontSize: 13,
    lineHeight: 18,
  },

  expandedContent: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
    paddingTop: 12,
  },

  pathHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    marginBottom: 12,
  },

  pathTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginRight: 8,
  },

  pathLine: {
    flex: 1,
    height: 2,
    borderRadius: 1,
  },

  pathContainer: {
    paddingHorizontal: 8,
  },

  tasksContainer: {
    paddingBottom: 16,
    alignItems: 'center',
  },

  taskRow: {
    width: '100%',
    alignItems: 'center',
    marginVertical: 2,
  },

  lockedOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },

  lockedIcon: {
    fontSize: 32,
  },

  lockedText: {
    fontSize: 16,
    fontWeight: '600',
  },
}); 