import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import GradientBackground from '../components/GradientBackground';
import { COLORS, SIZES, GLOBAL_STYLES } from '../theme/constants';

const QuizResultScreen = ({ route, navigation }) => {
  const { status } = route.params || { status: 'incorrect' };

  let icon = '❌';
  let title = 'Incorrect Answer';
  let message = 'Unfortunately, your answer was incorrect. This entry is now forfeit.';
  let showNext = false;

  if (status === 'timeout') {
    icon = '⏱';
    title = 'Time Expired';
    message = 'You ran out of time. This entry is now forfeit.';
  } else if (status === 'success') {
    icon = '✅';
    title = 'Quiz Passed!';
    message = 'Congratulations. You may now proceed to the creative submission phase.';
    showNext = true;
  }

  return (
    <GradientBackground>
      <SafeAreaView style={GLOBAL_STYLES.container}>
        <View style={styles.content}>
          <Text style={styles.icon}>{icon}</Text>
          <Text style={[styles.title, status === 'success' ? styles.successText : styles.errorText]}>{title}</Text>
          <Text style={styles.subtitle}>{message}</Text>
          
          {showNext ? (
            <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('CreativeSubmission')}>
              <Text style={styles.buttonText}>Begin Creative Submission</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={[styles.button, styles.dashboardButton]} onPress={() => navigation.navigate('Dashboard')}>
              <Text style={styles.buttonText}>Return to Dashboard</Text>
            </TouchableOpacity>
          )}
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
    fontWeight: 'bold',
    marginBottom: SIZES.base,
    textAlign: 'center',
  },
  successText: {
    color: COLORS.feedback.success,
  },
  errorText: {
    color: COLORS.feedback.error,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginBottom: SIZES.padding * 3,
    lineHeight: 24,
  },
  button: {
    backgroundColor: COLORS.primary.orangeStart,
    padding: SIZES.padding,
    borderRadius: SIZES.btnRadius,
    alignItems: 'center',
    width: '100%',
  },
  dashboardButton: {
    backgroundColor: COLORS.glass.bg,
    borderWidth: 1,
    borderColor: COLORS.glass.border,
  },
  buttonText: {
    color: COLORS.text.primary,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default QuizResultScreen;
