import {
  DARK_BG,
  CARD_BG,
  TEXT_MUTED,
  NEON_CYAN,
  NEON_PURPLE,
  SUCCESS,
  ERROR,
  INPUT_BG,
} from './neonTheme';

export const COLORS = {
  background: {
    dark: DARK_BG,
    mid: '#11162C',
    light: '#1A203B',
  },
  primary: {
    orangeStart: NEON_PURPLE,
    orangeEnd: '#7161FF',
  },
  feedback: {
    success: SUCCESS,
    error: ERROR,
    info: '#C4B5FD',
  },
  glass: {
    bg: CARD_BG,
    border: 'rgba(255, 255, 255, 0.05)',
    input: INPUT_BG,
  },
  text: {
    primary: '#FFFFFF',
    secondary: TEXT_MUTED,
    accent: NEON_CYAN,
  },
};

export const SIZES = {
  base: 8,
  padding: 16,
  radius: 8,
  btnRadius: 50,
};

export const GLOBAL_STYLES = {
  glassCard: {
    backgroundColor: COLORS.glass.bg,
    borderColor: COLORS.glass.border,
    borderWidth: 1,
    borderRadius: SIZES.radius,
    padding: SIZES.padding
  },
  container: {
    flex: 1,
  }
};

export * from './neonTheme';
