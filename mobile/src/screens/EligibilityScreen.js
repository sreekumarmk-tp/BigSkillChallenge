import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import GradientBackground from '../components/GradientBackground';
import { COLORS, SIZES, GLOBAL_STYLES } from '../theme/constants';

const Checkbox = ({ isChecked, onPress, label }) => (
  <TouchableOpacity style={styles.checkboxContainer} onPress={onPress}>
    <View style={[styles.checkbox, isChecked && styles.checkboxChecked]}>
      {isChecked && <Text style={styles.checkmark}>✓</Text>}
    </View>
    <Text style={styles.checkboxLabel}>{label}</Text>
  </TouchableOpacity>
);

const EligibilityScreen = ({ navigation }) => {
  const [c1, setC1] = useState(false);
  const [c2, setC2] = useState(false);
  const [c3, setC3] = useState(false);

  const allChecked = c1 && c2 && c3;

  return (
    <GradientBackground>
      <SafeAreaView style={GLOBAL_STYLES.container}>
        <View style={styles.content}>
          <Text style={styles.title}>Important Confirmation</Text>
          <Text style={styles.subtitle}>Please confirm your eligibility to continue.</Text>
          
          <View style={GLOBAL_STYLES.glassCard}>
            <Checkbox 
                isChecked={c1} 
                onPress={() => setC1(!c1)} 
                label="I confirm I am 18 years or older and legally allowed to participate." 
            />
            <Checkbox 
                isChecked={c2} 
                onPress={() => setC2(!c2)} 
                label="I understand this is a game of skill and winners are chosen based on merit." 
            />
            <Checkbox 
                isChecked={c3} 
                onPress={() => setC3(!c3)} 
                label="I agree to the 10-entry maximum limit per person." 
            />
          </View>

          <TouchableOpacity
            style={[styles.button, !allChecked && styles.buttonDisabled]}
            disabled={!allChecked}
            onPress={() => navigation.navigate('Payment')}
          >
            <Text style={styles.buttonText}>Continue to Payment</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </GradientBackground>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
    padding: SIZES.padding * 2,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    color: COLORS.text.primary,
    fontWeight: 'bold',
    marginBottom: SIZES.base,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.text.secondary,
    marginBottom: SIZES.padding * 2,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.padding,
    paddingRight: SIZES.padding * 2,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: COLORS.primary.orangeStart,
    borderRadius: 4,
    marginRight: SIZES.padding,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: COLORS.primary.orangeStart,
  },
  checkmark: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  checkboxLabel: {
    color: COLORS.text.primary,
    fontSize: 14,
    lineHeight: 20,
  },
  button: {
    backgroundColor: COLORS.primary.orangeStart,
    padding: SIZES.padding,
    borderRadius: SIZES.btnRadius,
    alignItems: 'center',
    marginTop: SIZES.padding * 2,
  },
  buttonDisabled: {
    backgroundColor: 'rgba(245, 158, 11, 0.4)',
  },
  buttonText: {
    color: COLORS.text.primary,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default EligibilityScreen;
