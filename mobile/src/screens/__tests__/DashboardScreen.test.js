import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import DashboardScreen from '../DashboardScreen';
import { AppContext } from '../../context/AppContext';
import api from '../../services/api';

// Mock api
jest.mock('../../services/api', () => ({
  get: jest.fn(),
}));

// Mock navigation
const mockNavigation = {
  navigate: jest.fn(),
  addListener: jest.fn((event, callback) => {
    if (event === 'focus') {
      // In a real test we might want to trigger this, but for now we just return a no-op unsubscribe
      return () => {};
    }
  }),
  reset: jest.fn(),
};

const mockLogout = jest.fn();
const mockCompetition = { id: 'comp-1', title: 'AI Challenge' };

const mockEntries = [
  { id: 'entry-1', content: 'This is a test entry with exactly twenty five words to make sure the word count logic works correctly in the dashboard screen test.', competition_id: 'comp-1', created_at: '2024-01-01' }
];
const mockAttempts = [
  { id: 'att-1', attempt_number: 1, status: 'passed', score: 4, competition_id: 'comp-1', created_at: '2024-01-01' }
];
const mockPayments = [
  { id: 'pay-1', status: 'completed', competition_id: 'comp-1' }
];

const renderDashboard = (contextOverrides = {}) => {
  return render(
    <AppContext.Provider value={{ logout: mockLogout, competition: mockCompetition, ...contextOverrides }}>
      <DashboardScreen navigation={mockNavigation} />
    </AppContext.Provider>
  );
};

describe('DashboardScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    api.get.mockImplementation((url) => {
      if (url === '/submissions/me') return Promise.resolve({ data: mockEntries });
      if (url === '/payments/me') return Promise.resolve({ data: mockPayments });
      if (url === '/quiz/attempts-all/me') return Promise.resolve({ data: mockAttempts });
      return Promise.resolve({ data: [] });
    });
  });

  it('renders dashboard with stats', async () => {
    const { getByText } = renderDashboard();

    await waitFor(() => {
      expect(getByText('1')).toBeTruthy(); // Attempts Done
    });
    expect(getByText('9')).toBeTruthy(); // Attempts Remaining (10 - 1)
    expect(getByText('1')).toBeTruthy(); // Successful Entries
  });

  it('handles logout', async () => {
    const { getByText } = renderDashboard();
    
    await waitFor(() => getByText('Logout'));
    const logoutBtn = getByText('Logout');

    await act(async () => {
      fireEvent.press(logoutBtn);
    });

    expect(mockLogout).toHaveBeenCalled();
    expect(mockNavigation.reset).toHaveBeenCalledWith({
      index: 0,
      routes: [{ name: 'Landing' }],
    });
  });

  it('navigates to Eligibility when starting a new challenge', async () => {
    const { getByText } = renderDashboard();
    
    await waitFor(() => getByText('+ START NEW AI CHALLENGE'));
    const startBtn = getByText('+ START NEW AI CHALLENGE');

    fireEvent.press(startBtn);

    expect(mockNavigation.navigate).toHaveBeenCalledWith('Eligibility');
  });

  it('shows notification for pending creative submission', async () => {
    // Mock scenario: 1 passed attempt but 0 entries
    api.get.mockImplementation((url) => {
        if (url === '/submissions/me') return Promise.resolve({ data: [] });
        if (url === '/payments/me') return Promise.resolve({ data: mockPayments });
        if (url === '/quiz/attempts-all/me') return Promise.resolve({ data: mockAttempts });
        return Promise.resolve({ data: [] });
    });

    const { getByText } = renderDashboard();

    await waitFor(() => {
      expect(getByText('Creative Submission Pending')).toBeTruthy();
    });

    fireEvent.press(getByText('Resume Submission'));
    expect(mockNavigation.navigate).toHaveBeenCalledWith('CreativeSubmission');
  });

  it('shows notification for paid but not started quiz', async () => {
    // Mock scenario: 1 payment but 0 attempts
    api.get.mockImplementation((url) => {
        if (url === '/submissions/me') return Promise.resolve({ data: [] });
        if (url === '/payments/me') return Promise.resolve({ data: mockPayments });
        if (url === '/quiz/attempts-all/me') return Promise.resolve({ data: [] });
        return Promise.resolve({ data: [] });
    });

    const { getByText } = renderDashboard();

    await waitFor(() => {
      expect(getByText('Quiz Pending')).toBeTruthy();
    });

    fireEvent.press(getByText('Start Quiz'));
    expect(mockNavigation.navigate).toHaveBeenCalledWith('Quiz');
  });
});
