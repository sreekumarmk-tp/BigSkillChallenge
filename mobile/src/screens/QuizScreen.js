import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { AppContext } from '../context/AppContext';
import ScreenShell from '../components/ScreenShell';
import AppFooter from '../components/AppFooter';
import { NEON_CYAN, CARD_BG, TEXT_MUTED, SCREEN_PADDING_H, PREMIUM_GOLD, getTextShadow } from '../theme/neonTheme';

const QuizScreen = ({ navigation }) => {
  const { competition, startQuiz, evaluateAnswer, submitQuiz, setQuizPassed } = useContext(AppContext);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [attemptId, setAttemptId] = useState(null);
  const [attemptNumber, setAttemptNumber] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        if (!competition) return;
        const data = await startQuiz(competition.id);
        setQuestions(data.questions);
        setAttemptId(data.attempt_id);
        setAttemptNumber(data.attempt_number);
        setLoading(false);
      } catch (e) {
        console.log(e);
        if (e.response && e.response.data && e.response.data.detail === 'Maximum 10 attempts reached') {
          navigation.replace('QuizResult', { status: 'limit_reached' });
        } else {
          navigation.replace('Dashboard');
        }
      }
    };
    fetchQuestions();
  }, [competition]);

  useEffect(() => {
    if (loading || questions.length === 0) return;

    if (timeLeft === 0) {
      navigation.replace('QuizResult', { status: 'timeout', attempt_number: attemptNumber });
      return;
    }
    const timerId = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timerId);
  }, [timeLeft, loading, questions, navigation]);

  const handleAnswer = async (selectedOption) => {
    const currentQuestion = questions[currentQuestionIdx];

    try {
      setLoading(true);
      const evalResult = await evaluateAnswer(attemptId, currentQuestion.id, selectedOption);

      if (!evalResult.is_correct) {
        navigation.replace('QuizResult', { status: 'incorrect', attempt_number: attemptNumber });
        return;
      }

      if (currentQuestionIdx < questions.length - 1) {
        setCurrentQuestionIdx((prev) => prev + 1);
        setTimeLeft(30);
        setLoading(false);
      } else {
        const result = await submitQuiz(attemptId, []);
        if (result.status === 'passed') {
          setQuizPassed(true);
          navigation.replace('QuizResult', { status: 'success', attempt_number: attemptNumber });
        } else {
          navigation.replace('QuizResult', { status: 'incorrect', attempt_number: attemptNumber });
        }
      }
    } catch (e) {
      console.log(e);
      navigation.replace('Dashboard');
    }
  };

  if (loading && questions.length === 0) {
    return (
      <ScreenShell>
        <View style={styles.centerContent}>
          <Text style={styles.question}>Loading your challenge...</Text>
        </View>
      </ScreenShell>
    );
  }

  const currentQuestion = questions[currentQuestionIdx];

  return (
    <ScreenShell>
      <ScrollView contentContainerStyle={styles.scrollContent} bounces={false}>
        <Text style={[styles.timer, styles.textShadowed]}>{timeLeft}s</Text>
        <View style={styles.progressBarBg}>
          <View style={[styles.progressBarFill, { width: `${(timeLeft / 30) * 100}%` }]} />
        </View>

        <Text style={[styles.questionCount, styles.textShadowed]}>
          Question {currentQuestionIdx + 1} of {questions.length}
        </Text>
        <Text style={[styles.question, styles.textShadowed]}>{currentQuestion.text}</Text>

        <View style={styles.optionsContainer}>
          {['A', 'B', 'C', 'D'].map((opt) => (
            <TouchableOpacity key={opt} style={styles.optionButton} onPress={() => handleAnswer(opt)} activeOpacity={0.85}>
              <Text style={styles.optionText}>
                {opt}) {currentQuestion[`option_${opt.toLowerCase()}`]}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <AppFooter />
      </ScrollView>
    </ScreenShell>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: SCREEN_PADDING_H,
    paddingTop: 24,
    paddingBottom: 40,
    alignItems: 'center',
  },
  centerContent: {
    flex: 1,
    paddingHorizontal: SCREEN_PADDING_H,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timer: {
    fontSize: 48,
    color: NEON_CYAN,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  progressBarBg: {
    width: '100%',
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 4,
    marginBottom: 24,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: NEON_CYAN,
  },
  questionCount: {
    color: PREMIUM_GOLD,
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  question: {
    fontSize: 18,
    color: '#FFF',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 26,
    fontWeight: '600',
  },
  optionsContainer: {
    width: '100%',
  },
  optionButton: {
    backgroundColor: CARD_BG,
    borderColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  optionText: {
    color: TEXT_MUTED,
    fontSize: 15,
    lineHeight: 22,
  },
  textShadowed: {
    ...getTextShadow(0.6, 6),
  },
});

export default QuizScreen;
