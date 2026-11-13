import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { GoldenWingTheme } from '../../constants/theme';

interface BadgeProps {
  label: string;
  variant?: 'gold' | 'default' | 'success' | 'danger';
}

export const Badge: React.FC<BadgeProps> = ({ label, variant = 'default' }) => {
  const getBadgeStyle = () => {
    switch (variant) {
      case 'gold':
        return {
          container: styles.goldContainer,
          text: styles.goldText,
        };
      case 'success':
        return {
          container: styles.successContainer,
          text: styles.successText,
        };
      case 'danger':
        return {
          container: styles.dangerContainer,
          text: styles.dangerText,
        };
      case 'default':
      default:
        return {
          container: styles.defaultContainer,
          text: styles.defaultText,
        };
    }
  };

  const current = getBadgeStyle();

  return (
    <View style={[styles.baseBadge, current.container]}>
      <Text style={[styles.baseText, current.text]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  baseBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  baseText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  goldContainer: {
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    borderWidth: 1,
    borderColor: GoldenWingTheme.colors.primaryGold,
  },
  goldText: {
    color: GoldenWingTheme.colors.lightGold,
  },
  defaultContainer: {
    backgroundColor: '#262626',
  },
  defaultText: {
    color: GoldenWingTheme.colors.textSecondary,
  },
  successContainer: {
    backgroundColor: 'rgba(46, 204, 113, 0.15)',
    borderWidth: 1,
    borderColor: '#2ECC71',
  },
  successText: {
    color: '#2ECC71',
  },
  dangerContainer: {
    backgroundColor: 'rgba(231, 76, 60, 0.15)',
    borderWidth: 1,
    borderColor: '#E74C3C',
  },
  dangerText: {
    color: '#E74C3C',
  },
});

