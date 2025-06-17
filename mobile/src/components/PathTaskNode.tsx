import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { useThemeStore } from '../stores/themeStore';
import { PathTask } from '../constants/learningPath';

interface PathTaskNodeProps {
  task: PathTask;
  apostleColor: string;
  isLast?: boolean;
  onPress?: () => void;
}

export const PathTaskNode: React.FC<PathTaskNodeProps> = ({
  task,
  apostleColor,
  isLast = false,
  onPress,
}) => {
  const { theme } = useThemeStore();
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  // Анимация для активного задания
  useEffect(() => {
    if (task.status === 'active') {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      );

      const glow = Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(glowAnim, {
            toValue: 0,
            duration: 1500,
            useNativeDriver: true,
          }),
        ])
      );

      pulse.start();
      glow.start();

      return () => {
        pulse.stop();
        glow.stop();
      };
    }
  }, [task.status, pulseAnim, glowAnim]);

  const getNodeStyle = () => {
    const baseStyle = {
      backgroundColor: theme.colors.surface,
      borderColor: theme.colors.border,
    };

    switch (task.status) {
      case 'completed':
        return {
          ...baseStyle,
          backgroundColor: apostleColor,
          borderColor: apostleColor,
        };
      case 'active':
        return {
          ...baseStyle,
          backgroundColor: apostleColor + '20',
          borderColor: apostleColor,
          borderWidth: 3,
        };
      case 'available':
        return {
          ...baseStyle,
          backgroundColor: theme.colors.surface,
          borderColor: apostleColor,
          borderWidth: 2,
        };
      case 'locked':
      default:
        return {
          ...baseStyle,
          backgroundColor: theme.colors.background,
          borderColor: theme.colors.border,
          opacity: 0.5,
        };
    }
  };

  const getTextColor = () => {
    switch (task.status) {
      case 'completed':
        return '#FFFFFF';
      case 'active':
        return apostleColor;
      case 'available':
        return theme.colors.text;
      case 'locked':
      default:
        return theme.colors.textSecondary;
    }
  };

  const getIconForTask = () => {
    if (task.status === 'completed') {
      return '✓';
    }
    if (task.status === 'locked') {
      return '🔒';
    }
    return task.dayNumber.toString();
  };

  const isInteractable = task.status === 'active' || task.status === 'available' || task.status === 'completed';

  return (
    <View style={styles.container}>
      {/* Glow effect for active tasks */}
      {task.status === 'active' && (
        <Animated.View
          style={[
            styles.glowEffect,
            {
              backgroundColor: apostleColor,
              opacity: glowAnim,
            },
          ]}
        />
      )}

      {/* Main node */}
      <TouchableOpacity
        style={[styles.touchArea]}
        onPress={isInteractable ? onPress : undefined}
        disabled={!isInteractable}
        activeOpacity={isInteractable ? 0.8 : 1}
      >
        <Animated.View
          style={[
            styles.node,
            getNodeStyle(),
            task.status === 'active' && {
              transform: [{ scale: pulseAnim }],
            },
          ]}
        >
          <Text style={[styles.nodeText, { color: getTextColor() }]}>
            {getIconForTask()}
          </Text>
        </Animated.View>

        {/* Task name */}
        <View style={styles.labelContainer}>
          <Text
            style={[
              styles.taskName,
              {
                color: getTextColor(),
                textDecorationLine: task.status === 'completed' ? 'line-through' : 'none',
              },
            ]}
            numberOfLines={2}
          >
            {task.name}
          </Text>
        </View>
      </TouchableOpacity>

      {/* Connection line to next task */}
      {!isLast && (
        <View
          style={[
            styles.connectionLine,
            {
              backgroundColor: task.status === 'completed' 
                ? apostleColor 
                : theme.colors.border,
            },
          ]}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 4,
  },
  
  touchArea: {
    alignItems: 'center',
    padding: 8,
  },

  glowEffect: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    top: -6,
    zIndex: 0,
  },

  node: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
    zIndex: 1,
  },

  nodeText: {
    fontSize: 16,
    fontWeight: 'bold',
  },

  labelContainer: {
    marginTop: 6,
    minHeight: 32,
    justifyContent: 'center',
    maxWidth: 100,
    paddingHorizontal: 4,
  },

  taskName: {
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 14,
  },

  connectionLine: {
    width: 2,
    height: 24,
    marginTop: 2,
    borderRadius: 1,
  },
}); 