import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import ScreenShell from '../components/ScreenShell';
import AppFooter from '../components/AppFooter';
import { TEXT_MUTED, SUCCESS, ERROR, CTA_GRADIENT_COLORS, CARD_BG, SCREEN_PADDING_H, NEON_CYAN, PREMIUM_GOLD, getTextShadow } from '../theme/neonTheme';

const QuizResultScreen = ({ route, navigation }) => {
  const { status, attempt_number } = route.params || { status: 'incorrect', attempt_number: 0 };
  const [fadeAnim] = React.useState(new Animated.Value(0));
  const [countdown, setCountdown] = React.useState(5);

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

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
    title = 'AI Knowledge Match!';
    message = 'Impressive. You have passed the skill challenge. Proceed to share your vision.';
    showNext = true;
    canRetry = false;
  } else if (status === 'limit_reached') {
    icon = '🚫';
    title = 'Limit Reached';
    message = 'You have reached the maximum of 10 attempts allowed for this challenge.';
    canRetry = false;
  }

  if (attempt_number >= 10) {
    canRetry = false;
    if (status !== 'success' && status !== 'limit_reached') {
      message = 'Unfortunately, your answer was incorrect. You have exhausted all 10 attempts for this challenge.';
    }
  }

  React.useEffect(() => {
    if (!canRetry && !showNext) {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            navigation.navigate('Dashboard');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [canRetry, showNext, navigation]);

  const titleColor = status === 'success' ? SUCCESS : ERROR;

  return (
    <ScreenShell>
      <ScrollView contentContainerStyle={styles.scrollContent} bounces={false}>
        <Animated.View style={{ opacity: fadeAnim, alignItems: 'center', width: '100%' }}>
          {status === 'success' ? (
            <Image 
              source={require('../../assets/domain/success_badge.png')} 
              style={styles.badgeImage}
              resizeMode="contain"
            />
          ) : (
            <Text style={styles.icon}>{icon}</Text>
          )}
          <Text style={[styles.title, { color: titleColor }, styles.textShadowed]}>{title}</Text>
          <Text style={[styles.subtitle, styles.textShadowed]}>{message}</Text>
          {!canRetry && !showNext && (
            <Text style={[styles.redirectText, styles.textShadowed]}>Redirecting to dashboard in {countdown}s...</Text>
          )}
        </Animated.View>

        {showNext ? (
          <TouchableOpacity style={styles.ctaWrap} onPress={() => navigation.navigate('CreativeSubmission')} activeOpacity={0.85}>
            <LinearGradient colors={CTA_GRADIENT_COLORS} style={styles.button} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
              <Text style={styles.buttonText}>Begin Creative Submission</Text>
            </LinearGradient>
          </TouchableOpacity>
        ) : (
          <View style={{ width: '100%' }}>
            {canRetry && (
              <TouchableOpacity style={[styles.ctaWrap, { marginBottom: 12 }]} onPress={() => navigation.replace('Eligibility')} activeOpacity={0.85}>
                <LinearGradient colors={CTA_GRADIENT_COLORS} style={styles.button} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                  <Text style={styles.buttonText}>New Attempt</Text>
                </LinearGradient>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[styles.secondaryBtn, canRetry ? { marginTop: 12 } : styles.primarySecondaryBtn]}
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
    color: '#FFF',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  badgeImage: {
    width: 140,
    height: 140,
    marginBottom: 20,
  },
  ctaWrap: {
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
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
    backgroundColor: '#141726',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  secondaryBtnText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  primarySecondaryBtn: {
    backgroundColor: '#1E2548', // Slightly lighter to distinguish as primary CTA
    borderColor: NEON_CYAN,
    borderWidth: 1.5,
  },
  redirectText: {
    color: PREMIUM_GOLD,
    fontSize: 12,
    marginTop: -16,
    marginBottom: 32,
    fontWeight: '600',
    fontStyle: 'italic',
  },
  textShadowed: {
    ...getTextShadow(0.5, 4),
  },
});

export default QuizResultScreen;
