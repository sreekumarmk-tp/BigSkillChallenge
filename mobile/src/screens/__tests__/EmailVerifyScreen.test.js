import React from 'react';
import { render, fireEvent, waitFor, act, screen } from '@testing-library/react-native';
import EmailVerifyScreen from '../EmailVerifyScreen';
import { AppContext } from '../../context/AppContext';
import api from '../../services/api';

// Mock api
jest.mock('../../services/api', () => ({
  post: jest.fn(),
}));

// Mock navigation
const mockNavigation = {
  navigate: jest.fn(),
};

const renderEmailVerify = (contextOverrides = {}) => {
  return render(
    <AppContext.Provider value={{ 
        markEmailVerified: jest.fn(),
        ...contextOverrides 
    }}>
      <EmailVerifyScreen navigation={mockNavigation} />
    </AppContext.Provider>
  );
};

describe('EmailVerifyScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly', () => {
    renderEmailVerify();
    expect(screen.getByText('Verify Email')).toBeTruthy();
    expect(screen.getByPlaceholderText('000000')).toBeTruthy();
  });

  it('disables Verify button if OTP is less than 6 digits', () => {
    renderEmailVerify();
    const input = screen.getByPlaceholderText('000000');
    const verifyBtn = screen.getByTestId('verify-button');

    fireEvent.changeText(input, '123');
    expect(verifyBtn.props.accessibilityState.disabled).toBe(true);
  });

  it('handles successful verification', async () => {
    api.post.mockResolvedValue({ data: { success: true } });
    const mockMarkEmailVerified = jest.fn();
    renderEmailVerify({ markEmailVerified: mockMarkEmailVerified });
    
    const input = screen.getByPlaceholderText('000000');
    fireEvent.changeText(input, '123456');
    
    await act(async () => {
      fireEvent.press(screen.getByText('Verify'));
    });

    expect(api.post).toHaveBeenCalledWith('/auth/verify-email', { otp: '123456' });
    expect(mockMarkEmailVerified).toHaveBeenCalled();
    expect(mockNavigation.navigate).toHaveBeenCalledWith('Eligibility');
  });

  it('handles invalid OTP error from API', async () => {
    api.post.mockRejectedValue(new Error('Invalid OTP'));
    renderEmailVerify();
    
    const input = screen.getByPlaceholderText('000000');
    fireEvent.changeText(input, '111111');
    
    await act(async () => {
      fireEvent.press(screen.getByText('Verify'));
    });

    expect(await screen.findByText('Invalid verification code.')).toBeTruthy();
  });
});
