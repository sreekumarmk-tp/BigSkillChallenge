import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppContext } from '../context/AppContext';
import GradientBackground from '../components/GradientBackground';
import { COLORS, SIZES, GLOBAL_STYLES } from '../theme/constants';

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
    <GradientBackground>
      <SafeAreaView style={GLOBAL_STYLES.container}>
        <View style={styles.content}>
          <Text style={styles.title}>Secure Checkout</Text>
          <Text style={styles.subtitle}>Pay A$2.99 entry fee.</Text>

          <View style={GLOBAL_STYLES.glassCard}>
            <TextInput style={styles.input} placeholder="Card Number" placeholderTextColor={COLORS.text.secondary} keyboardType="numeric" />
            <View style={styles.row}>
              <TextInput style={[styles.input, styles.half]} placeholder="MM/YY" placeholderTextColor={COLORS.text.secondary} />
              <TextInput style={[styles.input, styles.half]} placeholder="CVC" placeholderTextColor={COLORS.text.secondary} keyboardType="numeric" />
            </View>
            <TextInput style={styles.input} placeholder="Name on Card" placeholderTextColor={COLORS.text.secondary} />
            
            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <TouchableOpacity style={styles.button} onPress={handlePay} disabled={loading}>
              {loading ? (
                <ActivityIndicator color={COLORS.text.primary} />
              ) : (
                <Text style={styles.buttonText}>Pay A$2.99</Text>
              )}
            </TouchableOpacity>
          </View>
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
  input: {
    backgroundColor: COLORS.glass.input,
    borderColor: COLORS.glass.border,
    borderWidth: 1,
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    color: COLORS.text.primary,
    marginBottom: SIZES.base,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  half: {
    width: '48%',
  },
  button: {
    backgroundColor: COLORS.primary.orangeStart,
    padding: SIZES.padding,
    borderRadius: SIZES.btnRadius,
    alignItems: 'center',
    marginTop: SIZES.padding,
  },
  buttonText: {
    color: COLORS.text.primary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorText: {
    color: COLORS.feedback.error,
    marginBottom: SIZES.base,
  }
});

export default PaymentScreen;
