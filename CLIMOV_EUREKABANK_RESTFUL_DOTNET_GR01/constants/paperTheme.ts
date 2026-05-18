import { MD3DarkTheme, MD3LightTheme } from 'react-native-paper';

// Eurekabank brand palette – deep teal & gold accents
const brandColors = {
  primary: '#0D7377',
  primaryDark: '#095B5E',
  primaryLight: '#14A0A5',
  secondary: '#D4A843',
  secondaryDark: '#B08C2E',
  surface: '#FFFFFF',
  surfaceDark: '#1A1A2E',
  background: '#F0F4F8',
  backgroundDark: '#0F0F23',
  error: '#CF6679',
  success: '#2ECC71',
  warning: '#F39C12',
  textPrimary: '#1A1A2E',
  textSecondary: '#6B7280',
  textOnPrimary: '#FFFFFF',
  border: '#E2E8F0',
  borderDark: '#2D2D44',
  cardDark: '#16213E',
};

export const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: brandColors.primary,
    primaryContainer: brandColors.primaryLight,
    secondary: brandColors.secondary,
    secondaryContainer: brandColors.secondaryDark,
    background: brandColors.background,
    surface: brandColors.surface,
    error: brandColors.error,
    onPrimary: brandColors.textOnPrimary,
    onSecondary: brandColors.textOnPrimary,
    onBackground: brandColors.textPrimary,
    onSurface: brandColors.textPrimary,
    outline: brandColors.border,
    elevation: {
      ...MD3LightTheme.colors.elevation,
      level0: 'transparent',
      level1: '#FFFFFF',
      level2: '#F8FAFC',
      level3: '#F1F5F9',
      level4: '#E2E8F0',
      level5: '#CBD5E1',
    },
  },
  custom: brandColors,
};

export const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: brandColors.primaryLight,
    primaryContainer: brandColors.primaryDark,
    secondary: brandColors.secondary,
    secondaryContainer: brandColors.secondaryDark,
    background: brandColors.backgroundDark,
    surface: brandColors.surfaceDark,
    error: brandColors.error,
    onPrimary: brandColors.textOnPrimary,
    onSecondary: brandColors.textOnPrimary,
    onBackground: '#E2E8F0',
    onSurface: '#E2E8F0',
    outline: brandColors.borderDark,
    elevation: {
      ...MD3DarkTheme.colors.elevation,
      level0: 'transparent',
      level1: brandColors.surfaceDark,
      level2: brandColors.cardDark,
      level3: '#1A1A3E',
      level4: '#222244',
      level5: '#2A2A4A',
    },
  },
  custom: brandColors,
};

export type AppTheme = typeof lightTheme;
