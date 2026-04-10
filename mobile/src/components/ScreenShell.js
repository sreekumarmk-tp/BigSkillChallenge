import React from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { DARK_BG, GRADIENT_TOP_COLORS } from '../theme/neonTheme';

/**
 * Auth-style shell: dark base + soft top gradient. Replaces GradientBackground + outer SafeAreaView.
 */
const ScreenShell = ({ children, edges = ['top', 'left', 'right'] }) => (
  <SafeAreaView style={styles.safeArea} edges={edges}>
    <LinearGradient colors={GRADIENT_TOP_COLORS} style={styles.gradientBg} />
    {children}
  </SafeAreaView>
);

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: DARK_BG,
  },
  gradientBg: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 400,
    zIndex: -1,
  },
});

export default ScreenShell;
