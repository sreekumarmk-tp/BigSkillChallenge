import 'react-native-gesture-handler';
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { AppProvider } from './src/context/AppContext';

// Screens
import LandingScreen from './src/screens/LandingScreen';
import AuthScreen from './src/screens/AuthScreen';
import EmailVerifyScreen from './src/screens/EmailVerifyScreen';
import EligibilityScreen from './src/screens/EligibilityScreen';
import PaymentScreen from './src/screens/PaymentScreen';
import PaymentSuccessScreen from './src/screens/PaymentSuccessScreen';
import QuizScreen from './src/screens/QuizScreen';
import QuizResultScreen from './src/screens/QuizResultScreen';
import CreativeSubmissionScreen from './src/screens/CreativeSubmissionScreen';
import EntryAcceptedScreen from './src/screens/EntryAcceptedScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import ResultScreen from './src/screens/ResultScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <AppProvider>
        <NavigationContainer>
          <Stack.Navigator
            screenOptions={{
              headerShown: false,
              animationEnabled: true,
            }}
          >
            <Stack.Screen name="Landing" component={LandingScreen} />
            <Stack.Screen name="Auth" component={AuthScreen} />
            <Stack.Screen name="EmailVerify" component={EmailVerifyScreen} />
            <Stack.Screen name="Eligibility" component={EligibilityScreen} />
            <Stack.Screen name="Payment" component={PaymentScreen} />
            <Stack.Screen name="PaymentSuccess" component={PaymentSuccessScreen} />
            <Stack.Screen name="Quiz" component={QuizScreen} />
            <Stack.Screen name="QuizResult" component={QuizResultScreen} />
            <Stack.Screen name="CreativeSubmission" component={CreativeSubmissionScreen} />
            <Stack.Screen name="EntryAccepted" component={EntryAcceptedScreen} />
            <Stack.Screen name="Dashboard" component={DashboardScreen} />
            <Stack.Screen name="Result" component={ResultScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </AppProvider>
    </SafeAreaProvider>
  );
}
