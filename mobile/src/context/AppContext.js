import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [userToken, setUserToken] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [isEmailVerified, setIsEmailVerified] = useState(true);
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
      const emailVerified = await AsyncStorage.getItem('isEmailVerified');
      setUserToken(token);
      // Backward compatibility for existing sessions that predate this key.
      setIsEmailVerified(emailVerified === null ? true : emailVerified === 'true');
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
      setIsEmailVerified(true);
      await AsyncStorage.setItem('userToken', token);
      await AsyncStorage.setItem('isEmailVerified', 'true');
    } catch (e) {
      console.log(`login error ${e}`);
      throw e;
    }
    setIsLoading(false);
  };

  const register = async (email, password, firstName, lastName) => {
    setIsLoading(true);
    try {
      const response = await api.post('/auth/register', {
          email,
          password,
          first_name: firstName,
          last_name: lastName
      });
      const token = response.data.access_token;
      const emailVerified = response.data.is_active ?? false;
      setUserToken(token);
      setIsEmailVerified(emailVerified);
      await AsyncStorage.setItem('userToken', token);
      await AsyncStorage.setItem('isEmailVerified', emailVerified ? 'true' : 'false');
      return response.data;
    } catch (e) {
      console.log(`register error ${e}`);
      throw e;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    setUserToken(null);
    setIsEmailVerified(true);
    await AsyncStorage.removeItem('userToken');
    await AsyncStorage.removeItem('isEmailVerified');
    setIsLoading(false);
  };

  const markEmailVerified = async () => {
    setIsEmailVerified(true);
    await AsyncStorage.setItem('isEmailVerified', 'true');
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

  const startQuiz = async (compId) => {
    try {
      const response = await api.post('/quiz/start', { competition_id: compId });
      return response.data;
    } catch (e) {
      console.log(`startQuiz error ${e}`);
      throw e;
    }
  };

  const evaluateAnswer = async (attemptId, questionId, answer) => {
    try {
      const response = await api.post('/quiz/evaluate-answer', {
        attempt_id: attemptId,
        question_id: questionId,
        answer: answer
      });
      return response.data;
    } catch (e) {
      console.log(`evaluateAnswer error ${e}`);
      throw e;
    }
  };

  const submitQuiz = async (attemptId, answers) => {
    try {
      const response = await api.post('/quiz/submit', {
        attempt_id: attemptId,
        answers: answers
      });
      return response.data;
    } catch (e) {
      console.log(`submitQuiz error ${e}`);
      throw e;
    }
  };

  return (
    <AppContext.Provider
      value={{
        login,
        register,
        logout,
        processPayment,
        startQuiz,
        evaluateAnswer,
        submitQuiz,
        isLoading,
        userToken,
        userInfo,
        isEmailVerified,
        markEmailVerified,
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
