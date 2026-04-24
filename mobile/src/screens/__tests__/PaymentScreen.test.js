import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import PaymentScreen from '../PaymentScreen';
import { AppContext } from '../../context/AppContext';

// Mock navigation
const mockNavigation = {
  navigate: jest.fn(),
};

// Mock require for images
jest.mock('../../../assets/domain/prize_card.png', () => 1);

const renderPayment = (contextOverrides = {}) => {
  return render(
    <AppContext.Provider value={{ 
        processPayment: jest.fn(),
        competition: { entry_fee: 2.99 },
        ...contextOverrides 
    }}>
      <PaymentScreen navigation={mockNavigation} />
    </AppContext.Provider>
  );
};

describe('PaymentScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly', () => {
    const { getByText, getAllByText } = renderPayment();
    
    expect(getByText('Secure Checkout')).toBeTruthy();
    expect(getAllByText(/Pay \$2.99/)[0]).toBeTruthy();
  });

  it('handles successful payment', async () => {
    const mockProcessPayment = jest.fn().mockResolvedValue({ transactionId: 'TXN-123' });
    const { getByText, getAllByText } = renderPayment({ processPayment: mockProcessPayment });
    
    const payBtn = getAllByText('Pay $2.99')[0];
    
    await act(async () => {
      fireEvent.press(payBtn);
    });

    expect(mockProcessPayment).toHaveBeenCalledWith(2.99);
    expect(mockNavigation.navigate).toHaveBeenCalledWith('PaymentSuccess', { transactionId: 'TXN-123' });
  });

  it('handles payment failure', async () => {
    const mockProcessPayment = jest.fn().mockRejectedValue({ response: { data: { detail: 'Insufficient funds' } } });
    const { getByText, findByText, getAllByText } = renderPayment({ processPayment: mockProcessPayment });
    
    const payBtn = getAllByText('Pay $2.99')[0];
    
    await act(async () => {
      fireEvent.press(payBtn);
    });

    expect(await findByText('Insufficient funds')).toBeTruthy();
  });
});
