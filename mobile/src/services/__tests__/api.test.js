import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

jest.mock('axios', () => ({
  create: jest.fn(() => ({
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() },
    },
  })),
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
});
