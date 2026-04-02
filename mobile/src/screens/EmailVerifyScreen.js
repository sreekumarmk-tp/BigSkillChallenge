import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../services/api';
import GradientBackground from '../components/GradientBackground';
import { COLORS, SIZES, GLOBAL_STYLES } from '../theme/constants';

const EmailVerifyScreen = ({ navigation }) => {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');

  const handleVerify = async () => {
    if (otp.length !== 6) {
      setError('Please enter a 6 digit code.');
      return;
    }
    try {
      await api.post('/auth/verify-email', { otp });
      navigation.navigate('Eligibility');
    } catch (e) {
      setError('Invalid verification code.');
    }
  };

  return (
    <GradientBackground>
      <SafeAreaView style={GLOBAL_STYLES.container}>
        <View style={styles.content}>
          <Text style={styles.title}>Verify Email</Text>
          <Text style={styles.subtitle}>Enter the 6-digit code sent to your email.</Text>
          
          <TextInput
            style={styles.input}
            placeholder="000000"
            placeholderTextColor={COLORS.text.secondary}
            value={otp}
            onChangeText={setOtp}
            keyboardType="number-pad"
            maxLength={6}
          />
          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <TouchableOpacity
            style={[styles.button, otp.length !== 6 && styles.buttonDisabled]}
            disabled={otp.length !== 6}
            onPress={handleVerify}
          >
            <Text style={styles.buttonText}>Verify</Text>
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
    fontSize: 28,
    color: COLORS.text.primary,
    fontWeight: 'bold',
    marginBottom: SIZES.base,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginBottom: SIZES.padding * 2,
  },
  input: {
    backgroundColor: COLORS.glass.input,
    borderColor: COLORS.glass.border,
    borderWidth: 1,
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    color: COLORS.text.primary,
    fontSize: 24,
    textAlign: 'center',
    marginBottom: SIZES.padding,
    letterSpacing: 4,
  },
  button: {
    backgroundColor: COLORS.primary.orangeStart,
    padding: SIZES.padding,
    borderRadius: SIZES.btnRadius,
    alignItems: 'center',
    marginTop: SIZES.padding,
  },
  buttonDisabled: {
    backgroundColor: 'rgba(245, 158, 11, 0.4)',
  },
  buttonText: {
    color: COLORS.text.primary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorText: {
    color: COLORS.feedback.error,
    textAlign: 'center',
    marginBottom: SIZES.base,
  }
});

export default EmailVerifyScreen;
