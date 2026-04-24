import React, { useState, useContext, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, ActivityIndicator, ScrollView
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AppContext } from '../context/AppContext';
import api from '../services/api';
import ScreenShell from '../components/ScreenShell';
import AppFooter from '../components/AppFooter';
import {
  TEXT_MUTED, ERROR, SUCCESS, CTA_GRADIENT_COLORS,
  INPUT_BG, SCREEN_PADDING_H, PREMIUM_GOLD, NEON_CYAN, getTextShadow
} from '../theme/neonTheme';

// -----------------------------------------------------------------------
// P1: Submission time-window — mirror of SUBMISSION_WINDOW_MINUTES (60 min).
// The countdown is purely UX; the backend enforces the actual window.
// -----------------------------------------------------------------------
const WINDOW_SECONDS = 60 * 60; // 60 minutes

const countWords = (str) =>
  str.trim().split(/\s+/).filter((word) => word.length > 0).length;

const formatTime = (secs) => {
  const m = Math.floor(secs / 60).toString().padStart(2, '0');
  const s = (secs % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
};

const CreativeSubmissionScreen = ({ navigation }) => {
  const { competition, deviceId } = useContext(AppContext);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // P1: Countdown timer — starts when screen mounts (i.e. right after quiz pass)
  const [timeLeft, setTimeLeft] = useState(WINDOW_SECONDS);
  const timerRef = useRef(null);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          // Window expired — navigate away so user cannot submit
          navigation.replace('Dashboard');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, []);

  const words = countWords(text);
  const timerWarning = timeLeft < 300; // Turn red in last 5 minutes

  const handleSubmit = async () => {
    if (words !== 25) {
      setError('Entry must be exactly 25 words.');
      return;
    }
    if (timeLeft <= 0) {
      setError('Submission window has expired. Please restart the process.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      if (!competition?.id) {
        setError('Competition data is unavailable. Please try again.');
        setLoading(false);
        return;
      }

      // P2: Send device fingerprint as both header and body field for maximum coverage.
      const res = await api.post(
        '/submissions/',
        { competition_id: competition.id, content: text, device_id: deviceId },
        { headers: { 'X-Device-Id': deviceId || '' } }
      );
      clearInterval(timerRef.current);
      navigation.replace('EntryAccepted', { entryId: res.data.id });
    } catch (e) {
      const detail = e?.response?.data?.detail;
      setError(detail || 'Failed to submit entry. Please try again.');
    }
    setLoading(false);
  };

  return (
    <ScreenShell>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" nestedScrollEnabled>

          {/* P1: Countdown timer */}
          <View style={styles.timerRow}>
            <Text style={[styles.timerLabel, styles.textShadowed]}>Time Remaining</Text>
            <Text style={[styles.timerValue, timerWarning && styles.timerWarning, styles.textShadowed]}>
              {formatTime(timeLeft)}
            </Text>
          </View>

          <Text style={[styles.title, styles.textShadowed]}>Creative Hurdle</Text>
          <Text style={[styles.subtitle, styles.textShadowed]}>
            In exactly 25 words, tell us why you should win this OpenAI subscription.
          </Text>

          <View style={styles.card}>
            <View style={styles.headerRow}>
              <Text style={styles.label}>Your Response</Text>
              <Text style={[styles.wordCount, words === 25 ? styles.textSuccess : words > 25 ? styles.textError : null]}>
                {words} / 25 words
              </Text>
            </View>

            {/* P1: contextMenuHidden disables long-press paste on native iOS/Android */}
            <TextInput
              testID="creative-submission-input"
              style={styles.inputArea}
              multiline
              numberOfLines={8}
              placeholder="Share your vision for Agentic AI..."
              placeholderTextColor="#555"
              value={text}
              onChangeText={setText}
              contextMenuHidden={true}
              autoCorrect={false}
              underlineColorAndroid="transparent"
            />

            <View style={styles.instructionBox}>
              <Text style={styles.instructionText}>
                Paste functionality is disabled. Responses must be original and exactly 25 words.
                You have {formatTime(timeLeft)} remaining to submit.
              </Text>
            </View>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <TouchableOpacity
              testID="creative-submission-button"
              style={styles.ctaWrap}
              onPress={handleSubmit}
              disabled={words !== 25 || loading || timeLeft <= 0}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={words === 25 && !loading && timeLeft > 0 ? CTA_GRADIENT_COLORS : ['#4A4A5C', '#3D3D4D']}
                style={styles.button}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                {loading ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <Text style={styles.buttonText}>Submit Entry</Text>
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
  timerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: 'rgba(0,240,255,0.05)',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(0,240,255,0.12)',
  },
  timerLabel: {
    color: TEXT_MUTED,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  timerValue: {
    color: NEON_CYAN,
    fontSize: 18,
    fontWeight: 'bold',
    fontVariant: ['tabular-nums'],
  },
  timerWarning: {
    color: '#FF4D4D',
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
    marginBottom: 20,
    lineHeight: 20,
  },
  card: {
    backgroundColor: '#141726',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    padding: 16,
    marginBottom: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    alignItems: 'center',
  },
  label: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  wordCount: {
    color: PREMIUM_GOLD,
    fontSize: 13,
    fontWeight: '600',
  },
  textSuccess: { color: SUCCESS, fontWeight: 'bold' },
  textError: { color: ERROR, fontWeight: 'bold' },
  inputArea: {
    backgroundColor: INPUT_BG,
    borderColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    color: '#FFF',
    fontSize: 15,
    minHeight: 150,
    textAlignVertical: 'top',
    outlineStyle: 'none',
  },
  instructionBox: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    padding: 12,
    borderRadius: 12,
    marginTop: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  instructionText: {
    color: TEXT_MUTED,
    fontSize: 12,
    lineHeight: 18,
  },
  ctaWrap: { marginTop: 20, borderRadius: 12, overflow: 'hidden' },
  button: { paddingVertical: 16, borderRadius: 12, alignItems: 'center' },
  buttonText: { color: '#FFF', fontSize: 15, fontWeight: 'bold', letterSpacing: 1 },
  errorText: { color: ERROR, fontSize: 14, marginTop: 8 },
  textShadowed: { ...getTextShadow(0.5, 4) },
});

export default CreativeSubmissionScreen;
