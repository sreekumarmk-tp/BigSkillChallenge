import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppContext } from '../context/AppContext';
import GradientBackground from '../components/GradientBackground';
import { COLORS, SIZES, GLOBAL_STYLES } from '../theme/constants';

const QuizScreen = ({ navigation }) => {
  const { competition, startQuiz, evaluateAnswer, submitQuiz, setQuizPassed } = useContext(AppContext);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [attemptId, setAttemptId] = useState(null);
  const [timeLeft, setTimeLeft] = useState(30);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        if (!competition) return;
        const data = await startQuiz(competition.id);
        setQuestions(data.questions);
        setAttemptId(data.attempt_id);
        setLoading(false);
      } catch (e) {
        console.log(e);
        if (e.response && e.response.data && e.response.data.detail === "Maximum 10 attempts reached") {
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
      navigation.replace('QuizResult', { status: 'timeout' });
      return;
    }
    const timerId = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timerId);
  }, [timeLeft, loading, questions, navigation]);

  const handleAnswer = async (selectedOption) => {
    const currentQuestion = questions[currentQuestionIdx];
    
    try {
      setLoading(true);
      const evalResult = await evaluateAnswer(attemptId, currentQuestion.id, selectedOption);
      
      if (!evalResult.is_correct) {
        navigation.replace('QuizResult', { status: 'incorrect' });
        return;
      }

      if (currentQuestionIdx < questions.length - 1) {
        setCurrentQuestionIdx(prev => prev + 1);
        setTimeLeft(30);
        setLoading(false);
      } else {
        const result = await submitQuiz(attemptId, []); // Answers already evaluated
        if (result.status === 'passed') {
          setQuizPassed(true);
          navigation.replace('QuizResult', { status: 'success' });
        } else {
          navigation.replace('QuizResult', { status: 'incorrect' });
        }
      }
    } catch (e) {
      console.log(e);
      navigation.replace('Dashboard');
    }
  };

  if (loading) {
    return (
      <GradientBackground>
        <SafeAreaView style={GLOBAL_STYLES.container}>
          <View style={styles.content}>
            <Text style={styles.question}>Loading your challenge...</Text>
          </View>
        </SafeAreaView>
      </GradientBackground>
    );
  }

  const currentQuestion = questions[currentQuestionIdx];

  return (
    <GradientBackground>
      <SafeAreaView style={GLOBAL_STYLES.container}>
        <View style={styles.content}>
          <Text style={styles.timer}>{timeLeft}s</Text>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${(timeLeft / 30) * 100}%` }]} />
          </View>
          
          <Text style={styles.questionCount}>Question {currentQuestionIdx + 1} of {questions.length}</Text>
          <Text style={styles.question}>
            {currentQuestion.text}
          </Text>

          <View style={styles.optionsContainer}>
            {['A', 'B', 'C', 'D'].map((opt) => (
               <TouchableOpacity 
                key={opt}
                style={styles.optionButton} 
                onPress={() => handleAnswer(opt)}
               >
                <Text style={styles.optionText}>
                    {opt}) {currentQuestion[`option_${opt.toLowerCase()}`]}
                </Text>
              </TouchableOpacity>
            ))}
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
  questionCount: {
    color: COLORS.primary.orangeStart,
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: SIZES.base,
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
