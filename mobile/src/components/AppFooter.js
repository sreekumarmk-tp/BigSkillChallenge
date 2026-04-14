import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NEON_CYAN, TEXT_MUTED } from '../theme/neonTheme';

/** Same footer block as LandingScreen */
const AppFooter = () => (
  <View style={styles.footer}>
    <Text style={[styles.logoText, styles.footerLogoSize]}>
      <Text style={{ color: NEON_CYAN }}>BIG </Text>AI CHALLENGE
    </Text>
    <Text style={styles.footerCopyright}>© 2026. PURE SKILL ONLY.</Text>
  </View>
);

const styles = StyleSheet.create({
  footer: {
    alignItems: 'center',
    marginTop: 24,
  },
  logoText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '900',
  },
  footerLogoSize: {
    fontSize: 16,
    marginBottom: 8,
  },
  footerCopyright: {
    color: TEXT_MUTED,
    fontSize: 10,
    letterSpacing: 1,
  },
});

export default AppFooter;
