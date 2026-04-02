import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppContext } from '../context/AppContext';
import GradientBackground from '../components/GradientBackground';
import { COLORS, SIZES, GLOBAL_STYLES } from '../theme/constants';

const QuizScreen = ({ navigation }) => {
  const { setQuizPassed } = useContext(AppContext);
  const [timeLeft, setTimeLeft] = useState(30);

  useEffect(() => {
    if (timeLeft === 0) {
      navigation.replace('QuizResult', { status: 'timeout' });
      return;
    }
    const timerId = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timerId);
  }, [timeLeft, navigation]);

  const handleAnswer = (isCorrect) => {
    if (isCorrect) {
      setQuizPassed(true);
      navigation.replace('QuizResult', { status: 'success' });
    } else {
      navigation.replace('QuizResult', { status: 'incorrect' });
    }
  };

  return (
    <GradientBackground>
      <SafeAreaView style={GLOBAL_STYLES.container}>
        <View style={styles.content}>
          <Text style={styles.timer}>{timeLeft}s</Text>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${(timeLeft / 30) * 100}%` }]} />
          </View>
          
          <Text style={styles.question}>
            If a car travels at 60 km/h, how far will it travel in 45 minutes?
          </Text>

          <View style={styles.optionsContainer}>
            <TouchableOpacity style={styles.optionButton} onPress={() => handleAnswer(false)}>
              <Text style={styles.optionText}>A) 30 km</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.optionButton} onPress={() => handleAnswer(false)}>
              <Text style={styles.optionText}>B) 40 km</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.optionButton} onPress={() => handleAnswer(true)}>
              <Text style={styles.optionText}>C) 45 km</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.optionButton} onPress={() => handleAnswer(false)}>
              <Text style={styles.optionText}>D) 60 km</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </GradientBackground>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
    padding: SIZES.padding * 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timer: {
    fontSize: 48,
    color: COLORS.primary.orangeStart,
    fontWeight: 'bold',
    marginBottom: SIZES.base,
  },
  progressBarBg: {
    width: '100%',
    height: 8,
    backgroundColor: COLORS.glass.input,
    borderRadius: 4,
    marginBottom: SIZES.padding * 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: COLORS.primary.orangeStart,
  },
  question: {
    fontSize: 22,
    color: COLORS.text.primary,
    textAlign: 'center',
    marginBottom: SIZES.padding * 3,
    lineHeight: 30,
  },
  optionsContainer: {
    width: '100%',
  },
  optionButton: {
    backgroundColor: COLORS.glass.bg,
    borderColor: COLORS.glass.border,
    borderWidth: 1,
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    marginBottom: SIZES.padding,
  },
  optionText: {
    color: COLORS.text.primary,
    fontSize: 18,
  }
});

export default QuizScreen;
