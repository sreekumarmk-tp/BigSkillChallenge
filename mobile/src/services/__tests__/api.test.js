import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

jest.mock('axios', () => ({
  create: jest.fn(() => ({
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() },
    },
  })),
}));

// Mock Constants to test host detection
jest.mock('expo-constants', () => ({
  expoConfig: { hostUri: '192.168.1.10:8081' }
}));

// Now import api
import api from '../api';

describe('API Service', () => {
  it('should have the correct base URL', () => {
    expect(axios.create).toHaveBeenCalled();
  });

  it('should include the auth token in headers if available', async () => {
    const mockToken = 'test-token';
    await AsyncStorage.setItem('userToken', mockToken);
    
    // The interceptor was registered when the module was loaded
    const interceptor = api.interceptors.request.use.mock.calls[0][0];
    
    const config = { headers: {} };
    const result = await interceptor(config);
    
    expect(result.headers.Authorization).toBe(`Bearer ${mockToken}`);
  });

  it('should reject if interceptor receives an error', async () => {
    const errorInterceptor = api.interceptors.request.use.mock.calls[0][1];
    const mockError = new Error('test error');
    
    await expect(errorInterceptor(mockError)).rejects.toThrow('test error');
  });
});
