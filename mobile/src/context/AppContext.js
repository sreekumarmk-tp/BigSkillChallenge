import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [userToken, setUserToken] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [competition, setCompetition] = useState(null);
  const [quizPassed, setQuizPassed] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(false);

  useEffect(() => {
    isLoggedIn();
    fetchActiveCompetition();
  }, []);

  const isLoggedIn = async () => {
    try {
      setIsLoading(true);
      let token = await AsyncStorage.getItem('userToken');
      setUserToken(token);
      setIsLoading(false);
    } catch (e) {
      console.log(`isLoggedIn error ${e}`);
    }
  };

  const fetchActiveCompetition = async () => {
    try {
      const response = await api.get('/competitions/');
      if (response.data && response.data.length > 0) {
        // Assume first active competition is the one for MVP
        setCompetition(response.data[0]);
      }
    } catch (e) {
      console.log(`fetchCompetition error ${e}`);
    }
  };

  const login = async (email, password) => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('username', email);
      formData.append('password', password);
      
      const response = await api.post('/auth/login', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      const token = response.data.access_token;
      setUserToken(token);
      await AsyncStorage.setItem('userToken', token);
    } catch (e) {
      console.log(`login error ${e}`);
      throw e;
    }
    setIsLoading(false);
  };

  const logout = async () => {
    setIsLoading(true);
    setUserToken(null);
    await AsyncStorage.removeItem('userToken');
    setIsLoading(false);
  };
  
  const processPayment = async (amount) => {
      try {
          if (!competition) return;
          const res = await api.post('/payments/', {
              competition_id: competition.id,
              amount: amount
          });
          if (res.data.status === 'completed') {
              setPaymentStatus(true);
              return res.data;
          }
      } catch (e) {
          throw e;
      }
  }

  return (
    <AppContext.Provider
      value={{
        login,
        logout,
        processPayment,
        isLoading,
        userToken,
        userInfo,
        competition,
        quizPassed,
        setQuizPassed,
        paymentStatus,
        setPaymentStatus
      }}>
      {children}
    </AppContext.Provider>
  );
};
