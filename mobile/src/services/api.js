import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// In an actual build, use your machine IP or environment variable here
const API_URL = 'http://10.0.2.2:8000/api/v1'; 

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
