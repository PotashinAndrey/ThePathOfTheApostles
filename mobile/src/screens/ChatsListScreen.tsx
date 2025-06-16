import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  RefreshControl,
} from 'react-native';
import { useThemeStore } from '../stores/themeStore';
import { useUserStore } from '../stores/userStore';
import apiService from '../services/apiNew';
import { APOSTLES } from '../constants/apostles';
import type { ChatInfo } from '../types/api';

interface ChatsListScreenProps {
  navigation: any;
}

export const ChatsListScreen: React.FC<ChatsListScreenProps> = ({ navigation }) => {
  const { theme } = useThemeStore();
  const { user } = useUserStore();
  const [chats, setChats] = useState<ChatInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadChats();
  }, []);

  const loadChats = async () => {
    try {
      setLoading(true);
      console.log('📥 Загружаем список чатов...');
      const chatsData = await apiService.getChats();
      console.log('✅ Загружено чатов:', chatsData.length);
      setChats(chatsData);
    } catch (error) {
      console.error('❌ Ошибка загрузки чатов:', error);
      Alert.alert('Ошибка', 'Не удалось загрузить список чатов');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadChats();
    setRefreshing(false);
  };

  const handleChatPress = (chat: ChatInfo) => {
    console.log('💬 Открываем чат:', chat.name);
    navigation.navigate('ChatDetail', {
      chatId: chat.id,
      apostleId: chat.apostle.id,
    });
  };

  const handleCreateChatPress = (apostleId: string) => {
    console.log('🆕 Создаем новый чат с апостолом:', apostleId);
    navigation.navigate('ChatDetail', {
      apostleId: apostleId,
    });
  };

  const formatLastMessageTime = (timestamp: string | Date) => {
    const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) {
      return date.toLocaleTimeString('ru-RU', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } else if (days === 1) {
      return 'Вчера';
    } else if (days < 7) {
      return `${days} дн. назад`;
    } else {
      return date.toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
      });
    }
  };

  const getAvailableApostles = () => {
    const chatApostleIds = chats.map(chat => chat.apostle.id);
    return APOSTLES.filter(apostle => !chatApostleIds.includes(apostle.id));
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: theme.colors.text }]}>
            Загрузка чатов...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          Беседы с апостолами
        </Text>
      </View>

      <ScrollView
        style={styles.scrollContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.primary}
          />
        }
      >
        {/* Existing Chats */}
        {chats.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Активные беседы
            </Text>
            {chats.map((chat) => (
              <TouchableOpacity
                key={chat.id}
                style={[styles.chatItem, { backgroundColor: theme.colors.surface }]}
                onPress={() => handleChatPress(chat)}
              >
                <View style={styles.chatInfo}>
                  <Text style={[styles.apostleIcon, { color: chat.apostle.color }]}>
                    {chat.apostle.icon}
                  </Text>
                  <View style={styles.chatDetails}>
                    <View style={styles.chatHeader}>
                      <Text style={[styles.chatName, { color: theme.colors.text }]}>
                        {chat.apostle.name}
                      </Text>
                      {chat.lastMessage && (
                        <Text style={[styles.lastMessageTime, { color: theme.colors.textSecondary }]}>
                          {formatLastMessageTime(chat.lastMessage.createdAt)}
                        </Text>
                      )}
                    </View>
                                         <Text style={[styles.apostleArchetype, { color: chat.apostle.color }]}>
                       {chat.apostle.archetype} • {typeof chat.apostle.virtue === 'string' ? chat.apostle.virtue : chat.apostle.virtue?.name || 'Добродетель'}
                     </Text>
                    {chat.lastMessage && (
                      <Text 
                        style={[styles.lastMessage, { color: theme.colors.textSecondary }]}
                        numberOfLines={1}
                      >
                        {chat.lastMessage.sender === 'USER' ? 'Вы: ' : ''}
                        {chat.lastMessage.content}
                      </Text>
                    )}
                  </View>
                </View>
                <Text style={[styles.chevron, { color: theme.colors.textSecondary }]}>
                  ›
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Available Apostles */}
        {getAvailableApostles().length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Начать беседу с новым наставником
            </Text>
            {getAvailableApostles().map((apostle) => (
              <TouchableOpacity
                key={apostle.id}
                style={[styles.chatItem, { backgroundColor: theme.colors.surface }]}
                onPress={() => handleCreateChatPress(apostle.id)}
              >
                <View style={styles.chatInfo}>
                  <Text style={[styles.apostleIcon, { color: apostle.color }]}>
                    {apostle.icon}
                  </Text>
                  <View style={styles.chatDetails}>
                    <Text style={[styles.chatName, { color: theme.colors.text }]}>
                      {apostle.name}
                    </Text>
                                         <Text style={[styles.apostleArchetype, { color: apostle.color }]}>
                       {apostle.archetype} • {apostle.virtue}
                     </Text>
                    <Text 
                      style={[styles.lastMessage, { color: theme.colors.textSecondary }]}
                      numberOfLines={2}
                    >
                      {apostle.description}
                    </Text>
                  </View>
                </View>
                <Text style={[styles.chevron, { color: theme.colors.textSecondary }]}>
                  ›
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Empty State */}
        {chats.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyStateIcon, { color: theme.colors.textSecondary }]}>
              💬
            </Text>
            <Text style={[styles.emptyStateTitle, { color: theme.colors.text }]}>
              Начните свою первую беседу
            </Text>
            <Text style={[styles.emptyStateDescription, { color: theme.colors.textSecondary }]}>
              Выберите апостола-наставника и начните диалог о духовном развитии
            </Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '500',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  scrollContainer: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chatInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  apostleIcon: {
    fontSize: 40,
    marginRight: 16,
  },
  chatDetails: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  chatName: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
  },
  lastMessageTime: {
    fontSize: 12,
    fontWeight: '500',
  },
  apostleArchetype: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  lastMessage: {
    fontSize: 14,
    lineHeight: 18,
  },
  chevron: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  emptyStateIcon: {
    fontSize: 60,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptyStateDescription: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
}); 