import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import EntryAcceptedScreen from '../EntryAcceptedScreen';

// Mock navigation
const mockNavigation = {
  navigate: jest.fn(),
};

describe('EntryAcceptedScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with entry ID', () => {
    const { getAllByText, getByText } = render(
      <EntryAcceptedScreen 
        navigation={mockNavigation} 
        route={{ params: { entryId: 'abc-123' } }} 
      />
    );
    
    expect(getAllByText('Entry Accepted!').length).toBeGreaterThan(0);
    // Entry reference should contain part of the ID
    expect(getByText(/TBSC-2026-ABC123/)).toBeTruthy();
  });

  it('navigates back to Dashboard on button press', () => {
    const { getByText } = render(
      <EntryAcceptedScreen 
        navigation={mockNavigation} 
        route={{ params: { entryId: 'abc-123' } }} 
      />
    );
    
    const btn = getByText('Return to Dashboard');
    fireEvent.press(btn);
    
    expect(mockNavigation.navigate).toHaveBeenCalledWith('Dashboard');
  });
});
