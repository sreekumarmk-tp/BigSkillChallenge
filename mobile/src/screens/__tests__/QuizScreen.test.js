import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import QuizScreen from '../QuizScreen';
import { AppContext } from '../../context/AppContext';

// Mock navigation
const mockNavigation = {
  replace: jest.fn(),
};

const mockStartQuiz = jest.fn();
const mockEvaluateAnswer = jest.fn();
const mockSubmitQuiz = jest.fn();
const mockSetQuizPassed = jest.fn();

const mockQuestions = [
  { id: 'q1', text: 'What is 1+1?', option_a: '1', option_b: '2', option_c: '3', option_d: '4' },
  { id: 'q2', text: 'What is 2+2?', option_a: '2', option_b: '3', option_c: '4', option_d: '5' },
];

jest.setTimeout(10000);

const renderQuiz = (contextOverrides = {}) => {
  return render(
    <AppContext.Provider value={{ 
        competition: { id: 'comp-1' }, 
        startQuiz: mockStartQuiz, 
        evaluateAnswer: mockEvaluateAnswer, 
        submitQuiz: mockSubmitQuiz,
        setQuizPassed: mockSetQuizPassed,
        ...contextOverrides 
    }}>
      <QuizScreen navigation={mockNavigation} />
    </AppContext.Provider>
  );
};

describe('QuizScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    mockStartQuiz.mockResolvedValue({
      questions: mockQuestions,
      attempt_id: 'att-123',
      attempt_number: 1,
    });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('loads and displays the first question', async () => {
    const { getByText } = renderQuiz();

    await waitFor(() => {
      expect(getByText('Question 1 of 2')).toBeTruthy();
      expect(getByText('What is 1+1?')).toBeTruthy();
    }, { timeout: 5000 });
  });

  it('handles correct answer and moves to next question', async () => {
    mockEvaluateAnswer.mockResolvedValue({ is_correct: true });
    const { getByText } = renderQuiz();

    await waitFor(() => getByText('B) 2'), { timeout: 5000 });
    
    await act(async () => {
      fireEvent.press(getByText('B) 2'));
    });

    expect(mockEvaluateAnswer).toHaveBeenCalledWith('att-123', 'q1', 'B');
    
    await waitFor(() => {
      expect(getByText('Question 2 of 2')).toBeTruthy();
      expect(getByText('What is 2+2?')).toBeTruthy();
    });
  });

  it('handles incorrect answer and navigates to QuizResult', async () => {
    mockEvaluateAnswer.mockResolvedValue({ is_correct: false });
    const { getByText } = renderQuiz();

    await waitFor(() => getByText('A) 1'), { timeout: 5000 });
    
    await act(async () => {
      fireEvent.press(getByText('A) 1'));
    });

    expect(mockNavigation.replace).toHaveBeenCalledWith('QuizResult', { 
        status: 'incorrect', 
        attempt_number: 1 
    });
  });

  it('completes quiz successfully', async () => {
    mockEvaluateAnswer.mockResolvedValue({ is_correct: true });
    mockSubmitQuiz.mockResolvedValue({ status: 'passed' });
    
    const { getByText } = renderQuiz();

    await waitFor(() => getByText('B) 2'), { timeout: 5000 });
    await act(async () => { fireEvent.press(getByText('B) 2')); });

    await waitFor(() => getByText('C) 4'), { timeout: 5000 });
    await act(async () => { fireEvent.press(getByText('C) 4')); });

    await waitFor(() => {
        expect(mockSubmitQuiz).toHaveBeenCalledWith('att-123', []);
        expect(mockSetQuizPassed).toHaveBeenCalledWith(true);
        expect(mockNavigation.replace).toHaveBeenCalledWith('QuizResult', { 
            status: 'success', 
            attempt_number: 1 
        });
    });
  });

  it('handles timer timeout', async () => {
    const { getByText } = renderQuiz();

    await waitFor(() => getByText('30s'), { timeout: 5000 });

    act(() => {
      jest.advanceTimersByTime(30000);
    });

    await waitFor(() => {
        expect(mockNavigation.replace).toHaveBeenCalledWith('QuizResult', { 
            status: 'timeout', 
            attempt_number: 1 
        });
    });
  });

  it('handles maximum attempts error', async () => {
    mockStartQuiz.mockRejectedValue({
      response: { data: { detail: 'Maximum 10 attempts reached' } }
    });

    renderQuiz();

    await waitFor(() => {
      expect(mockNavigation.replace).toHaveBeenCalledWith('QuizResult', { status: 'limit_reached' });
    }, { timeout: 5000 });
  });
});

