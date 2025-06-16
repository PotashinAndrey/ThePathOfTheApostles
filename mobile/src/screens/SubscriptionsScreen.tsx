import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useThemeStore } from '../stores/themeStore';
import { useUserStore } from '../stores/userStore';

interface SubscriptionPlan {
  id: string;
  name: string;
  price: string;
  period: string;
  features: string[];
  popular?: boolean;
  color: string;
  emoji: string;
}

export const SubscriptionsScreen: React.FC = () => {
  const navigation = useNavigation();
  const { theme } = useThemeStore();
  const { user } = useUserStore();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const plans: SubscriptionPlan[] = [
    {
      id: 'basic',
      name: 'Основной',
      price: '299',
      period: 'месяц',
      emoji: '🌱',
      color: '#4CAF50',
      features: [
        'Доступ к базовым урокам',
        'Ежедневные молитвы',
        'Простые задания',
        'Основные статьи',
      ],
    },
    {
      id: 'premium',
      name: 'Премиум',
      price: '599',
      period: 'месяц',
      emoji: '⭐',
      color: '#FF9800',
      popular: true,
      features: [
        'Все функции основного плана',
        'Персональный духовный наставник',
        'Продвинутые уроки и медитации',
        'Доступ к эксклюзивному контенту',
        'Приоритетная поддержка',
        'Безлимитные чаты с наставниками',
      ],
    },
    {
      id: 'spiritual',
      name: 'Духовный путь',
      price: '999',
      period: 'месяц',
      emoji: '🙏',
      color: '#9C27B0',
      features: [
        'Все функции премиум плана',
        'Индивидуальные духовные программы',
        'Личные встречи с наставниками',
        'Доступ к святым местам',
        'Эксклюзивные мероприятия',
        'Персональные рекомендации',
        'Круглосуточная поддержка',
      ],
    },
  ];

  const handleSelectPlan = (planId: string) => {
    setSelectedPlan(planId);
  };

  const handleSubscribe = () => {
    if (!selectedPlan) {
      Alert.alert('Выберите план', 'Пожалуйста, выберите план подписки');
      return;
    }

    const plan = plans.find(p => p.id === selectedPlan);
    Alert.alert(
      'Подписка',
      `Вы выбрали план "${plan?.name}" за ${plan?.price}₽/${plan?.period}. Функция оплаты будет добавлена в следующих версиях.`,
      [{ text: 'ОК' }]
    );
  };

  const renderPlan = (plan: SubscriptionPlan) => (
    <TouchableOpacity
      key={plan.id}
      style={[
        styles.planCard,
        { backgroundColor: theme.colors.surface },
        selectedPlan === plan.id && { borderColor: plan.color, borderWidth: 2 },
        plan.popular && styles.popularPlan,
      ]}
      onPress={() => handleSelectPlan(plan.id)}
    >
      {plan.popular && (
        <View style={[styles.popularBadge, { backgroundColor: plan.color }]}>
          <Text style={styles.popularText}>Популярный</Text>
        </View>
      )}

      <View style={styles.planHeader}>
        <Text style={styles.planEmoji}>{plan.emoji}</Text>
        <Text style={[styles.planName, { color: theme.colors.text }]}>
          {plan.name}
        </Text>
        <View style={styles.priceContainer}>
          <Text style={[styles.price, { color: plan.color }]}>
            {plan.price}₽
          </Text>
          <Text style={[styles.period, { color: theme.colors.textSecondary }]}>
            /{plan.period}
          </Text>
        </View>
      </View>

      <View style={styles.featuresContainer}>
        {plan.features.map((feature, index) => (
          <View key={index} style={styles.featureItem}>
            <Text style={[styles.checkmark, { color: plan.color }]}>✓</Text>
            <Text style={[styles.featureText, { color: theme.colors.text }]}>
              {feature}
            </Text>
          </View>
        ))}
      </View>

      {selectedPlan === plan.id && (
        <View style={[styles.selectedIndicator, { backgroundColor: plan.color }]}>
          <Text style={styles.selectedText}>Выбрано</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          Планы подписки
        </Text>
        <View style={styles.placeholder} />
      </View>

      {/* Description */}
      <View style={styles.descriptionContainer}>
        <Text style={[styles.descriptionTitle, { color: theme.colors.text }]}>
          Выберите свой духовный путь
        </Text>
        <Text style={[styles.descriptionText, { color: theme.colors.textSecondary }]}>
          Получите доступ к персональным урокам, духовным наставникам и эксклюзивному контенту
        </Text>
      </View>

      {/* Plans */}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.plansContainer}>
          {plans.map(renderPlan)}
        </View>
      </ScrollView>

      {/* Subscribe Button */}
      <View style={[styles.footer, { backgroundColor: theme.colors.surface }]}>
        <TouchableOpacity
          style={[
            styles.subscribeButton,
            { 
              backgroundColor: selectedPlan ? theme.colors.primary : theme.colors.border,
              opacity: selectedPlan ? 1 : 0.5,
            }
          ]}
          onPress={handleSubscribe}
          disabled={!selectedPlan}
        >
          <Text style={[
            styles.subscribeText,
            { color: selectedPlan ? '#FFFFFF' : theme.colors.textSecondary }
          ]}>
            {selectedPlan ? 'Подписаться' : 'Выберите план'}
          </Text>
        </TouchableOpacity>
        <Text style={[styles.cancelText, { color: theme.colors.textSecondary }]}>
          Отменить можно в любое время
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  backButton: {
    padding: 8,
  },
  backIcon: {
    fontSize: 24,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  placeholder: {
    width: 40,
  },
  descriptionContainer: {
    padding: 16,
    alignItems: 'center',
  },
  descriptionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  scrollView: {
    flex: 1,
  },
  plansContainer: {
    padding: 16,
  },
  planCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  popularPlan: {
    transform: [{ scale: 1.02 }],
  },
  popularBadge: {
    position: 'absolute',
    top: -8,
    right: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  popularText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  planHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  planEmoji: {
    fontSize: 40,
    marginBottom: 8,
  },
  planName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  price: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  period: {
    fontSize: 16,
    marginLeft: 4,
  },
  featuresContainer: {
    marginBottom: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  checkmark: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 12,
    width: 20,
  },
  featureText: {
    fontSize: 16,
    flex: 1,
  },
  selectedIndicator: {
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  selectedText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  subscribeButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 8,
  },
  subscribeText: {
    fontSize: 18,
    fontWeight: '600',
  },
  cancelText: {
    fontSize: 14,
    textAlign: 'center',
  },
}); 