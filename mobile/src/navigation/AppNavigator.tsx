import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Text, Platform } from 'react-native';

import { useThemeStore } from '../stores/themeStore';
import { useUserStore } from '../stores/userStore';
import { HomeScreen } from '../screens/HomeScreen';
import { ChatScreen } from '../screens/ChatScreen';
import { ApostlesScreen } from '../screens/ApostlesScreen';
import { MissionsScreen } from '../screens/MissionsScreen';
import { AuthScreen } from '../screens/AuthScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

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
        name="Apostles"
        component={ApostlesScreen}
        options={{
          tabBarLabel: 'Наставники',
          tabBarIcon: ({ focused, color }) => (
            <TabIcon emoji="👥" focused={focused} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Chat"
        component={ChatScreen}
        options={{
          tabBarLabel: 'Беседа',
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
    </Tab.Navigator>
  );
};

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
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        {userIsAuthenticated ? (
          <Stack.Screen name="MainTabs" component={MainTabs} />
        ) : (
          <Stack.Screen name="Auth" component={AuthScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}; 