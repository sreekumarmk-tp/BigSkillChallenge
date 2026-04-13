/**
 * Shared neon / dark theme (Auth + Landing + Eligibility reference).
 * Use these tokens for colour, typography, and card chrome across screens.
 */
import { StyleSheet, Platform } from 'react-native';

export const NEON_CYAN = '#00F0FF';
export const NEON_PURPLE = '#A18CFF';
export const DARK_BG = '#0B0D17';
export const CARD_BG = '#1C1F33';
export const TEXT_MUTED = '#9CA3AF';
export const INPUT_BG = '#000000';

/** Top fade overlay — same as AuthScreen */
export const GRADIENT_TOP_COLORS = ['rgba(31, 28, 67, 0.4)', 'rgba(0,0,0,0)', DARK_BG];

/** Primary CTA — same as AuthScreen */
export const CTA_GRADIENT_COLORS = ['#8B7BFF', '#7161FF'];

export const SUCCESS = '#4ADE80';
export const ERROR = '#F87171';

export const SCREEN_PADDING_H = 24;
export const SCREEN_PADDING_TOP = 16;
export const SCREEN_PADDING_BOTTOM = 40;

/**
 * Helper to handle shadows cross-platform.
 * React Native Web deprecates shadow* props in favor of boxShadow.
 */
export const getShadow = (color, offset = { width: 0, height: 8 }, opacity = 0.25, radius = 15) => {
  if (Platform.OS === 'web') {
    // Convert hex to rgba if needed, or just use the hex if it's already a color token
    // For simplicity with our theme, we use the hex color but web needs the alpha
    return {
      boxShadow: `${offset.width}px ${offset.height}px ${radius}px ${color}${Math.round(opacity * 255).toString(16).padStart(2, '0')}`,
    };
  }
  return {
    shadowColor: color,
    shadowOffset: offset,
    shadowOpacity: opacity,
    shadowRadius: radius,
  };
};

export const neonStyles = StyleSheet.create({
  title: {
    color: '#FFF',
    fontSize: 22,
    fontWeight: '900',
  },
  titleAccent: {
    color: NEON_CYAN,
  },
  subtitle: {
    color: TEXT_MUTED,
    fontSize: 14,
    lineHeight: 20,
  },
  sectionTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  bodyMuted: {
    color: TEXT_MUTED,
    fontSize: 13,
    lineHeight: 20,
  },
  card: {
    backgroundColor: CARD_BG,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    padding: 16,
  },
  input: {
    backgroundColor: INPUT_BG,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 56,
    color: '#FFF',
    fontSize: 15,
  },
  inputLabel: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginBottom: 8,
    marginLeft: 4,
  },
  errorText: {
    color: ERROR,
    fontSize: 14,
    textAlign: 'center',
  },
  ctaText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  screenScroll: {
    flexGrow: 1,
    paddingHorizontal: SCREEN_PADDING_H,
    paddingTop: SCREEN_PADDING_TOP,
    paddingBottom: SCREEN_PADDING_BOTTOM,
  },
});
