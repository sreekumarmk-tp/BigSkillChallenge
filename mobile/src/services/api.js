import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

import { Platform } from 'react-native';

const getExpoHost = () => {
  const hostUri =
    Constants.expoConfig?.hostUri ??
    Constants.expoGoConfig?.debuggerHost ??
    Constants.manifest2?.extra?.expoClient?.hostUri;

  if (!hostUri) {
    return null;
  }

  return hostUri.split(':')[0];
};

const envApiUrl = process.env.EXPO_PUBLIC_API_URL?.trim();
const expoHost = getExpoHost();
const DEFAULT_HOST = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';

// Prefer an explicit URL, otherwise use Expo host for physical devices and emulator loopback for Android emulator.
const resolvedHost = expoHost || DEFAULT_HOST;
const API_URL = envApiUrl || `http://${resolvedHost}:8000/api/v1`;

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('userToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
