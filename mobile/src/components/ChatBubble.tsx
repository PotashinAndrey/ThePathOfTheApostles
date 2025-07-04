import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useThemeStore } from '../stores/themeStore';
import { ChatMessage } from '../services/api';

interface ChatBubbleProps {
  message: ChatMessage;
  apostleColor?: string;
}

export const ChatBubble: React.FC<ChatBubbleProps> = ({ 
  message, 
  apostleColor = '#4A90E2' 
}) => {
  const { theme } = useThemeStore();
  const isUser = message.role === 'user';

  // Безопасное форматирование времени
  const formatTime = (timestamp: Date | string) => {
    try {
      const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
      
      // Проверяем, что дата валидна
      if (isNaN(date.getTime())) {
        console.warn('Invalid timestamp:', timestamp);
        return new Date().toLocaleTimeString('ru-RU', {
          hour: '2-digit',
          minute: '2-digit',
        });
      }
      
      return date.toLocaleTimeString('ru-RU', {
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (error) {
      console.error('Error formatting timestamp:', error, timestamp);
      // Fallback к текущему времени
      return new Date().toLocaleTimeString('ru-RU', {
        hour: '2-digit',
        minute: '2-digit',
      });
    }
  };

  return (
    <View style={[
      styles.container,
      isUser ? styles.userContainer : styles.apostleContainer,
    ]}>
      <View style={[
        styles.bubble,
        {
          backgroundColor: isUser ? theme.colors.primary : apostleColor + '20',
          borderBottomRightRadius: isUser ? 4 : 16,
          borderBottomLeftRadius: isUser ? 16 : 4,
        }
      ]}>
        <Text style={[
          styles.messageText,
          {
            color: isUser ? '#FFFFFF' : theme.colors.text,
          }
        ]}>
          {message.content}
        </Text>
        
        <Text style={[
          styles.timestamp,
          {
            color: isUser ? 'rgba(255,255,255,0.7)' : theme.colors.textSecondary,
          }
        ]}>
          {formatTime(message.timestamp)}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
    paddingHorizontal: 16,
  },
  userContainer: {
    alignItems: 'flex-end',
  },
  apostleContainer: {
    alignItems: 'flex-start',
  },
  bubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 4,
  },
  timestamp: {
    fontSize: 12,
    alignSelf: 'flex-end',
  },
}); 