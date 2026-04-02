import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppContext } from '../context/AppContext';
import api from '../services/api';
import GradientBackground from '../components/GradientBackground';
import { COLORS, SIZES, GLOBAL_STYLES } from '../theme/constants';

const AuthScreen = ({ navigation }) => {
  const { login } = useContext(AppContext);
  const [isRegister, setIsRegister] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAuth = async () => {
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    
    setLoading(true);
    setError('');
    try {
      if (isRegister) {
        await api.post('/auth/register', {
          email,
          password
        });
        // Transition to Email Verify
        navigation.navigate('EmailVerify');
      } else {
        await login(email, password);
        // Assuming Context handles navigation root state later, or we manually navigate
        navigation.navigate('Dashboard');
      }
    } catch (e) {
      setError(e.response?.data?.detail || 'Authentication failed. Make sure you use a valid format.');
    }
    setLoading(false);
  };

  return (
    <GradientBackground>
      <SafeAreaView style={GLOBAL_STYLES.container}>
        <View style={styles.content}>
          <Text style={styles.title}>{isRegister ? 'Create Account' : 'Welcome Back'}</Text>
          <Text style={styles.subtitle}>
            {isRegister ? 'Register to enter the challenge.' : 'Log in to continue to your dashboard.'}
          </Text>

          <View style={GLOBAL_STYLES.glassCard}>
            <TextInput
              style={styles.input}
              placeholder="Email address"
              placeholderTextColor={COLORS.text.secondary}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor={COLORS.text.secondary}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <TouchableOpacity style={styles.button} onPress={handleAuth} disabled={loading}>
              {loading ? (
                <ActivityIndicator color={COLORS.text.primary} />
              ) : (
                <Text style={styles.buttonText}>{isRegister ? 'Create Account' : 'Log In'}</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity style={styles.switchMode} onPress={() => setIsRegister(!isRegister)}>
              <Text style={styles.switchText}>
                {isRegister ? 'Already have an account? Log In' : "Don't have an account? Register"}
              </Text>
            </TouchableOpacity>
            
            {isRegister && (
               <Text style={styles.termsText}>
                 By creating an account, you agree to our Terms and Conditions.
               </Text>
            )}
          </View>
        </View>
      </SafeAreaView>
    </GradientBackground>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
    padding: SIZES.padding * 2,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    color: COLORS.text.primary,
    fontWeight: 'bold',
    marginBottom: SIZES.base,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.text.secondary,
    marginBottom: SIZES.padding * 2,
  },
  input: {
    backgroundColor: COLORS.glass.input,
    borderColor: COLORS.glass.border,
    borderWidth: 1,
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    color: COLORS.text.primary,
    fontSize: 16,
    marginBottom: SIZES.padding,
  },
  button: {
    backgroundColor: COLORS.primary.orangeStart,
    padding: SIZES.padding,
    borderRadius: SIZES.btnRadius,
    alignItems: 'center',
    marginTop: SIZES.base,
  },
  buttonText: {
    color: COLORS.text.primary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  switchMode: {
    paddingVertical: SIZES.padding,
    alignItems: 'center',
  },
  switchText: {
    color: COLORS.primary.orangeStart,
    fontWeight: 'bold',
  },
  errorText: {
    color: COLORS.feedback.error,
    marginBottom: SIZES.base,
  },
  termsText: {
      color: COLORS.text.secondary,
      fontSize: 12,
      textAlign: 'center',
      marginTop: SIZES.padding,
  }
});

export default AuthScreen;
