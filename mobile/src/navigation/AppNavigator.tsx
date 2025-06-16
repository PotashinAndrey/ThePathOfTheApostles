import React, { useState } from 'react';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import type { NavigationProp, ParamListBase } from '@react-navigation/native';
import { Text, Platform, View, TouchableOpacity, Modal, StyleSheet } from 'react-native';

import { useThemeStore } from '../stores/themeStore';
import { useUserStore } from '../stores/userStore';
import { HomeScreen } from '../screens/HomeScreen';
import { ChatScreen } from '../screens/ChatScreen';
import { ChatsListScreen } from '../screens/ChatsListScreen';
import { ApostlesScreen } from '../screens/ApostlesScreen';
import { MissionsScreen } from '../screens/MissionsScreen';
import { AuthScreen } from '../screens/AuthScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { NotificationsScreen } from '../screens/NotificationsScreen';
import { PathScreen } from '../screens/PathScreen';
import { AchievementsScreen } from '../screens/AchievementsScreen';
import { SubscriptionsScreen } from '../screens/SubscriptionsScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();
const ProfileStack = createStackNavigator();
const ChatStack = createStackNavigator();

const TabIcon: React.FC<{ emoji: string; focused: boolean; color: string }> = ({ 
  emoji, 
  focused 
}) => (
  <Text style={{ 
    fontSize: focused ? 24 : 20,
    opacity: focused ? 1 : 0.6 
  }}>
    {emoji}
  </Text>
);

// Profile Stack Navigator
const ProfileStackNavigator: React.FC = () => {
  return (
    <ProfileStack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <ProfileStack.Screen name="ProfileMain" component={ProfileScreen} />
      <ProfileStack.Screen name="Settings" component={SettingsScreen} />
      <ProfileStack.Screen name="Notifications" component={NotificationsScreen} />
      <ProfileStack.Screen name="Achievements" component={AchievementsScreen} />
      <ProfileStack.Screen name="Subscriptions" component={SubscriptionsScreen} />
      <ProfileStack.Screen name="Apostles" component={ApostlesScreen} />
    </ProfileStack.Navigator>
  );
};

// Chat Stack Navigator
const ChatStackNavigator: React.FC = () => {
  return (
    <ChatStack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <ChatStack.Screen name="ChatsList" component={ChatsListScreen} />
      <ChatStack.Screen name="ChatDetail" component={ChatScreen} />
    </ChatStack.Navigator>
  );
};

// Profile dropdown component
const ProfileDropdown: React.FC = () => {
  const { theme } = useThemeStore();
  const navigation = useNavigation<NavigationProp<ParamListBase>>();
  const [showDropdown, setShowDropdown] = useState(false);

  const handleProfilePress = () => {
    setShowDropdown(false);
    navigation.navigate('ProfileTab', { screen: 'ProfileMain' });
  };

  const handleNotificationsPress = () => {
    setShowDropdown(false);
    navigation.navigate('ProfileTab', { screen: 'Notifications' });
  };

  const handleSettingsPress = () => {
    setShowDropdown(false);
    navigation.navigate('ProfileTab', { screen: 'Settings' });
  };

  return (
    <View>
      <TouchableOpacity onPress={() => setShowDropdown(true)}>
        <View style={{ alignItems: 'center' }}>
          <TabIcon emoji="👤" focused={false} color={theme.colors.textSecondary} />
          <Text style={{ 
            fontSize: 12, 
            fontWeight: '500', 
            marginTop: 4,
            color: theme.colors.textSecondary 
          }}>
            Профиль
          </Text>
        </View>
      </TouchableOpacity>

      <Modal
        visible={showDropdown}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDropdown(false)}
      >
        <TouchableOpacity 
          style={dropdownStyles.overlay}
          onPress={() => setShowDropdown(false)}
        >
          <View style={[dropdownStyles.dropdown, { backgroundColor: theme.colors.surface }]}>
            <TouchableOpacity 
              style={dropdownStyles.dropdownItem}
              onPress={handleProfilePress}
            >
              <Text style={dropdownStyles.dropdownIcon}>👤</Text>
              <Text style={[dropdownStyles.dropdownText, { color: theme.colors.text }]}>
                Профиль
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={dropdownStyles.dropdownItem}
              onPress={handleNotificationsPress}
            >
              <Text style={dropdownStyles.dropdownIcon}>🔔</Text>
              <Text style={[dropdownStyles.dropdownText, { color: theme.colors.text }]}>
                Уведомления
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={dropdownStyles.dropdownItem}
              onPress={handleSettingsPress}
            >
              <Text style={dropdownStyles.dropdownIcon}>⚙️</Text>
              <Text style={[dropdownStyles.dropdownText, { color: theme.colors.text }]}>
                Настройки
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const MainTabs: React.FC = () => {
  const { theme } = useThemeStore();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
          paddingTop: 8,
          paddingBottom: 8,
          height: 70,
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textSecondary,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
          marginTop: 4,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Главная',
          tabBarIcon: ({ focused, color }) => (
            <TabIcon emoji="🏠" focused={focused} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Path"
        component={PathScreen}
        options={{
          tabBarLabel: 'Путь',
          tabBarIcon: ({ focused, color }) => (
            <TabIcon emoji="🛤️" focused={focused} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Chat"
        component={ChatStackNavigator}
        options={{
          tabBarLabel: 'Беседы',
          tabBarIcon: ({ focused, color }) => (
            <TabIcon emoji="💬" focused={focused} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Missions"
        component={MissionsScreen}
        options={{
          tabBarLabel: 'Задания',
          tabBarIcon: ({ focused, color }) => (
            <TabIcon emoji="🎯" focused={focused} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileStackNavigator}
        options={{
          tabBarLabel: '',
          tabBarIcon: () => (
            <ProfileDropdown />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const dropdownStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 90,
  },
  dropdown: {
    borderRadius: 12,
    padding: 8,
    minWidth: 150,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
  },
  dropdownIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  dropdownText: {
    fontSize: 16,
    fontWeight: '500',
  },
});

export const AppNavigator: React.FC = () => {
  const { theme } = useThemeStore();
  const { user, isAuthenticated } = useUserStore();

  console.log('🔐 AppNavigator: Проверка авторизации');
  console.log('👤 Текущий пользователь:', user?.email || 'не авторизован');
  console.log('🔧 Platform:', Platform.OS);

  // Проверяем авторизацию через новую систему
  const userIsAuthenticated = isAuthenticated();
  console.log('✅ Пользователь авторизован:', userIsAuthenticated);
  
  // Debug логи
  if (userIsAuthenticated) {
    console.log('📱 Рендерим MainTabs для авторизованного пользователя');
  } else {
    console.log('🔐 Рендерим AuthScreen для неавторизованного пользователя');
  }

  return (
    <NavigationContainer
      theme={{
        dark: theme.colors.background === '#121212',
        colors: {
          primary: theme.colors.primary,
          background: theme.colors.background,
          card: theme.colors.surface,
          text: theme.colors.text,
          border: theme.colors.border,
          notification: theme.colors.spiritual,
        },
        fonts: {
          regular: {
            fontFamily: 'System',
            fontWeight: '400',
          },
          medium: {
            fontFamily: 'System',
            fontWeight: '500',
          },
          bold: {
            fontFamily: 'System',
            fontWeight: '700',
          },
          heavy: {
            fontFamily: 'System',
            fontWeight: '900',
          },
        },
      }}
      onStateChange={(state) => {
        console.log('🧭 Navigation state изменен:', state?.routes?.[0]?.name);
      }}
    >
      {userIsAuthenticated ? (
        <MainTabs />
      ) : (
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
          }}
        >
          <Stack.Screen name="Auth" component={AuthScreen} />
        </Stack.Navigator>
      )}
    </NavigationContainer>
  );
}; 