import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import PaymentSuccessScreen from '../PaymentSuccessScreen';
import { AppContext } from '../../context/AppContext';

// Mock navigation
const mockNavigation = {
  navigate: jest.fn(),
  replace: jest.fn(),
};

const renderPaymentSuccess = (contextOverrides = {}, routeParams = {}) => {
  return render(
    <AppContext.Provider value={{ 
        paymentStatus: true,
        setPaymentStatus: jest.fn(),
        ...contextOverrides 
    }}>
      <PaymentSuccessScreen navigation={mockNavigation} route={{ params: routeParams }} />
    </AppContext.Provider>
  );
};

describe('PaymentSuccessScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with transaction ID', () => {
    const { getByText } = renderPaymentSuccess({}, { transactionId: 'TXN-999' });
    
    expect(getByText('Payment Successful')).toBeTruthy();
    expect(getByText('Reference: TXN-999')).toBeTruthy();
  });

  it('redirects to Payment if paymentStatus is false', () => {
    renderPaymentSuccess({ paymentStatus: false });
    
    expect(mockNavigation.replace).toHaveBeenCalledWith('Payment');
  });

  it('consumes paymentStatus on mount', () => {
    const mockSetPaymentStatus = jest.fn();
    renderPaymentSuccess({ setPaymentStatus: mockSetPaymentStatus });
    
    expect(mockSetPaymentStatus).toHaveBeenCalledWith(false);
  });

  it('navigates to Quiz on button press', () => {
    const { getByText } = renderPaymentSuccess();
    const btn = getByText('Start Quiz');
    
    fireEvent.press(btn);
    expect(mockNavigation.navigate).toHaveBeenCalledWith('Quiz');
  });
});
