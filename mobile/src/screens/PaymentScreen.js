import React, { useState, useContext, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, ScrollView, KeyboardAvoidingView, Platform, Image, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AppContext } from '../context/AppContext';
import ScreenShell from '../components/ScreenShell';
import AppFooter from '../components/AppFooter';
import { TEXT_MUTED, INPUT_BG, ERROR, CTA_GRADIENT_COLORS, SCREEN_PADDING_H } from '../theme/neonTheme';

const PaymentScreen = ({ navigation }) => {
  const { processPayment } = useContext(AppContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  const handlePay = async () => {
    setLoading(true);
    try {
      const receipt = await processPayment(5.00);
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
          <Text style={styles.subtitle}>Pay $ 5.00 entry fee · 1-Year OpenAI Subscription prize.</Text>

          <Animated.View style={[styles.prizePreview, { opacity: fadeAnim }]}>
            <Image 
              source={require('../../assets/domain/prize_card.png')} 
              style={styles.prizeImage}
              resizeMode="contain"
            />
            <View style={styles.prizeLabelBox}>
              <Text style={styles.prizeLabelTitle}>PRIZE VALUE: ~$240</Text>
              <Text style={styles.prizeLabelDates}>Subscription: 1st May 2026 - 30th April 2027</Text>
            </View>
          </Animated.View>

          <View style={styles.card}>
            <Text style={styles.inputLabel}>CARD NUMBER</Text>
            <TextInput
              style={styles.input}
              placeholder="0000 0000 0000 0000"
              placeholderTextColor="#555"
              keyboardType="numeric"
              underlineColorAndroid="transparent"
            />
            <View style={styles.row}>
              <View style={styles.halfCol}>
                <Text style={styles.inputLabel}>EXPIRY</Text>
                <TextInput style={styles.input} placeholder="MM/YY" placeholderTextColor="#555" underlineColorAndroid="transparent" />
              </View>
              <View style={styles.halfCol}>
                <Text style={styles.inputLabel}>CVC</Text>
                <TextInput style={styles.input} placeholder="•••" placeholderTextColor="#555" keyboardType="numeric" underlineColorAndroid="transparent" />
              </View>
            </View>
            <Text style={styles.inputLabel}>NAME ON CARD</Text>
            <TextInput style={styles.input} placeholder="As shown on card" placeholderTextColor="#555" underlineColorAndroid="transparent" />

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <TouchableOpacity style={styles.ctaWrap} onPress={handlePay} disabled={loading} activeOpacity={0.85}>
              <LinearGradient colors={CTA_GRADIENT_COLORS} style={styles.button} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                {loading ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <Text style={styles.buttonText}>Pay $ 5.00</Text>
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
    backgroundColor: '#141726',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    padding: 16,
    marginBottom: 16,
  },
  prizePreview: {
    width: '100%',
    aspectRatio: 1.6,
    backgroundColor: 'rgba(0, 150, 255, 0.05)',
    borderRadius: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(0, 240, 255, 0.1)',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  prizeImage: {
    width: '90%',
    height: '75%',
  },
  prizeLabelBox: {
    marginTop: 4,
    alignItems: 'center',
  },
  prizeLabelTitle: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  prizeLabelDates: {
    color: '#00F0FF',
    fontSize: 10,
    fontWeight: '700',
    marginTop: 2,
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
    outlineStyle: 'none',
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
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  errorText: {
    color: ERROR,
    marginBottom: 12,
    fontSize: 14,
    textAlign: 'center',
  },
});

export default PaymentScreen;
