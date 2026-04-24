import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import QuizResultScreen from '../QuizResultScreen';

// Mock navigation
const mockNavigation = {
  navigate: jest.fn(),
  replace: jest.fn(),
};

// Mock require for images
jest.mock('../../../assets/domain/success_badge.png', () => 1);

const renderQuizResult = (params) => {
  return render(<QuizResultScreen navigation={mockNavigation} route={{ params }} />);
};

describe('QuizResultScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders success state correctly', () => {
    const { getByText } = renderQuizResult({ status: 'success', attempt_number: 1 });
    
    expect(getByText('AI Knowledge Match!')).toBeTruthy();
    expect(getByText('Begin Creative Submission')).toBeTruthy();
  });

  it('renders incorrect answer state correctly', () => {
    const { getByText } = renderQuizResult({ status: 'incorrect', attempt_number: 1 });
    
    expect(getByText('Incorrect Answer')).toBeTruthy();
    expect(getByText('New Attempt')).toBeTruthy();
  });

  it('renders timeout state correctly', () => {
    const { getByText } = renderQuizResult({ status: 'timeout', attempt_number: 1 });
    
    expect(getByText('Time Expired')).toBeTruthy();
  });

  it('renders limit reached state and auto-redirects', async () => {
    const { getByText } = renderQuizResult({ status: 'limit_reached', attempt_number: 10 });
    
    expect(getByText('Limit Reached')).toBeTruthy();
    expect(getByText(/Redirecting to dashboard/)).toBeTruthy();

    act(() => {
      jest.advanceTimersByTime(5000);
    });

    await waitFor(() => {
      expect(mockNavigation.navigate).toHaveBeenCalledWith('Dashboard');
    });
  });

  it('navigates to CreativeSubmission on success button press', () => {
    const { getByText } = renderQuizResult({ status: 'success', attempt_number: 1 });
    const btn = getByText('Begin Creative Submission');
    
    fireEvent.press(btn);
    expect(mockNavigation.navigate).toHaveBeenCalledWith('CreativeSubmission');
  });

  it('navigates to Eligibility on New Attempt button press', () => {
    const { getByText } = renderQuizResult({ status: 'incorrect', attempt_number: 1 });
    const btn = getByText('New Attempt');
    
    fireEvent.press(btn);
    expect(mockNavigation.replace).toHaveBeenCalledWith('Eligibility');
  });
});
