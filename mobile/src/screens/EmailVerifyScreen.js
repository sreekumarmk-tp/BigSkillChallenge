import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import api from '../services/api';
import ScreenShell from '../components/ScreenShell';
import AppFooter from '../components/AppFooter';
import { TEXT_MUTED, ERROR, CTA_GRADIENT_COLORS, INPUT_BG, SCREEN_PADDING_H } from '../theme/neonTheme';

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
    <ScreenShell>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <Text style={styles.title}>Verify Email</Text>
          <Text style={styles.subtitle}>Enter the 6-digit code sent to your email.</Text>

          <TextInput
            style={styles.input}
            placeholder="000000"
            placeholderTextColor="#555"
            value={otp}
            onChangeText={setOtp}
            keyboardType="number-pad"
            maxLength={6}
          />
          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <TouchableOpacity
            style={styles.ctaWrap}
            disabled={otp.length !== 6}
            onPress={handleVerify}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={otp.length === 6 ? CTA_GRADIENT_COLORS : ['#4A4A5C', '#3D3D4D']}
              style={styles.button}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.buttonText}>Verify</Text>
            </LinearGradient>
          </TouchableOpacity>

          <AppFooter />
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenShell>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: SCREEN_PADDING_H,
    paddingTop: 16,
    paddingBottom: 40,
    justifyContent: 'center',
  },
  title: {
    fontSize: 22,
    color: '#FFF',
    fontWeight: '900',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: TEXT_MUTED,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 24,
  },
  input: {
    backgroundColor: INPUT_BG,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 16,
    color: '#FFF',
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: 8,
  },
  ctaWrap: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 8,
  },
  button: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  errorText: {
    color: ERROR,
    textAlign: 'center',
    marginBottom: 12,
    fontSize: 14,
  },
});

export default EmailVerifyScreen;
