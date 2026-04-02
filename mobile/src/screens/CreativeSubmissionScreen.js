import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppContext } from '../context/AppContext';
import api from '../services/api';
import GradientBackground from '../components/GradientBackground';
import { COLORS, SIZES, GLOBAL_STYLES } from '../theme/constants';

const countWords = (str) => {
  return str.trim().split(/\s+/).filter(word => word.length > 0).length;
};

const CreativeSubmissionScreen = ({ navigation }) => {
  const { competition } = useContext(AppContext);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const words = countWords(text);
  const wordsLeft = 25 - words;

  const handleSubmit = async () => {
    if (words !== 25) {
      setError('Entry must be exactly 25 words.');
      return;
    }
    
    setLoading(true);
    try {
      const res = await api.post('/submissions/', {
        competition_id: competition?.id || 1,
        content: text
      });
      navigation.replace('EntryAccepted', { entryId: res.data.id });
    } catch (e) {
      setError('Failed to submit entry.');
    }
    setLoading(false);
  };

  return (
    <GradientBackground>
      <SafeAreaView style={GLOBAL_STYLES.container}>
        <KeyboardAvoidingView 
          style={styles.keyboardView} 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.content}>
            <Text style={styles.title}>Creative Hurdle</Text>
            <Text style={styles.subtitle}>In exactly 25 words, tell us why you should win this prize.</Text>
            
            <View style={GLOBAL_STYLES.glassCard}>
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
                placeholder="Start typing..."
                placeholderTextColor={COLORS.text.secondary}
                value={text}
                onChangeText={setText}
                contextMenuHidden={true} // Blocks paste natively on iOS and newer Androids
                autoCorrect={false}
              />
              
              <View style={styles.instructionBox}>
                <Text style={styles.instructionText}>
                  ⚠️ Paste functionality is disabled. Responses must be original and exactly 25 words.
                </Text>
              </View>
              
              {error ? <Text style={styles.errorText}>{error}</Text> : null}

              <TouchableOpacity 
                style={[styles.button, words !== 25 && styles.buttonDisabled]} 
                onPress={handleSubmit}
                disabled={words !== 25 || loading}
              >
                {loading ? (
                  <ActivityIndicator color={COLORS.text.primary} />
                ) : (
                  <Text style={styles.buttonText}>Submit Entry</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </GradientBackground>
  );
};

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
  },
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
    lineHeight: 22,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SIZES.base,
  },
  label: {
    color: COLORS.text.primary,
    fontWeight: 'bold',
  },
  wordCount: {
    color: COLORS.text.secondary,
  },
  textSuccess: {
    color: COLORS.feedback.success,
    fontWeight: 'bold',
  },
  textError: {
    color: COLORS.feedback.error,
    fontWeight: 'bold',
  },
  inputArea: {
    backgroundColor: COLORS.glass.input,
    borderColor: COLORS.glass.border,
    borderWidth: 1,
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    color: COLORS.text.primary,
    fontSize: 16,
    minHeight: 150,
    textAlignVertical: 'top',
  },
  instructionBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: SIZES.padding,
    borderRadius: SIZES.radius,
    marginTop: SIZES.padding,
  },
  instructionText: {
    color: COLORS.text.secondary,
    fontSize: 12,
    lineHeight: 18,
  },
  button: {
    backgroundColor: COLORS.primary.orangeStart,
    padding: SIZES.padding,
    borderRadius: SIZES.btnRadius,
    alignItems: 'center',
    marginTop: SIZES.padding * 2,
  },
  buttonDisabled: {
    backgroundColor: 'rgba(245, 158, 11, 0.4)',
  },
  buttonText: {
    color: COLORS.text.primary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorText: {
    color: COLORS.feedback.error,
    marginTop: SIZES.base,
    textAlign: 'center',
  }
});

export default CreativeSubmissionScreen;
