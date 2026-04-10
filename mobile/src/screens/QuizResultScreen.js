import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import ScreenShell from '../components/ScreenShell';
import AppFooter from '../components/AppFooter';
import { TEXT_MUTED, SUCCESS, ERROR, CTA_GRADIENT_COLORS, CARD_BG, SCREEN_PADDING_H } from '../theme/neonTheme';

const QuizResultScreen = ({ route, navigation }) => {
  const { status } = route.params || { status: 'incorrect' };

  let icon = '❌';
  let title = 'Incorrect Answer';
  let message = 'Unfortunately, your answer was incorrect. This entry is now forfeit.';
  let showNext = false;
  let canRetry = true;

  if (status === 'timeout') {
    icon = '⏱';
    title = 'Time Expired';
    message = 'You ran out of time. This entry is now forfeit.';
  } else if (status === 'success') {
    icon = '✅';
    title = 'Quiz Passed!';
    message = 'Congratulations. You may now proceed to the creative submission phase.';
    showNext = true;
    canRetry = false;
  } else if (status === 'limit_reached') {
    icon = '🚫';
    title = 'Limit Reached';
    message = 'You have reached the maximum of 10 attempts allowed for this challenge.';
    canRetry = false;
  }

  const titleColor = status === 'success' ? SUCCESS : ERROR;

  return (
    <ScreenShell>
      <ScrollView contentContainerStyle={styles.scrollContent} bounces={false}>
        <Text style={styles.icon}>{icon}</Text>
        <Text style={[styles.title, { color: titleColor }]}>{title}</Text>
        <Text style={styles.subtitle}>{message}</Text>

        {showNext ? (
          <TouchableOpacity style={styles.ctaWrap} onPress={() => navigation.navigate('CreativeSubmission')} activeOpacity={0.85}>
            <LinearGradient colors={CTA_GRADIENT_COLORS} style={styles.button} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
              <Text style={styles.buttonText}>Begin Creative Submission</Text>
            </LinearGradient>
          </TouchableOpacity>
        ) : (
          <View style={{ width: '100%' }}>
            {canRetry && (
              <TouchableOpacity style={[styles.ctaWrap, { marginBottom: 12 }]} onPress={() => navigation.replace('Quiz')} activeOpacity={0.85}>
                <LinearGradient colors={CTA_GRADIENT_COLORS} style={styles.button} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                  <Text style={styles.buttonText}>New Attempt</Text>
                </LinearGradient>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[styles.secondaryBtn, canRetry && { marginTop: 12 }]}
              onPress={() => navigation.navigate('Dashboard')}
              activeOpacity={0.85}
            >
              <Text style={styles.secondaryBtnText}>Return to Dashboard</Text>
            </TouchableOpacity>
          </View>
        )}

        <AppFooter />
      </ScrollView>
    </ScreenShell>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: SCREEN_PADDING_H,
    paddingTop: 40,
    paddingBottom: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: TEXT_MUTED,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  ctaWrap: {
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 0,
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
  secondaryBtn: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: CARD_BG,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  secondaryBtnText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
});

export default QuizResultScreen;
