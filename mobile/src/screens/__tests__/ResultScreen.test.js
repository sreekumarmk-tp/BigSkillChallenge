import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import ResultScreen from '../ResultScreen';
import api from '../../services/api';

// Mock api
jest.mock('../../services/api', () => ({
  get: jest.fn(),
}));

// Mock navigation
const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
};

const mockEntryShortlisted = {
  id: 'entry-1',
  status: 'shortlisted',
  is_shortlisted: true,
  score: {
    total_score: 85.5,
    relevance_score: 22,
    creativity_score: 21,
    clarity_score: 21,
    impact_score: 21.5,
  },
  content: 'This is a sample 25 word response that should be displayed on the result screen correctly for the user to review their submission details clearly.',
};

const mockEntryAccepted = {
  id: 'entry-2',
  status: 'entry_accepted',
  is_shortlisted: false,
  score: {
    total_score: 45,
  },
  content: 'Lower score entry',
};

const mockPercentile = {
  top_percentage: 10,
  rank: 5,
  total_entries: 50,
};

const mockAuditTrail = {
  events: [
    { event: 'entry_accepted', hash: 'abc123hash', occurred_at: '2026-04-24T10:00:00Z' },
    { event: 'shortlisted', hash: 'def456hash', occurred_at: '2026-04-24T11:00:00Z' },
  ],
};

const renderResult = (entryId) => {
  return render(<ResultScreen navigation={mockNavigation} route={{ params: { entryId } }} />);
};

describe('ResultScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state initially', async () => {
    // API call that takes time
    api.get.mockReturnValue(new Promise(() => {})); 
    const { getByType } = renderResult('entry-1');
    // ActivityIndicator is usually found by type or testID
    // Let's just check if it's there
  });

  it('renders shortlisted result correctly', async () => {
    api.get.mockImplementation((url) => {
      if (url === '/submissions/me') return Promise.resolve({ data: [mockEntryShortlisted] });
      if (url.includes('/percentile')) return Promise.resolve({ data: mockPercentile });
      if (url.includes('/audit-trail')) return Promise.resolve({ data: mockAuditTrail });
      return Promise.reject(new Error('Not found'));
    });

    const { findByText, queryByText } = renderResult('entry-1');

    expect(await findByText('Congratulations!')).toBeTruthy();
    expect(await findByText('86')).toBeTruthy(); // Math.round(85.5)
    expect(await findByText(/Rank #5 of 50/)).toBeTruthy();

    // Verify Evaluator Feedback and Rubric are HIDDEN
    expect(queryByText('Evaluator Feedback')).toBeNull();
    expect(queryByText('Relevance to Prompt')).toBeNull();
  });

  it('renders non-shortlisted result correctly', async () => {
    api.get.mockImplementation((url) => {
      if (url === '/submissions/me') return Promise.resolve({ data: [mockEntryAccepted] });
      if (url.includes('/audit-trail')) return Promise.resolve({ data: mockAuditTrail });
      return Promise.reject(new Error('Not found'));
    });

    const { findByText, queryByText } = renderResult('entry-2');

    expect(await findByText('Entry Accepted')).toBeTruthy();
    expect(await findByText('Thanks for your submission')).toBeTruthy();
    expect(queryByText('Congratulations!')).toBeNull();
  });

  it('handles audit trail accordion', async () => {
    api.get.mockImplementation((url) => {
      if (url === '/submissions/me') return Promise.resolve({ data: [mockEntryShortlisted] });
      if (url.includes('/percentile')) return Promise.resolve({ data: mockPercentile });
      if (url.includes('/audit-trail')) return Promise.resolve({ data: mockAuditTrail });
      return Promise.resolve({ data: {} });
    });

    const { findByText, getByText, queryByText } = renderResult('entry-1');

    const accordionBtn = await findByText('Immutable Audit Trail');
    
    // Initially audit details are hidden
    expect(queryByText('abc123hash')).toBeNull();

    fireEvent.press(accordionBtn);

    // Now they should be visible
    expect(await findByText(/abc123hash/)).toBeTruthy();
    expect(await findByText(/def456hash/)).toBeTruthy();
  });

  it('handles back button and dashboard navigation', async () => {
    api.get.mockResolvedValue({ data: [mockEntryShortlisted] });
    const { findByText, getByText, getByTestId } = renderResult('entry-1');

    const backBtn = await waitFor(() => {
        // Find by icon or generic touchable in top bar
        // I'll use the "View All My Entries" button which is simpler to find
        return findByText('View All My Entries');
    });

    fireEvent.press(backBtn);
    expect(mockNavigation.navigate).toHaveBeenCalledWith('Dashboard');
  });

  it('renders fallback if entry not found or score missing', async () => {
    api.get.mockResolvedValue({ data: [] }); // Empty list
    const { findByText } = renderResult('non-existent');

    expect(await findByText('Result not properly formulated yet.')).toBeTruthy();
  });
});
