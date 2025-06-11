import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useThemeStore } from '../stores/themeStore';
import { useUserStore } from '../stores/userStore';
import { ChatBubble } from '../components/ChatBubble';
import { ChatMessage, chatAPI } from '../services/api';
import { contextService, ContextMessage } from '../services/contextService';
import { APOSTLES } from '../constants/apostles';

export const ChatScreen: React.FC = () => {
  const { theme } = useThemeStore();
  const { user } = useUserStore();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const currentApostle = user?.currentApostle || APOSTLES.find(a => a.id === 'peter');

  useEffect(() => {
    if (currentApostle && user?.id) {
      loadChatHistory();
    }
  }, [currentApostle, user?.id]);

  const loadChatHistory = async () => {
    if (!currentApostle || !user?.id) return;
    
    try {
      const context = await contextService.getContext(user.id, currentApostle.id);
      
      // Преобразуем контекстные сообщения в формат ChatMessage
      const chatMessages = context.messages.map(msg => ({
        role: msg.role,
        content: msg.content,
        timestamp: msg.timestamp,
      }));
      
      // Если это первый раз, добавляем приветственное сообщение
      if (chatMessages.length === 0) {
        const welcomeMessage: ChatMessage = {
          role: 'assistant',
          content: currentApostle.welcomeMessage || getWelcomeMessage(),
          timestamp: new Date(),
        };
        
        // Добавляем в контекст
        await contextService.addMessage(
          user.id,
          currentApostle.id,
          {
            role: 'assistant',
            content: welcomeMessage.content,
            timestamp: welcomeMessage.timestamp,
          }
        );
        
        setMessages([welcomeMessage]);
      } else {
        setMessages(chatMessages);
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
      // Fallback к стандартному приветствию
      setMessages([{
        role: 'assistant',
        content: getWelcomeMessage(),
        timestamp: new Date(),
      }]);
    }
  };

  const getWelcomeMessage = () => {
    if (!currentApostle) return 'Добро пожаловать!';
    
    const welcomeMessages = {
      peter: 'Приветствую тебя, путник. Я Пётр, твой наставник в пути стойкости. Готов ли ты к серьезной работе над собой?',
      john: 'Мир тебе, искатель. Я Иоанн, здесь чтобы помочь тебе обрести внутренний покой. О чем размышляешь сегодня?',
      matthew: 'Приветствую! Я Матфей, готов помочь тебе структурировать жизнь и принимать мудрые решения. С чего начнем?',
    };
    
    return welcomeMessages[currentApostle.id as keyof typeof welcomeMessages] || 'Добро пожаловать на путь духовного развития!';
  };

  const sendMessage = async () => {
    console.log('🔥 sendMessage вызвана');
    console.log('📝 inputText:', inputText);
    console.log('👤 currentApostle:', currentApostle?.id);
    console.log('⏳ isLoading:', isLoading);
    console.log('🆔 user?.id:', user?.id);
    
    if (!inputText.trim() || !currentApostle || isLoading || !user?.id) {
      console.log('❌ Условие проверки не прошло, выходим из функции');
      console.log('- inputText.trim():', !!inputText.trim());
      console.log('- currentApostle:', !!currentApostle);
      console.log('- !isLoading:', !isLoading);
      console.log('- user?.id:', !!user?.id);
      return;
    }

    console.log('✅ Все проверки прошли, начинаем отправку сообщения');

    const userMessage: ChatMessage = {
      role: 'user',
      content: inputText.trim(),
      timestamp: new Date(),
    };

    console.log('📨 Создано пользовательское сообщение:', userMessage);

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    console.log('🔄 Состояние обновлено: сообщение добавлено, input очищен, loading=true');

    try {
      console.log('🔄 Добавляем сообщение в контекст...');
      // Добавляем сообщение пользователя в контекст
      const context = await contextService.addMessage(
        user.id,
        currentApostle.id,
        {
          role: 'user',
          content: userMessage.content,
          timestamp: userMessage.timestamp,
        }
      );

      console.log('✅ Сообщение добавлено в контекст:', context);

      // Получаем контекст для AI
      const aiContext = contextService.getAIContext(context);
      console.log('🤖 AI контекст получен:', aiContext);
      
      // Определяем дополнительный контекст от приложения
      let additionalContext = '';
      if (context.userProgress?.currentTask) {
        additionalContext += `Пользователь сейчас выполняет задание: ${context.userProgress.currentTask}. `;
      }
      if (context.userProgress && context.userProgress.streak > 0) {
        additionalContext += `Текущая серия выполнения заданий: ${context.userProgress.streak} дней. `;
      }

      console.log('📋 Дополнительный контекст:', additionalContext);

      const requestData = {
        apostleId: currentApostle.id,
        message: userMessage.content,
        context: [aiContext],
        userId: user.id,
        additionalContext: additionalContext || undefined,
      };

      console.log('🌐 Отправляем запрос к API:', requestData);

      const response = await chatAPI.sendMessage(requestData);

      console.log('📥 Получен ответ от API:', response);

      const apostleMessage: ChatMessage = {
        role: 'assistant',
        content: response.message,
        timestamp: new Date(response.timestamp),
      };

      console.log('👨‍🏫 Создано сообщение апостола:', apostleMessage);

      // Добавляем ответ апостола в контекст
      await contextService.addMessage(
        user.id,
        currentApostle.id,
        {
          role: 'assistant',
          content: apostleMessage.content,
          timestamp: apostleMessage.timestamp,
        }
      );

      console.log('✅ Ответ апостола добавлен в контекст');

      setMessages(prev => [...prev, apostleMessage]);
      console.log('✅ Сообщение апостола добавлено в UI');
    } catch (error) {
      console.error('❌ Ошибка при отправке сообщения:', error);
      console.error('❌ Детали ошибки:', {
        message: (error as Error)?.message,
        stack: (error as Error)?.stack,
        name: (error as Error)?.name
      });
      
      // Fallback ответ при ошибке
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: 'Прости, у меня временные трудности с ответом. Попробуй задать вопрос позже.',
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, errorMessage]);
      console.log('🚨 Добавлено сообщение об ошибке в UI');
    } finally {
      setIsLoading(false);
      console.log('🏁 Отправка завершена, loading=false');
    }
  };

  const scrollToEnd = () => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  };

  useEffect(() => {
    scrollToEnd();
  }, [messages]);

  if (!currentApostle) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.noApostleContainer}>
          <Text style={[styles.noApostleText, { color: theme.colors.textSecondary }]}>
            Выберите наставника, чтобы начать беседу
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <KeyboardAvoidingView 
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.apostleHeader}>
            <Text style={[styles.apostleIcon, { color: currentApostle.color }]}>
              {currentApostle.icon}
            </Text>
            <View style={styles.apostleInfo}>
              <Text style={[styles.apostleName, { color: theme.colors.text }]}>
                {currentApostle.name}
              </Text>
              <Text style={[styles.apostleStatus, { color: currentApostle.color }]}>
                В сети • {currentApostle.archetype}
              </Text>
            </View>
          </View>
        </View>

        {/* Messages */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={scrollToEnd}
        >
          {messages.map((message, index) => (
            <ChatBubble
              key={index}
              message={message}
              apostleColor={currentApostle.color}
            />
          ))}
          
          {isLoading && (
            <View style={styles.typingIndicator}>
              <View style={[styles.typingBubble, { backgroundColor: currentApostle.color + '20' }]}>
                <Text style={[styles.typingText, { color: theme.colors.textSecondary }]}>
                  {currentApostle.name} печатает...
                </Text>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Input */}
        <View style={[styles.inputContainer, { backgroundColor: theme.colors.surface }]}>
          <TextInput
            style={[
              styles.textInput,
              {
                backgroundColor: theme.colors.background,
                color: theme.colors.text,
                borderColor: theme.colors.border,
              }
            ]}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Напишите сообщение..."
            placeholderTextColor={theme.colors.textSecondary}
            multiline
            maxLength={500}
            editable={!isLoading}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              {
                backgroundColor: inputText.trim() && !isLoading 
                  ? currentApostle.color 
                  : theme.colors.border,
              }
            ]}
            onPress={() => {
              console.log('🖱️ Кнопка отправки нажата!');
              console.log('🖱️ inputText:', inputText);
              console.log('🖱️ isLoading:', isLoading);
              console.log('🖱️ disabled:', !inputText.trim() || isLoading);
              sendMessage();
            }}
            disabled={!inputText.trim() || isLoading}
          >
            <Text style={styles.sendButtonText}>📤</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoid: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  apostleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  apostleIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  apostleInfo: {
    flex: 1,
  },
  apostleName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 2,
  },
  apostleStatus: {
    fontSize: 12,
    fontWeight: '500',
  },
  messagesContainer: {
    flex: 1,
    paddingVertical: 8,
  },
  noApostleContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  noApostleText: {
    fontSize: 16,
    textAlign: 'center',
  },
  typingIndicator: {
    paddingHorizontal: 16,
    marginVertical: 4,
    alignItems: 'flex-start',
  },
  typingBubble: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderBottomLeftRadius: 4,
  },
  typingText: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 12,
    maxHeight: 100,
    fontSize: 16,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonText: {
    fontSize: 18,
  },
}); 