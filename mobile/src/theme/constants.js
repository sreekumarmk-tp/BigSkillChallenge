export const COLORS = {
  background: {
    dark: "#08002E",
    mid: "#12006E",
    light: "#1A0A7C"
  },
  primary: {
    orangeStart: "#F59E0B",
    orangeEnd: "#EA580C"
  },
  feedback: {
    success: "#4ADE80",
    error: "#F87171",
    info: "#C4B5FD"
  },
  glass: {
    bg: "rgba(255, 255, 255, 0.07)",
    border: "rgba(255, 255, 255, 0.12)",
    input: "rgba(255, 255, 255, 0.08)"
  },
  text: {
    primary: "#FFFFFF",
    secondary: "rgba(255, 255, 255, 0.7)",
  }
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
