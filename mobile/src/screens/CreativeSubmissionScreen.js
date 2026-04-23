import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AppContext } from '../context/AppContext';
import api from '../services/api';
import ScreenShell from '../components/ScreenShell';
import AppFooter from '../components/AppFooter';
import { TEXT_MUTED, ERROR, SUCCESS, CTA_GRADIENT_COLORS, INPUT_BG, SCREEN_PADDING_H, PREMIUM_GOLD, getTextShadow } from '../theme/neonTheme';

const countWords = (str) => str.trim().split(/\s+/).filter((word) => word.length > 0).length;

const CreativeSubmissionScreen = ({ navigation }) => {
  const { competition } = useContext(AppContext);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const words = countWords(text);

  const handleSubmit = async () => {
    if (words !== 25) {
      setError('Entry must be exactly 25 words.');
      return;
    }

    setLoading(true);
    try {
      if (!competition?.id) {
        setError('Competition data is unavailable. Please try again.');
        setLoading(false);
        return;
      }
      const res = await api.post('/submissions/', {
        competition_id: competition.id,
        content: text,
      });
      navigation.replace('EntryAccepted', { entryId: res.data.id });
    } catch (e) {
      setError('Failed to submit entry.');
    }
    setLoading(false);
  };

  return (
    <ScreenShell>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" nestedScrollEnabled>
          <Text style={[styles.title, styles.textShadowed]}>Creative Hurdle</Text>
          <Text style={[styles.subtitle, styles.textShadowed]}>In exactly 25 words, tell us why you should win this OpenAI subscription.</Text>

          <View style={styles.card}>
            <View style={styles.headerRow}>
              <Text style={styles.label}>Your Response</Text>
              <Text style={[styles.wordCount, words === 25 ? styles.textSuccess : words > 25 ? styles.textError : null]}>
                {words} / 25 words
              </Text>
            </View>

            <TextInput
              style={styles.inputArea}
              multiline
              numberOfLines={8}
              placeholder="Share your vision for Agentic AI..."
              placeholderTextColor="#555"
              value={text}
              onChangeText={setText}
              contextMenuHidden
              autoCorrect={false}
              underlineColorAndroid="transparent"
            />

            <View style={styles.instructionBox}>
              <Text style={styles.instructionText}>
                Paste functionality is disabled. Responses must be original and exactly 25 words.
              </Text>
            </View>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <TouchableOpacity
              style={styles.ctaWrap}
              onPress={handleSubmit}
              disabled={words !== 25 || loading}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={words === 25 && !loading ? CTA_GRADIENT_COLORS : ['#4A4A5C', '#3D3D4D']}
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
    color: TEXT_MUTED,
    fontSize: 13,
  },
  textSuccess: {
    color: SUCCESS,
    fontWeight: 'bold',
  },
  textError: {
    color: ERROR,
    fontWeight: 'bold',
  },
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
  ctaWrap: {
    marginTop: 20,
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
    fontSize: 14,
  },
  textShadowed: {
    ...getTextShadow(0.5, 4),
  },
  textSuccess: {
    color: SUCCESS,
    fontWeight: 'bold',
  },
  textError: {
    color: ERROR,
    fontWeight: 'bold',
  },
  wordCount: {
    color: PREMIUM_GOLD,
    fontSize: 13,
    fontWeight: '600',
  },
});

export default CreativeSubmissionScreen;
