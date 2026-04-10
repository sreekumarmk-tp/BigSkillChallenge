import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AppContext } from '../context/AppContext';
import ScreenShell from '../components/ScreenShell';
import AppFooter from '../components/AppFooter';
import { TEXT_MUTED, INPUT_BG, ERROR, CTA_GRADIENT_COLORS, SCREEN_PADDING_H } from '../theme/neonTheme';

const PaymentScreen = ({ navigation }) => {
  const { processPayment } = useContext(AppContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handlePay = async () => {
    setLoading(true);
    try {
      const receipt = await processPayment(2.99);
      if (receipt) {
        navigation.navigate('PaymentSuccess', { transactionId: receipt.transaction_id });
      } else {
        setError('Payment could not be completed.');
      }
    } catch (e) {
      setError('An error occurred during payment.');
    }
    setLoading(false);
  };

  return (
    <ScreenShell>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <Text style={styles.title}>Secure Checkout</Text>
          <Text style={styles.subtitle}>Pay A$2.99 entry fee.</Text>

          <View style={styles.card}>
            <Text style={styles.inputLabel}>CARD NUMBER</Text>
            <TextInput
              style={styles.input}
              placeholder="0000 0000 0000 0000"
              placeholderTextColor="#555"
              keyboardType="numeric"
            />
            <View style={styles.row}>
              <View style={styles.halfCol}>
                <Text style={styles.inputLabel}>EXPIRY</Text>
                <TextInput style={styles.input} placeholder="MM/YY" placeholderTextColor="#555" />
              </View>
              <View style={styles.halfCol}>
                <Text style={styles.inputLabel}>CVC</Text>
                <TextInput style={styles.input} placeholder="•••" placeholderTextColor="#555" keyboardType="numeric" />
              </View>
            </View>
            <Text style={styles.inputLabel}>NAME ON CARD</Text>
            <TextInput style={styles.input} placeholder="As shown on card" placeholderTextColor="#555" />

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <TouchableOpacity style={styles.ctaWrap} onPress={handlePay} disabled={loading} activeOpacity={0.85}>
              <LinearGradient colors={CTA_GRADIENT_COLORS} style={styles.button} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                {loading ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <Text style={styles.buttonText}>Pay A$2.99</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>

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
  },
  title: {
    fontSize: 22,
    color: '#FFF',
    fontWeight: '900',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: TEXT_MUTED,
    lineHeight: 20,
    marginBottom: 24,
  },
  card: {
    backgroundColor: '#1C1F33',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    padding: 16,
    marginBottom: 16,
  },
  inputLabel: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginBottom: 8,
    marginLeft: 4,
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
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 0,
  },
  halfCol: {
    width: '48%',
  },
  ctaWrap: {
    marginTop: 8,
    borderRadius: 12,
    overflow: 'hidden',
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
    marginBottom: 12,
    fontSize: 14,
    textAlign: 'center',
  },
});

export default PaymentScreen;
