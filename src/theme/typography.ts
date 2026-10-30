import { StyleSheet } from 'react-native';

export const FONT_FAMILY = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semiBold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
} as const;

export const FONT_SIZE = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
  '4xl': 36,
  '5xl': 44,
} as const;

export const LINE_HEIGHT = {
  tight: 1.2,
  normal: 1.5,
  relaxed: 1.7,
} as const;

export const typography = StyleSheet.create({
  display: {
    fontFamily: FONT_FAMILY.bold,
    fontSize: FONT_SIZE['4xl'],
    lineHeight: 43,
  },
  h1: {
    fontFamily: FONT_FAMILY.bold,
    fontSize: FONT_SIZE['2xl'],
    lineHeight: 29,
  },
  h2: {
    fontFamily: FONT_FAMILY.semiBold,
    fontSize: FONT_SIZE.xl,
    lineHeight: 26,
  },
  h3: {
    fontFamily: FONT_FAMILY.semiBold,
    fontSize: FONT_SIZE.lg,
    lineHeight: 24,
  },
  body: {
    fontFamily: FONT_FAMILY.regular,
    fontSize: FONT_SIZE.md,
    lineHeight: 24,
  },
  bodySmall: {
    fontFamily: FONT_FAMILY.regular,
    fontSize: FONT_SIZE.sm,
    lineHeight: 21,
  },
  label: {
    fontFamily: FONT_FAMILY.medium,
    fontSize: FONT_SIZE.sm,
    lineHeight: 20,
  },
  caption: {
    fontFamily: FONT_FAMILY.regular,
    fontSize: FONT_SIZE.xs,
    lineHeight: 17,
  },
  metric: {
    fontFamily: FONT_FAMILY.bold,
    fontSize: FONT_SIZE['3xl'],
    lineHeight: 36,
    fontVariant: ['tabular-nums'],
  },
});