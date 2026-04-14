import {
  DARK_BG,
  CARD_BG,
  TEXT_MUTED,
  NEON_CYAN,
  NEON_BLUE,
  SUCCESS,
  ERROR,
  INPUT_BG,
} from './neonTheme';

export const COLORS = {
  background: {
    dark: DARK_BG,
    mid: '#0D1117',
    light: '#161B22',
  },
  primary: {
    blueStart: NEON_BLUE,
    blueEnd: '#007BFF',
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
