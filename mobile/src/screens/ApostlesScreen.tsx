import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { useThemeStore } from '../stores/themeStore';
import { useUserStore } from '../stores/userStore';
import { APOSTLES } from '../constants/apostles';
import { ApostleCard } from '../components/ApostleCard';

export const ApostlesScreen: React.FC = () => {
  const { theme } = useThemeStore();
  const { user, setCurrentApostle } = useUserStore();

  const handleApostleSelect = (apostle: typeof APOSTLES[0]) => {
    setCurrentApostle(apostle);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.colors.text }]}>
            Выберите наставника
          </Text>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
            Каждый апостол поможет вам развить определенные качества и добродетели
          </Text>
        </View>

        <View style={styles.apostlesGrid}>
          {APOSTLES.map((apostle) => (
            <ApostleCard
              key={apostle.id}
              apostle={apostle}
              onPress={() => handleApostleSelect(apostle)}
              isSelected={user?.currentApostle?.id === apostle.id}
            />
          ))}
        </View>

        {user?.currentApostle && (
          <View style={[styles.selectedInfo, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.selectedTitle, { color: theme.colors.text }]}>
              Ваш текущий наставник
            </Text>
            <View style={styles.selectedApostleInfo}>
              <Text style={[styles.selectedIcon, { color: user.currentApostle.color }]}>
                {user.currentApostle.icon}
              </Text>
              <View style={styles.selectedDetails}>
                <Text style={[styles.selectedName, { color: theme.colors.text }]}>
                  {user.currentApostle.name}
                </Text>
                <Text style={[styles.selectedArchetype, { color: user.currentApostle.color }]}>
                  {user.currentApostle.archetype} • {user.currentApostle.virtue}
                </Text>
                <Text style={[styles.selectedPersonality, { color: theme.colors.textSecondary }]}>
                  {user.currentApostle.personality}
                </Text>
              </View>
            </View>
          </View>
        )}

        <View style={styles.infoSection}>
          <Text style={[styles.infoTitle, { color: theme.colors.text }]}>
            О наставниках
          </Text>
          <Text style={[styles.infoText, { color: theme.colors.textSecondary }]}>
            Каждый апостол обладает уникальным характером и поможет вам развить определенные качества:
          </Text>
          
          <View style={styles.virtuesList}>
            {APOSTLES.map((apostle) => (
              <View key={apostle.id} style={styles.virtueItem}>
                <Text style={[styles.virtueIcon, { color: apostle.color }]}>
                  {apostle.icon}
                </Text>
                <View style={styles.virtueContent}>
                  <Text style={[styles.virtueName, { color: theme.colors.text }]}>
                    {apostle.name}
                  </Text>
                  <Text style={[styles.virtueDescription, { color: theme.colors.textSecondary }]}>
                    {apostle.virtue}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 22,
    textAlign: 'center',
  },
  apostlesGrid: {
    paddingHorizontal: 16,
  },
  selectedInfo: {
    margin: 20,
    padding: 20,
    borderRadius: 16,
  },
  selectedTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  selectedApostleInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  selectedIcon: {
    fontSize: 36,
    marginRight: 16,
  },
  selectedDetails: {
    flex: 1,
  },
  selectedName: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 4,
  },
  selectedArchetype: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  selectedPersonality: {
    fontSize: 14,
    lineHeight: 20,
  },
  infoSection: {
    padding: 20,
  },
  infoTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  virtuesList: {
    gap: 12,
  },
  virtueItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  virtueIcon: {
    fontSize: 20,
    marginRight: 12,
    width: 24,
    textAlign: 'center',
  },
  virtueContent: {
    flex: 1,
  },
  virtueName: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
  },
  virtueDescription: {
    fontSize: 12,
    fontStyle: 'italic',
  },
}); 