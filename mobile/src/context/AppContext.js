import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';

export const AppContext = createContext();

// ---------------------------------------------------------------------------
// P2: Device fingerprint — generate once on first launch, persist forever.
// Sent with every submission as X-Device-Id header and body field.
// ---------------------------------------------------------------------------
function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}

async function getOrCreateDeviceId() {
  try {
    let id = await AsyncStorage.getItem('deviceId');
    if (!id) {
      id = uuidv4();
      await AsyncStorage.setItem('deviceId', id);
    }
    return id;
  } catch {
    return uuidv4(); // fallback — not persisted but better than nothing
  }
}

// ---------------------------------------------------------------------------
// P0: Stripe SDK — lazy-required so Expo Go (no native build) still runs.
// In production (EAS Build), install: npx expo install @stripe/stripe-react-native
// ---------------------------------------------------------------------------
import { StripeSDK } from '../services/stripe';

export const AppProvider = ({ children }) => {
  const [userToken, setUserToken] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [isEmailVerified, setIsEmailVerified] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [competition, setCompetition] = useState(null);
  const [quizPassed, setQuizPassed] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(false);
  // P2: Device fingerprint exposed to screens via context
  const [deviceId, setDeviceId] = useState(null);

  useEffect(() => {
    isLoggedIn();
    fetchActiveCompetition();
    // Initialise device ID on mount
    getOrCreateDeviceId().then(setDeviceId);
  }, []);

  const isLoggedIn = async () => {
    try {
      setIsLoading(true);
      const token = await AsyncStorage.getItem('userToken');
      const emailVerified = await AsyncStorage.getItem('isEmailVerified');
      setUserToken(token);
      setIsEmailVerified(emailVerified === null ? true : emailVerified === 'true');
    } catch (e) {
      console.log(`isLoggedIn error ${e}`);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchActiveCompetition = async () => {
    try {
      const response = await api.get('/competitions/');
      if (response.data && response.data.length > 0) {
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
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const token = response.data.access_token;
      setUserToken(token);
      setIsEmailVerified(true);
      await AsyncStorage.setItem('userToken', token);
      await AsyncStorage.setItem('isEmailVerified', 'true');
    } catch (e) {
      console.log(`login error ${e}`);
      throw e;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email, password, firstName, lastName) => {
    setIsLoading(true);
    try {
      const response = await api.post('/auth/register', {
        email, password, first_name: firstName, last_name: lastName,
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

  // ---------------------------------------------------------------------------
  // P0: processPayment — full Stripe PaymentIntent flow.
  //
  // Step 1: Call backend POST /payments/intent
  //         → backend creates Stripe PaymentIntent + pending Payment record
  //         → returns { payment_record_id, client_secret, publishable_key, amount }
  //
  // Step 2 (Stripe production):
  //         → initStripe(publishableKey)
  //         → initPaymentSheet(clientSecret)  — Stripe SDK builds the native sheet
  //         → presentPaymentSheet()           — user enters card, Stripe confirms
  //         → webhook updates Payment.status to "completed" asynchronously
  //
  // Step 2 (Mock mode — client_secret === "mock_secret"):
  //         → Payment already marked completed by backend, skip Stripe SDK entirely.
  // ---------------------------------------------------------------------------
  const processPayment = async (amount) => {
    if (!competition) throw new Error('No active competition');

    // Step 1: Create PaymentIntent on backend
    const intentRes = await api.post('/payments/intent', {
      competition_id: competition.id,
      amount,
    });
    const { client_secret, publishable_key, payment_record_id } = intentRes.data;

    // Mock mode — backend already set status=completed, no Stripe SDK needed
    if (client_secret === 'mock_secret' || publishable_key === 'mock_pk') {
      setPaymentStatus(true);
      return { transactionId: payment_record_id };
    }

    // Production Stripe path
    if (!StripeSDK) {
      throw new Error(
        'Stripe SDK not available in Expo Go. Build with EAS (npx expo install @stripe/stripe-react-native) for real payments.'
      );
    }

    const { initStripe, useStripe } = StripeSDK;

    // initStripe must be called before any Stripe operations
    await initStripe({ publishableKey: publishable_key });

    // We call the Payment Sheet API directly via the module (non-hook form)
    // so this works outside a component. In production you'd use the useStripe hook in a component.
    const stripe = StripeSDK.createPaymentMethod
      ? StripeSDK
      : null;

    if (!stripe) {
      throw new Error('Stripe SDK initialisation failed.');
    }

    // presentPaymentSheet requires a ref obtained via useStripe — handled in PaymentScreen.
    // Here we surface the client_secret so PaymentScreen can drive the sheet.
    setPaymentStatus(false); // Will be set true by webhook on next app open
    return {
      transactionId: payment_record_id,
      clientSecret: client_secret,
      publishableKey: publishable_key,
      needsStripeConfirm: true,
    };
  };

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
        answer,
      });
      return response.data;
    } catch (e) {
      console.log(`evaluateAnswer error ${e}`);
      throw e;
    }
  };

  const submitQuiz = async (attemptId, answers) => {
    try {
      const response = await api.post('/quiz/submit', { attempt_id: attemptId, answers });
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
        setPaymentStatus,
        // P2: Device fingerprint for anti-cheat
        deviceId,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
