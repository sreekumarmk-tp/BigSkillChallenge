import React from 'react';
import { render } from '@testing-library/react-native';
import AppFooter from '../AppFooter';

describe('AppFooter', () => {
  it('renders correctly', () => {
    const { getByText } = render(<AppFooter />);
    
    // Check if the logo text is present
    expect(getByText(/BIG/)).toBeTruthy();
    expect(getByText(/AI CHALLENGE/)).toBeTruthy();
    
    // Check if the copyright is present
    expect(getByText(/© 2026. PURE SKILL ONLY./)).toBeTruthy();
  });
});
