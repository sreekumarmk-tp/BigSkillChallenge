import React, { useContext } from 'react';
import { render, waitFor, act, fireEvent } from '@testing-library/react-native';
import { AppContext, AppProvider } from '../AppContext';
import api from '../../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Text, Button, View } from 'react-native';

// Mock the API service
jest.mock('../../services/api', () => ({
  get: jest.fn(),
  post: jest.fn(),
  interceptors: {
    request: { use: jest.fn(), eject: jest.fn() },
    response: { use: jest.fn(), eject: jest.fn() },
  },
}));

// Mock Stripe Service
jest.mock('../../services/stripe', () => ({
  StripeSDK: {
    initStripe: jest.fn(),
  },
}));

jest.setTimeout(10000); // Increase timeout for core context tests

const TestConsumer = () => {
  const { 
    userToken, 
    login, 
    logout, 
    register, 
    competition, 
    deviceId,
    isLoading 
  } = useContext(AppContext);

  return (
    <View>
      <Text testID="token">{userToken || 'no-token'}</Text>
      <Text testID="loading">{isLoading ? 'loading' : 'idle'}</Text>
      <Text testID="deviceId">{deviceId || 'no-id'}</Text>
      <Text testID="compId">{competition?.id || 'no-comp'}</Text>
      <Button title="Login" onPress={() => login('test@test.com', 'password')} testID="login-btn" />
      <Button title="Logout" onPress={logout} testID="logout-btn" />
    </View>
  );
};

describe('AppContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Default mocks for initialization
    api.get.mockResolvedValue({ data: [] });
    AsyncStorage.getItem.mockImplementation((key) => {
        if (key === 'deviceId') return Promise.resolve('test-device-id');
        return Promise.resolve(null);
    });
    AsyncStorage.setItem.mockResolvedValue(null);
    AsyncStorage.removeItem.mockResolvedValue(null);
  });

  it('initializes with default values and fetches competition', async () => {
    api.get.mockResolvedValueOnce({ data: [{ id: 'comp-123', title: 'Test Competition' }] });

    const { getByTestId } = render(
      <AppProvider>
        <TestConsumer />
      </AppProvider>
    );

    await waitFor(() => {
      expect(getByTestId('deviceId').props.children).toBe('test-device-id');
    }, { timeout: 3000 });

    await waitFor(() => {
      expect(getByTestId('compId').props.children).toBe('comp-123');
    }, { timeout: 3000 });

    expect(api.get).toHaveBeenCalledWith('/competitions/');
  });

  it('handles login successfully', async () => {
    api.post.mockResolvedValueOnce({ data: { access_token: 'fake-jwt-token' } });
    
    const { getByTestId } = render(
      <AppProvider>
        <TestConsumer />
      </AppProvider>
    );

    // Wait for initial load to finish
    await waitFor(() => {
      expect(getByTestId('loading').props.children).toBe('idle');
    });

    const loginBtn = getByTestId('login-btn');
    
    await act(async () => {
      fireEvent.press(loginBtn);
    });

    expect(api.post).toHaveBeenCalled();

    await waitFor(() => {
      expect(getByTestId('token').props.children).toBe('fake-jwt-token');
    });

    expect(AsyncStorage.setItem).toHaveBeenCalledWith('userToken', 'fake-jwt-token');
  });

  it('handles logout', async () => {
    AsyncStorage.getItem.mockImplementation((key) => {
        if (key === 'userToken') return Promise.resolve('existing-token');
        return Promise.resolve(null);
    });
    
    const { getByTestId } = render(
      <AppProvider>
        <TestConsumer />
      </AppProvider>
    );

    // Wait for initial load
    await waitFor(() => {
      expect(getByTestId('token').props.children).toBe('existing-token');
    });

    const logoutBtn = getByTestId('logout-btn');
    
    await act(async () => {
      fireEvent.press(logoutBtn);
    });

    await waitFor(() => {
        expect(getByTestId('token').props.children).toBe('no-token');
    });
    expect(AsyncStorage.removeItem).toHaveBeenCalledWith('userToken');
  });

  it('handles registration', async () => {
    api.post.mockResolvedValueOnce({ 
      data: { 
        access_token: 'reg-token',
        is_active: true 
      } 
    });

    let contextValue;
    const GrabContext = () => {
      contextValue = useContext(AppContext);
      return <Text testID="token-grab">{contextValue.userToken || 'none'}</Text>;
    };

    const { getByTestId } = render(
      <AppProvider>
        <GrabContext />
      </AppProvider>
    );

    // Wait for initial load
    await waitFor(() => {
        // We can't see loading in GrabContext easily without adding it, 
        // but we can assume it's done if we wait a bit or use TestConsumer
    });

    await act(async () => {
      await contextValue.register('new@test.com', 'pass', 'John', 'Doe');
    });

    await waitFor(() => {
        expect(getByTestId('token-grab').props.children).toBe('reg-token');
    });
    expect(AsyncStorage.setItem).toHaveBeenCalledWith('userToken', 'reg-token');
  });

  it('handles processPayment in mock mode', async () => {
    api.get.mockResolvedValue({ data: [{ id: 'comp-1' }] });
    api.post.mockResolvedValueOnce({ 
      data: { 
        client_secret: 'mock_secret',
        publishable_key: 'mock_pk',
        payment_record_id: 'pay-123'
      } 
    });

    let contextValue;
    const GrabContext = () => {
      contextValue = useContext(AppContext);
      return <Text testID="pay-status">{contextValue.paymentStatus ? 'paid' : 'unpaid'}</Text>;
    };

    const { getByTestId } = render(
      <AppProvider>
        <GrabContext />
      </AppProvider>
    );

    // Wait for competition to be set from the initial load
    await waitFor(() => {
        expect(contextValue.competition).not.toBeNull();
    });

    await act(async () => {
      const result = await contextValue.processPayment(100);
      expect(result.transactionId).toBe('pay-123');
    });

    await waitFor(() => {
        expect(getByTestId('pay-status').props.children).toBe('paid');
    });
  });


  it('handles quiz methods', async () => {
    api.post.mockResolvedValue({ data: { success: true } });

    let contextValue;
    const GrabContext = () => {
      contextValue = useContext(AppContext);
      return null;
    };

    render(
      <AppProvider>
        <GrabContext />
      </AppProvider>
    );

    await act(async () => {
      await contextValue.startQuiz('comp-1');
      await contextValue.evaluateAnswer('att-1', 'q-1', 'ans');
      await contextValue.submitQuiz('att-1', []);
    });

    expect(api.post).toHaveBeenCalledWith('/quiz/start', { competition_id: 'comp-1' });
    expect(api.post).toHaveBeenCalledWith('/quiz/evaluate-answer', expect.any(Object));
    expect(api.post).toHaveBeenCalledWith('/quiz/submit', expect.any(Object));
  });

  it('handles quiz method errors', async () => {
    api.post.mockRejectedValue(new Error('API Error'));

    let contextValue;
    const GrabContext = () => {
      contextValue = useContext(AppContext);
      return null;
    };

    render(
      <AppProvider>
        <GrabContext />
      </AppProvider>
    );

    await expect(contextValue.startQuiz('comp-1')).rejects.toThrow('API Error');
    await expect(contextValue.evaluateAnswer('att-1', 'q-1', 'ans')).rejects.toThrow('API Error');
    await expect(contextValue.submitQuiz('att-1', [])).rejects.toThrow('API Error');
  });
});



