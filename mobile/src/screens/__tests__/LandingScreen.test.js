import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import LandingScreen from '../LandingScreen';
import { AppContext } from '../../context/AppContext';

// Mock vector icons
jest.mock('@expo/vector-icons', () => ({
  MaterialCommunityIcons: 'MaterialCommunityIcons',
}));

// Mock navigation
const mockNavigation = {
  navigate: jest.fn(),
};

// Mock require for images
jest.mock('../../../assets/domain/hero_bg.png', () => 1);
jest.mock('../../../assets/domain/prize_card.png', () => 1);

const renderLanding = (contextOverrides = {}) => {
  return render(
    <AppContext.Provider value={{ 
        userToken: null, 
        isEmailVerified: false, 
        competition: { end_date: '2026-12-31T23:59:59', entry_fee: 2.99 },
        ...contextOverrides 
    }}>
      <LandingScreen navigation={mockNavigation} />
    </AppContext.Provider>
  );
};

describe('LandingScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders landing content correctly', async () => {
    const { findByText, getByText } = renderLanding();
    
    // Use findByText to handle potential animation delay or split text
    expect(await findByText(/WIN A/)).toBeTruthy();
    expect(await findByText(/1-YEAR/)).toBeTruthy();
    expect(await findByText(/OPENAI SUBSCRIPTION/)).toBeTruthy();
    expect(getByText(/ENTER FOR \$ 2.99/)).toBeTruthy();
  });

  it('navigates to Dashboard if user is already logged in and verified', () => {
    renderLanding({ userToken: 'valid-token', isEmailVerified: true });
    
    expect(mockNavigation.navigate).toHaveBeenCalledWith('Dashboard');
  });

  it('navigates to Auth login mode when login button is pressed', () => {
    const { getByText } = renderLanding();
    const loginBtn = getByText('LOGIN');
    
    fireEvent.press(loginBtn);
    
    expect(mockNavigation.navigate).toHaveBeenCalledWith('Auth', { mode: 'login' });
  });

  it('navigates to Auth register mode when CTA is pressed', () => {
    const { getByText } = renderLanding();
    const ctaBtn = getByText('ENTER FOR $ 2.99');
    
    fireEvent.press(ctaBtn);
    
    expect(mockNavigation.navigate).toHaveBeenCalledWith('Auth');
  });

  it('formats entry fee correctly', () => {
    const { getByText } = renderLanding({ competition: { entry_fee: 5.5 } });
    expect(getByText('ENTER FOR $ 5.50')).toBeTruthy();
  });
});
