import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import CreativeSubmissionScreen from '../CreativeSubmissionScreen';
import { AppContext } from '../../context/AppContext';
import api from '../../services/api';

// Mock api
jest.mock('../../services/api', () => ({
  post: jest.fn(),
}));

// Mock navigation
const mockNavigation = {
  replace: jest.fn(),
};

const renderCreativeSubmission = (contextOverrides = {}) => {
  return render(
    <AppContext.Provider value={{ 
        competition: { id: 'comp-1' }, 
        deviceId: 'device-123',
        ...contextOverrides 
    }}>
      <CreativeSubmissionScreen navigation={mockNavigation} />
    </AppContext.Provider>
  );
};

describe('CreativeSubmissionScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders correctly with initial countdown', () => {
    const { getByText } = renderCreativeSubmission();
    
    expect(getByText('Creative Hurdle')).toBeTruthy();
    expect(getByText('60:00')).toBeTruthy();
  });

  it('updates word count and enables button only at 25 words', () => {
    const { getByPlaceholderText, getByText } = renderCreativeSubmission();
    const input = getByPlaceholderText('Share your vision for Agentic AI...');
    const submitBtn = getByText('Submit Entry');

    // Less than 25 words
    fireEvent.changeText(input, 'This is only eight words long right now.');
    expect(getByText('8 / 25 words')).toBeTruthy();
    
    // Exactly 25 words
    const exactText = 'one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen seventeen eighteen nineteen twenty twentyone twentytwo twentythree twentyfour twentyfive';
    fireEvent.changeText(input, exactText);
    expect(getByText('25 / 25 words')).toBeTruthy();
  });

  it('handles successful submission', async () => {
    api.post.mockResolvedValue({ data: { id: 'entry-999' } });
    const { getByPlaceholderText, getByText } = renderCreativeSubmission();
    
    const exactText = 'one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen seventeen eighteen nineteen twenty twentyone twentytwo twentythree twentyfour twentyfive';
    fireEvent.changeText(getByPlaceholderText('Share your vision for Agentic AI...'), exactText);
    
    await act(async () => {
      fireEvent.press(getByText('Submit Entry'));
    });

    expect(api.post).toHaveBeenCalledWith('/submissions/', {
      competition_id: 'comp-1',
      content: exactText,
      device_id: 'device-123'
    }, expect.any(Object));

    expect(mockNavigation.replace).toHaveBeenCalledWith('EntryAccepted', { entryId: 'entry-999' });
  });

  it('navigates to Dashboard if timer expires', () => {
    renderCreativeSubmission();
    
    act(() => {
      jest.advanceTimersByTime(3601000); // 60 mins + 1 sec
    });

    expect(mockNavigation.replace).toHaveBeenCalledWith('Dashboard');
  });

  it('shows error if API fails', async () => {
    api.post.mockRejectedValue({
      response: { data: { detail: 'Submission limit reached' } }
    });

    const { getByPlaceholderText, getByText } = renderCreativeSubmission();
    
    const exactText = 'one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen seventeen eighteen nineteen twenty twentyone twentytwo twentythree twentyfour twentyfive';
    fireEvent.changeText(getByPlaceholderText('Share your vision for Agentic AI...'), exactText);
    
    await act(async () => {
      fireEvent.press(getByText('Submit Entry'));
    });

    await waitFor(() => {
      expect(getByText('Submission limit reached')).toBeTruthy();
    });
  });
});
