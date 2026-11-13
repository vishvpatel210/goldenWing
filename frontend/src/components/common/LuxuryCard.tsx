import React from 'react';
import { View, StyleSheet, ViewStyle, TouchableOpacity } from 'react-native';
import { GoldenWingTheme } from '../../constants/theme';

interface LuxuryCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
  goldBorder?: boolean;
}

export const LuxuryCard: React.FC<LuxuryCardProps> = ({
  children,
  style,
  onPress,
  goldBorder = false,
}) => {
  const cardStyle = [
    styles.card,
    goldBorder && styles.goldBorder,
    style,
  ];

  if (onPress) {
    return (
      <TouchableOpacity
        activeOpacity={0.88}
        onPress={onPress}
        style={cardStyle}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={cardStyle}>{children}</View>;
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: GoldenWingTheme.colors.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: GoldenWingTheme.colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 4,
  },
  goldBorder: {
    borderColor: GoldenWingTheme.colors.borderGold,
  },
});

