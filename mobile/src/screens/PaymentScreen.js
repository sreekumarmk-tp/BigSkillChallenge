import React, { useState, useContext, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ActivityIndicator, ScrollView, KeyboardAvoidingView,
  Platform, Image, Animated
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AppContext } from '../context/AppContext';
import ScreenShell from '../components/ScreenShell';
import AppFooter from '../components/AppFooter';
import { TEXT_MUTED, ERROR, CTA_GRADIENT_COLORS, SCREEN_PADDING_H, NEON_CYAN } from '../theme/neonTheme';

const PaymentScreen = ({ navigation }) => {
  const { processPayment, competition } = useContext(AppContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fadeAnim] = useState(new Animated.Value(0));
  const entryFee = Number(competition?.entry_fee ?? 2.99).toFixed(2);

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }).start();
  }, []);

  const handlePay = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await processPayment(Number(entryFee));
      if (result?.transactionId) {
        navigation.navigate('PaymentSuccess', { transactionId: result.transactionId });
      } else {
        setError('Payment could not be completed. Please try again.');
      }
    } catch (e) {
      const detail = e?.response?.data?.detail || e?.message;
      setError(detail || 'An error occurred during payment.');
    }
    setLoading(false);
  };

  return (
    <ScreenShell>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" nestedScrollEnabled>
          <Text style={styles.title}>Secure Checkout</Text>
          <Text style={styles.subtitle}>Pay ${entryFee} entry fee · 1-Year OpenAI Subscription prize.</Text>

          <Animated.View style={[styles.prizePreview, { opacity: fadeAnim }]}>
            <Image source={require('../../assets/domain/prize_card.png')} style={styles.prizeImage} resizeMode="contain" />
            <View style={styles.prizeLabelBox}>
              <Text style={styles.prizeLabelTitle}>PRIZE VALUE: ~$240</Text>
              <Text style={styles.prizeLabelDates}>Subscription: 1st May 2026 - 30th April 2027</Text>
            </View>
          </Animated.View>

          <View style={styles.card}>
            {/* P0: Stripe Payment Sheet handles card capture securely on-device */}
            <View style={styles.stripeInfoBox}>
              <Text style={styles.stripeInfoIcon}>🔒</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.stripeInfoTitle}>Secure Payment via Stripe</Text>
                <Text style={styles.stripeInfoBody}>
                  Tapping "Pay" opens the Stripe Payment Sheet where you can securely enter your card details.
                  Your card information is encrypted and processed directly by Stripe — it never touches our servers.
                </Text>
              </View>
            </View>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <TouchableOpacity testID="payment-button" style={styles.ctaWrap} onPress={handlePay} disabled={loading} activeOpacity={0.85}>
              <LinearGradient
                colors={!loading ? CTA_GRADIENT_COLORS : ['#4A4A5C', '#3D3D4D']}
                style={styles.button}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.buttonText}>Pay ${entryFee}</Text>}
              </LinearGradient>
            </TouchableOpacity>

            <Text style={styles.secureNote}>🔒  Payments processed securely by Stripe. We never store your card details.</Text>
          </View>

          <AppFooter />
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenShell>
  );
};

const styles = StyleSheet.create({
  scrollContent: { flexGrow: 1, paddingHorizontal: SCREEN_PADDING_H, paddingTop: 16, paddingBottom: 40 },
  title: { fontSize: 22, color: '#FFF', fontWeight: '900', marginBottom: 8 },
  subtitle: { fontSize: 14, color: TEXT_MUTED, lineHeight: 20, marginBottom: 24 },
  card: { backgroundColor: '#141726', borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', padding: 16, marginBottom: 16 },
  prizePreview: { width: '100%', aspectRatio: 1.6, backgroundColor: 'rgba(0,150,255,0.05)', borderRadius: 16, marginBottom: 24, borderWidth: 1, borderColor: 'rgba(0,240,255,0.1)', overflow: 'hidden', justifyContent: 'center', alignItems: 'center', padding: 10 },
  prizeImage: { width: '90%', height: '75%' },
  prizeLabelBox: { marginTop: 4, alignItems: 'center' },
  prizeLabelTitle: { color: '#FFF', fontSize: 12, fontWeight: 'bold', letterSpacing: 0.5 },
  prizeLabelDates: { color: NEON_CYAN, fontSize: 10, fontWeight: '700', marginTop: 2 },
  stripeInfoBox: { flexDirection: 'row', backgroundColor: 'rgba(0,240,255,0.05)', borderRadius: 10, borderWidth: 1, borderColor: 'rgba(0,240,255,0.12)', padding: 14, marginBottom: 20, gap: 12, alignItems: 'flex-start' },
  stripeInfoIcon: { fontSize: 22, marginTop: 2 },
  stripeInfoTitle: { color: '#FFF', fontSize: 13, fontWeight: 'bold', marginBottom: 4 },
  stripeInfoBody: { color: TEXT_MUTED, fontSize: 12, lineHeight: 18 },
  ctaWrap: { borderRadius: 12, overflow: 'hidden', marginBottom: 12 },
  button: { paddingVertical: 18, paddingHorizontal: 24, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  buttonText: { color: '#FFF', fontSize: 16, fontWeight: '900', letterSpacing: 1.2, textTransform: 'uppercase' },
  errorText: { color: ERROR, marginBottom: 12, fontSize: 14, textAlign: 'center' },
  secureNote: { color: TEXT_MUTED, fontSize: 11, textAlign: 'center', lineHeight: 16 },
});

export default PaymentScreen;
