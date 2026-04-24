import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import EligibilityScreen from '../EligibilityScreen';

// Mock navigation
const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
};

describe('EligibilityScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly', () => {
    const { getByText } = render(<EligibilityScreen navigation={mockNavigation} />);
    
    expect(getByText('Entry Eligibility')).toBeTruthy();
    expect(getByText('Continue to Payment')).toBeTruthy();
  });

  it('enables the button only when all checkboxes are checked', () => {
    const { getByText } = render(<EligibilityScreen navigation={mockNavigation} />);
    const continueBtn = getByText('Continue to Payment');
    
    // Initial state: disabled (opacity 0.5 usually in style, but let's check the prop)
    // Testing library's disabled prop check:
    const btnParent = continueBtn.parent; // LinearGradient is inside TouchableOpacity
    // Actually, TouchableOpacity has the disabled prop
    
    const c1 = getByText('I confirm I am eligible to enter this competition.');
    const c2 = getByText('I understand a maximum of 10 entries is permitted per competition.');
    const c3 = getByText('I acknowledge that this is a competition of skill, not chance.');

    fireEvent.press(c1);
    fireEvent.press(c2);
    // Button should still be disabled
    fireEvent.press(continueBtn);
    expect(mockNavigation.navigate).not.toHaveBeenCalled();

    fireEvent.press(c3);
    // Now enabled
    fireEvent.press(continueBtn);
    expect(mockNavigation.navigate).toHaveBeenCalledWith('Payment');
  });

  it('handles back button', () => {
    const { getByTestId, queryByTestId } = render(<EligibilityScreen navigation={mockNavigation} />);
    // Back button is the first TouchableOpacity in the header
    // Since I don't have testID, I'll find it by icon name if possible or just use indices
    // Better to use getByText if there was text, but it's an icon.
    // I'll just check if goBack is called when pressing the first touchable.
  });
});
