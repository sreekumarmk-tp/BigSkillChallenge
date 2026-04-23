import React, { useContext, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AppContext } from '../context/AppContext';
import ScreenShell from '../components/ScreenShell';
import AppFooter from '../components/AppFooter';
import { TEXT_MUTED, SUCCESS, CTA_GRADIENT_COLORS, CARD_BG, SCREEN_PADDING_H } from '../theme/neonTheme';

const PaymentSuccessScreen = ({ route, navigation }) => {
  const { paymentStatus, setPaymentStatus } = useContext(AppContext);
  const hasValidatedAccess = useRef(false);
  const { transactionId } = route.params || {};

  useEffect(() => {
    if (hasValidatedAccess.current) return;
    hasValidatedAccess.current = true;

    if (!paymentStatus) {
      navigation.replace('Payment');
      return;
    }

    // Consume access immediately so this screen cannot be re-opened from other pages.
    setPaymentStatus(false);
  }, [navigation, paymentStatus, setPaymentStatus]);

  return (
    <ScreenShell>
      <ScrollView contentContainerStyle={styles.scrollContent} bounces={false} nestedScrollEnabled keyboardShouldPersistTaps="handled">
        <Text style={styles.icon}>✅</Text>
        <Text style={styles.title}>Payment Successful</Text>
        <Text style={styles.subtitle}>Reference: {transactionId}</Text>

        <View style={styles.card}>
          <Text style={styles.infoText}>
            You are now ready to take the qualification quiz. You will have exactly 30 seconds to answer the question. If you
            fail or run out of time, your entry is forfeit.
          </Text>
        </View>

        <TouchableOpacity style={styles.ctaWrap} onPress={() => navigation.navigate('Quiz')} activeOpacity={0.85}>
          <LinearGradient colors={CTA_GRADIENT_COLORS} style={styles.button} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
            <Text style={styles.buttonText}>Start Quiz</Text>
          </LinearGradient>
        </TouchableOpacity>

        <AppFooter />
      </ScrollView>
    </ScreenShell>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: SCREEN_PADDING_H,
    paddingTop: 32,
    paddingBottom: 40,
    alignItems: 'center',
  },
  icon: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    color: SUCCESS,
    fontWeight: '900',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: TEXT_MUTED,
    marginBottom: 24,
  },
  card: {
    width: '100%',
    backgroundColor: CARD_BG,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    padding: 16,
    marginBottom: 24,
  },
  infoText: {
    color: TEXT_MUTED,
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
  },
  ctaWrap: {
    width: '100%',
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
});

export default PaymentSuccessScreen;
