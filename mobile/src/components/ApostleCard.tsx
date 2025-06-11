import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { Apostle } from '../constants/apostles';
import { useThemeStore } from '../stores/themeStore';

interface ApostleCardProps {
  apostle: Apostle;
  onPress?: () => void;
  isSelected?: boolean;
}

export const ApostleCard: React.FC<ApostleCardProps> = ({
  apostle,
  onPress,
  isSelected = false,
}) => {
  const { theme } = useThemeStore();

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.surface,
          borderColor: isSelected ? apostle.color : theme.colors.border,
          borderWidth: isSelected ? 2 : 1,
        },
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.iconContainer, { backgroundColor: apostle.color + '20' }]}>
        <Text style={[styles.icon, { color: apostle.color }]}>{apostle.icon}</Text>
      </View>
      
      <View style={styles.content}>
        <Text style={[styles.name, { color: theme.colors.text }]}>
          {apostle.name}
        </Text>
        
        <Text style={[styles.archetype, { color: apostle.color }]}>
          {apostle.archetype}
        </Text>
        
        <Text style={[styles.virtue, { color: theme.colors.textSecondary }]}>
          {apostle.virtue}
        </Text>
        
        <Text 
          style={[styles.description, { color: theme.colors.textSecondary }]}
          numberOfLines={3}
        >
          {apostle.description}
        </Text>
      </View>
      
      {isSelected && (
        <View style={[styles.selectedIndicator, { backgroundColor: apostle.color }]}>
          <Text style={styles.checkmark}>✓</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 16,
    marginVertical: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 12,
  },
  icon: {
    fontSize: 28,
  },
  content: {
    alignItems: 'center',
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
    textAlign: 'center',
  },
  archetype: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
    textAlign: 'center',
  },
  virtue: {
    fontSize: 12,
    fontStyle: 'italic',
    marginBottom: 8,
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  selectedIndicator: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
}); 