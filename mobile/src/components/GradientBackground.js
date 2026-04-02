import React from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../theme/constants';

const GradientBackground = ({ children, style }) => {
  return (
    <LinearGradient
      colors={[COLORS.background.dark, COLORS.background.mid, COLORS.background.light]}
      style={[styles.background, style]}
    >
      {children}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
});

export default GradientBackground;
