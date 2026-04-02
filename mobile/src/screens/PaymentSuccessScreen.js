import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import GradientBackground from '../components/GradientBackground';
import { COLORS, SIZES, GLOBAL_STYLES } from '../theme/constants';

const PaymentSuccessScreen = ({ route, navigation }) => {
  const { transactionId } = route.params || {};

  return (
    <GradientBackground>
      <SafeAreaView style={GLOBAL_STYLES.container}>
        <View style={styles.content}>
          <Text style={styles.icon}>✅</Text>
          <Text style={styles.title}>Payment Successful</Text>
          <Text style={styles.subtitle}>Reference: {transactionId}</Text>
          
          <View style={GLOBAL_STYLES.glassCard}>
            <Text style={styles.infoText}>
              You are now ready to take the qualification quiz. You will have exactly 30 seconds to answer the question.
              If you fail or run out of time, your entry is forfeit.
            </Text>
          </View>

          <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Quiz')}>
            <Text style={styles.buttonText}>Start Quiz</Text>
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
    alignItems: 'center',
  },
  icon: {
    fontSize: 64,
    marginBottom: SIZES.padding,
  },
  title: {
    fontSize: 28,
    color: COLORS.feedback.success,
    fontWeight: 'bold',
    marginBottom: SIZES.base,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.text.secondary,
    marginBottom: SIZES.padding * 2,
  },
  infoText: {
    color: COLORS.text.primary,
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
  },
  button: {
    backgroundColor: COLORS.primary.orangeStart,
    padding: SIZES.padding,
    borderRadius: SIZES.btnRadius,
    alignItems: 'center',
    marginTop: SIZES.padding * 2,
    width: '100%',
  },
  buttonText: {
    color: COLORS.text.primary,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default PaymentSuccessScreen;
