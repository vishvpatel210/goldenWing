import '@/global.css';
import { Platform } from 'react-native';

export const GoldenWingTheme = {
  colors: {
    background: '#080808',
    card: '#171717',
    cardElevated: '#1F1F1F',
    primaryGold: '#D4AF37',
    lightGold: '#F5D77A',
    darkGold: '#8C7322',
    textPrimary: '#FFFFFF',
    textSecondary: '#A0A0A0',
    border: '#2A2A2A',
    borderGold: 'rgba(212, 175, 55, 0.3)',
    success: '#2ECC71',
    danger: '#E74C3C',
    warning: '#F39C12',
    seatAvailable: '#252525',
    seatSelected: '#D4AF37',
    seatOccupied: '#3A3A3A',
  },
} as const;

export const Colors = {
  light: {
    text: GoldenWingTheme.colors.textPrimary,
    background: GoldenWingTheme.colors.background,
    backgroundElement: GoldenWingTheme.colors.card,
    backgroundSelected: GoldenWingTheme.colors.cardElevated,
    textSecondary: GoldenWingTheme.colors.textSecondary,
    tint: GoldenWingTheme.colors.primaryGold,
  },
  dark: {
    text: GoldenWingTheme.colors.textPrimary,
    background: GoldenWingTheme.colors.background,
    backgroundElement: GoldenWingTheme.colors.card,
    backgroundSelected: GoldenWingTheme.colors.cardElevated,
    textSecondary: GoldenWingTheme.colors.textSecondary,
    tint: GoldenWingTheme.colors.primaryGold,
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 48,
};

export const MaxContentWidth = 800;
export const BottomTabInset = 70;

