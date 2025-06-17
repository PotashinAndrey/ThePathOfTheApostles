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
  Alert,
} from 'react-native';
import { useThemeStore } from '../stores/themeStore';
import { useUserStore } from '../stores/userStore';
import { ChatBubble } from '../components/ChatBubble';
import { DailyTaskWidget } from '../components/DailyTaskWidget';
import { ChatMessage } from '../services/api';
import { DailyTaskInfo, ActiveTaskResponse } from '../types/api';
import apiService from '../services/apiNew';
import { APOSTLES } from '../constants/apostles';

interface ChatScreenProps {
  navigation?: any;
  route?: {
    params?: {
      apostleId?: string;
      chatId?: string;
    };
  };
}

export const ChatScreen: React.FC<ChatScreenProps> = ({ navigation, route }) => {
  const { theme } = useThemeStore();
  const { user } = useUserStore();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [chatId, setChatId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [activeTask, setActiveTask] = useState<DailyTaskInfo | null>(null);
  const [isLoadingTask, setIsLoadingTask] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  // Определяем текущего апостола из параметров или пользователя
  const apostleId = route?.params?.apostleId || user?.currentApostle?.id;
  const currentApostle = apostleId 
    ? APOSTLES.find(a => a.id === apostleId) || user?.currentApostle || APOSTLES[0]
    : user?.currentApostle || APOSTLES[0];

  useEffect(() => {
    if (currentApostle && user?.id) {
      console.log('💬 Инициализация чата с', currentApostle.name);
      initializeChat();
      loadActiveTask();
    }
  }, [currentApostle?.id, user?.id]);

  const loadActiveTask = async () => {
    if (!currentApostle || !user?.id) return;
    
    try {
      setIsLoadingTask(true);
      const activeTaskData = await apiService.getActiveTask();
      
      // Показываем задание только если оно принадлежит текущему апостолу
      if (activeTaskData.hasActiveTask && 
          activeTaskData.currentTask?.apostleId === currentApostle.id) {
        setActiveTask(activeTaskData.currentTask);
      } else {
        setActiveTask(null);
      }
    } catch (error) {
      console.error('❌ Ошибка загрузки активного задания:', error);
      setActiveTask(null);
    } finally {
      setIsLoadingTask(false);
    }
  };

  const initializeChat = async () => {
    if (!currentApostle || !user?.id) return;
    
    try {
      setIsLoading(true);
      setCurrentPage(1);
      setHasMoreMessages(true);
      
      // Если есть chatId в параметрах, загружаем существующий чат
      if (route?.params?.chatId) {
        console.log('📥 Загружаем чат:', route.params.chatId);
        await loadExistingChat(route.params.chatId);
      } else {
        // Иначе создаем новый чат или используем существующий
        await loadOrCreateChat();
      }
    } catch (error) {
      console.error('❌ Ошибка инициализации чата:', error);
      addWelcomeMessage();
    } finally {
      setIsLoading(false);
    }
  };

  const loadExistingChat = async (chatId: string, page: number = 1, limit: number = 10) => {
    try {
      const chatData = await apiService.getChat(chatId, page, limit);
      console.log(`💬 Загружено ${chatData.messages.length} сообщений (страница ${page})`);
      
      setChatId(chatData.chat.id);
      
      // Преобразуем сообщения в формат ChatMessage
      const chatMessages: ChatMessage[] = chatData.messages.map(msg => ({
        role: msg.sender === 'USER' ? 'user' : 'assistant',
        content: msg.content,
        timestamp: new Date(msg.createdAt),
      }));
      
      // При первой загрузке - заменяем сообщения, при пагинации - добавляем в начало
      if (page === 1) {
        setMessages(chatMessages);
      } else {
        setMessages(prev => [...chatMessages, ...prev]);
      }
      
      // Обновляем состояние пагинации
      setCurrentPage(page);
      setHasMoreMessages(chatData.pagination.hasMore);
    } catch (error) {
      console.error('❌ Ошибка загрузки чата:', error);
      if (page === 1) {
        addWelcomeMessage();
      }
    }
  };

  const loadOrCreateChat = async () => {
    try {
      // Получаем список чатов пользователя
      const chats = await apiService.getChats();
      
      // Ищем чат с текущим апостолом
      const existingChat = chats.find(chat => chat.apostle.id === currentApostle?.id);
      
      if (existingChat) {
        console.log('📥 Найден существующий чат с', currentApostle?.name);
        await loadExistingChat(existingChat.id);
      } else {
        console.log('🆕 Создаем новый чат с', currentApostle?.name);
        const newChat = await apiService.createChat(currentApostle!.id);
        setChatId(newChat.id);
        addWelcomeMessage();
      }
    } catch (error) {
      console.error('❌ Ошибка создания/загрузки чата:', error);
      addWelcomeMessage();
    }
  };

  const loadMoreMessages = async () => {
    if (!chatId || !hasMoreMessages || isLoadingMore) return;
    
    setIsLoadingMore(true);
    try {
      const nextPage = currentPage + 1;
      await loadExistingChat(chatId, nextPage, 10);
    } catch (error) {
      console.error('Ошибка загрузки дополнительных сообщений:', error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const addWelcomeMessage = () => {
    const welcomeMessage: ChatMessage = {
      role: 'assistant',
      content: currentApostle?.welcomeMessage || getWelcomeMessage(),
      timestamp: new Date(),
    };
    setMessages([welcomeMessage]);
    setHasMoreMessages(false); // Для welcome сообщения нет предыдущих сообщений
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
    console.log('📤 sendMessage вызвана');
    console.log('👤 Пользователь:', user?.email || 'не найден');
    console.log('💬 Сообщение:', inputMessage);
    console.log('👥 Апостол:', currentApostle?.name || 'не выбран');
    console.log('🆔 Chat ID:', chatId);

    if (!user?.id) {
      console.error('❌ Пользователь не авторизован');
      Alert.alert('Ошибка', 'Пользователь не авторизован');
      return;
    }

    if (!inputMessage.trim()) {
      console.log('⚠️ Пустое сообщение, отмена отправки');
      return;
    }

    if (!currentApostle) {
      console.error('❌ Апостол не выбран');
      Alert.alert('Ошибка', 'Апостол не выбран');
      return;
    }

    console.log('✅ Все проверки пройдены, отправляем сообщение');

    const userMessage: ChatMessage = {
      role: 'user',
      content: inputMessage.trim(),
      timestamp: new Date(),
    };

    console.log('📝 Создано пользовательское сообщение:', userMessage);

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      console.log('🌐 Отправляем запрос к API...');
      
      let activeChatId = chatId;
      
      // Если чат еще не создан, создаем его
      if (!activeChatId) {
        console.log('🆕 Создаем новый чат');
        const newChat = await apiService.createChat(currentApostle.id);
        activeChatId = newChat.id;
        setChatId(activeChatId);
      }

      // Отправляем сообщение
      const response = await apiService.sendMessage(activeChatId, {
        content: userMessage.content,
      });
      
      console.log('✅ Получен ответ от API:', response);

      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: response.content,
        timestamp: new Date(response.createdAt),
      };

      console.log('🤖 Создано сообщение ассистента:', assistantMessage);

      setMessages(prev => [...prev, assistantMessage]);
      console.log('✅ Сообщение добавлено в чат');
      
      // Сбрасываем пагинацию, так как появились новые сообщения
      setCurrentPage(1);

    } catch (error) {
      console.error('❌ Ошибка отправки сообщения:', error);
      
      // Fallback к старому API для совместимости
      try {
        console.log('🔄 Пробуем старый API...');
        
        const fallbackResponse = await apiService.sendChatMessage({
          apostleId: currentApostle.id,
          message: userMessage.content,
          context: messages.slice(-5).map(m => `${m.role}: ${m.content}`),
        });
        
        if (fallbackResponse.success) {
          const assistantMessage: ChatMessage = {
            role: 'assistant',
            content: fallbackResponse.data.message,
            timestamp: new Date(),
          };
          
          setMessages(prev => [...prev, assistantMessage]);
          console.log('✅ Сообщение отправлено через fallback API');
          
          // Сбрасываем пагинацию, так как появились новые сообщения
          setCurrentPage(1);
        } else {
          throw new Error('Fallback API failed');
        }
      } catch (fallbackError) {
        console.error('❌ Ошибка fallback API:', fallbackError);
        Alert.alert('Ошибка', 'Не удалось отправить сообщение');
      }
    } finally {
      setIsLoading(false);
      console.log('🏁 sendMessage завершена');
    }
  };

  const handleTaskPress = () => {
    if (!activeTask) return;
    
    navigation?.navigate?.('DailyTask', {
      taskId: activeTask.id,
      task: activeTask
    });
  };

  const handleTaskComplete = async () => {
    if (!activeTask) return;

    Alert.alert(
      'Завершить задание',
      'Вы действительно выполнили это задание?',
      [
        { text: 'Нет', style: 'cancel' },
        {
          text: 'Да, завершить',
          style: 'default',
          onPress: async () => {
            try {
              await apiService.completeDailyTask(activeTask.id);
              
              // Обновляем локальное состояние
              setActiveTask(prev => prev ? { ...prev, status: 'completed', completedAt: new Date() } : null);
              
              Alert.alert(
                'Поздравляем! 🎉',
                'Задание успешно выполнено. Завтра вас ждет новое испытание!',
                [{ text: 'OK' }]
              );
              
              // Перезагружаем задание через некоторое время
              setTimeout(() => {
                loadActiveTask();
              }, 1000);
            } catch (error) {
              console.error('Ошибка завершения задания:', error);
              Alert.alert('Ошибка', 'Не удалось завершить задание');
            }
          }
        }
      ]
    );
  };

  const handleTaskSkip = async () => {
    if (!activeTask) return;

    Alert.alert(
      'Оставить задание',
      'Задание останется активным и вы сможете вернуться к нему завтра.',
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Оставить',
          style: 'default',
          onPress: async () => {
            try {
              await apiService.skipDailyTask(activeTask.id);
              
              Alert.alert(
                'Задание отложено',
                'Вы можете вернуться к нему в любое время.',
                [{ text: 'OK' }]
              );
              
              // Обновляем задание
              loadActiveTask();
            } catch (error) {
              console.error('Ошибка пропуска задания:', error);
              Alert.alert('Ошибка', 'Не удалось отложить задание');
            }
          }
        }
      ]
    );
  };

  const scrollToEnd = () => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  };

  const handleScroll = (event: any) => {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    
    // Проверяем, достиг ли пользователь верха (с небольшим порогом)
    const isNearTop = contentOffset.y <= 50;
    
    if (isNearTop && hasMoreMessages && !isLoadingMore) {
      loadMoreMessages();
    }
  };

  useEffect(() => {
    // Только для новых сообщений скроллим вниз, не для загруженных сверху
    if (!isLoadingMore) {
      scrollToEnd();
    }
  }, [messages, isLoadingMore]);

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
          {navigation && (
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={[styles.backButtonText, { color: theme.colors.primary }]}>
                ← Назад
              </Text>
            </TouchableOpacity>
          )}
          
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

        {/* Path Task Widget */}
        {activeTask && (
          <DailyTaskWidget
            task={activeTask}
            onPress={handleTaskPress}
            onComplete={handleTaskComplete}
            onSkip={handleTaskSkip}
            showActions={false}
          />
        )}

        {/* Messages */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={scrollToEnd}
          onScroll={handleScroll}
          scrollEventThrottle={16}
        >
          {/* Loading indicator for more messages */}
          {isLoadingMore && (
            <View style={styles.loadingMoreContainer}>
              <View style={[styles.loadingMoreBubble, { backgroundColor: theme.colors.surface }]}>
                <Text style={[styles.loadingMoreText, { color: theme.colors.textSecondary }]}>
                  Загружаем предыдущие сообщения...
                </Text>
              </View>
            </View>
          )}
          
          {/* No more messages indicator */}
          {!hasMoreMessages && messages.length > 0 && currentPage > 1 && (
            <View style={styles.loadingMoreContainer}>
              <View style={[styles.loadingMoreBubble, { backgroundColor: theme.colors.surface }]}>
                <Text style={[styles.loadingMoreText, { color: theme.colors.textSecondary }]}>
                  Это начало вашей беседы
                </Text>
              </View>
            </View>
          )}
          
          {messages.map((message, index) => (
            <ChatBubble
              key={`${message.timestamp}-${index}`}
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
            value={inputMessage}
            onChangeText={setInputMessage}
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
                backgroundColor: inputMessage.trim() && !isLoading 
                  ? currentApostle.color 
                  : theme.colors.border,
              }
            ]}
            onPress={() => {
              console.log('🖱️ Кнопка отправки нажата!');
              console.log('🖱️ inputMessage:', inputMessage);
              console.log('🖱️ isLoading:', isLoading);
              sendMessage();
            }}
            disabled={!inputMessage.trim() || isLoading}
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
  backButton: {
    paddingVertical: 8,
    paddingRight: 8,
    marginBottom: 8,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
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
  loadingMoreContainer: {
    paddingHorizontal: 16,
    marginVertical: 8,
    alignItems: 'center',
  },
  loadingMoreBubble: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  loadingMoreText: {
    fontSize: 14,
    fontStyle: 'italic',
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