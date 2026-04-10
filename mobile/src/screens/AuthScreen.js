import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, ScrollView, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { AppContext } from '../context/AppContext';
import ScreenShell from '../components/ScreenShell';
import AppFooter from '../components/AppFooter';
import { NEON_CYAN, NEON_PURPLE, DARK_BG, INPUT_BG, TEXT_MUTED, CTA_GRADIENT_COLORS } from '../theme/neonTheme';

const AuthScreen = ({ navigation }) => {
  const { login, register } = useContext(AppContext);
  const [isRegister, setIsRegister] = useState(true);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [isOver18, setIsOver18] = useState(false);
  const [isAgreedTerms, setIsAgreedTerms] = useState(false);
  const [isSkillBased, setIsSkillBased] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAuth = async () => {
    setError('');
    
    if (isRegister) {
      const nameParts = fullName.trim().split(' ');
      const fName = nameParts[0] || '';
      const lName = nameParts.slice(1).join(' ') || ' '; // API might require last name, provide at least space if missing
      
      if (!fullName.trim() || !email || !password) {
        setError('Please fill in all fields.');
        return;
      }
      if (!isOver18 || !isAgreedTerms || !isSkillBased) {
        setError('Please confirm all checkboxes to register.');
        return;
      }
      if (password.length < 8) {
        setError('Password must be at least 8 characters.');
        return;
      }
      
      setLoading(true);
      try {
        await register(email, password, fName, lName);
        navigation.navigate('EmailVerify');
      } catch (e) {
        setError(e.response?.data?.detail || 'Registration failed. Please check your details.');
      }
      setLoading(false);

    } else {
      if (!email || !password) {
        setError('Please fill in all fields.');
        return;
      }
      setLoading(true);
      try {
        await login(email, password);
        navigation.navigate('Dashboard');
      } catch (e) {
        setError(e.response?.data?.detail || 'Authentication failed. Incorrect email or password.');
      }
      setLoading(false);
    }
  };

  const toggleMode = (modeIsRegister) => {
    setIsRegister(modeIsRegister);
    setError('');
  };

  const CustomCheckbox = ({ label, isChecked, onPress }) => (
    <TouchableOpacity style={styles.checkboxContainer} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.checkbox, isChecked && styles.checkboxChecked]}>
        {isChecked && <MaterialCommunityIcons name="check" size={14} color="#000" />}
      </View>
      <Text style={styles.checkboxLabel}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <ScreenShell>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} bounces={false}>
          
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <MaterialCommunityIcons name="shield-check" size={26} color={NEON_PURPLE} />
              <Text style={styles.logoText}>
                <Text style={{color: NEON_CYAN}}>BIG </Text>SKILL CHALLENGE
              </Text>
            </View>
            <Text style={styles.subtitle}>
              {isRegister ? 'Create your account to enter the\nchallenge' : 'Log in to your account to continue'}
            </Text>
          </View>

          {/* Toggle Switch */}
          <View style={styles.toggleContainer}>
            <TouchableOpacity 
              style={[styles.toggleButton, isRegister && styles.toggleActive]}
              onPress={() => toggleMode(true)}
            >
              <Text style={[styles.toggleText, isRegister && styles.toggleTextActive]}>Register</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.toggleButton, !isRegister && styles.toggleActive]}
              onPress={() => toggleMode(false)}
            >
              <Text style={[styles.toggleText, !isRegister && styles.toggleTextActive]}>Login</Text>
            </TouchableOpacity>
          </View>

          {/* Form */}
          <View style={styles.formContainer}>
            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            {isRegister && (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>FULL NAME</Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.input}
                    placeholder="John Doe"
                    placeholderTextColor="#555"
                    value={fullName}
                    onChangeText={setFullName}
                  />
                  <MaterialCommunityIcons name="badge-account-outline" size={20} color="#555" />
                </View>
              </View>
            )}

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>EMAIL ADDRESS</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  placeholder="challenger@arena.com"
                  placeholderTextColor="#555"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
                <MaterialCommunityIcons name="at" size={20} color="#555" />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>PASSWORD</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  placeholder="••••••••"
                  placeholderTextColor="#555"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
                <MaterialCommunityIcons name="lock-outline" size={20} color="#555" />
              </View>
            </View>

            {isRegister && (
              <View style={styles.checkboxesSection}>
                <CustomCheckbox 
                  label="I confirm I am over 18" 
                  isChecked={isOver18} 
                  onPress={() => setIsOver18(!isOver18)} 
                />
                <CustomCheckbox 
                  label="I agree to Terms & Conditions" 
                  isChecked={isAgreedTerms} 
                  onPress={() => setIsAgreedTerms(!isAgreedTerms)} 
                />
                <CustomCheckbox 
                  label="I understand this is a skill-based competition" 
                  isChecked={isSkillBased} 
                  onPress={() => setIsSkillBased(!isSkillBased)} 
                />
              </View>
            )}

            {/* CTA */}
            <TouchableOpacity 
              style={styles.ctaButtonWrapper}
              onPress={handleAuth}
              disabled={loading}
            >
              <LinearGradient
                colors={CTA_GRADIENT_COLORS}
                style={styles.ctaButton}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 0}}
              >
                {loading ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <Text style={styles.ctaText}>{isRegister ? 'CREATE ACCOUNT' : 'LOGIN NOW'}</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

            <AppFooter />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenShell>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: DARK_BG,
  },
  gradientBg: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 400,
    zIndex: -1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 40,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    // marginBottom: 16,
  },
  logoText: {
    color: '#FFF',
    fontSize: 22,
    fontWeight: '900',
    // fontStyle: 'italic',
    // letterSpacing: 1,
  },
  subtitle: {
    color: TEXT_MUTED,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 20,
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 12,
    padding: 4,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  toggleActive: {
    backgroundColor: '#20223D', 
  },
  toggleText: {
    color: '#666',
    fontWeight: 'bold',
    fontSize: 14,
  },
  toggleTextActive: {
    color: NEON_CYAN,
  },
  formContainer: {
    width: '100%',
  },
  errorText: {
    color: '#FF6B6B',
    marginBottom: 16,
    textAlign: 'center',
    fontSize: 14,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginBottom: 8,
    marginLeft: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: INPUT_BG,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 56,
  },
  input: {
    flex: 1,
    color: '#FFF',
    fontSize: 15,
    height: '100%',
  },
  checkboxesSection: {
    marginTop: 8,
    marginBottom: 24,
    gap: 16,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    marginRight: 12,
    backgroundColor: 'rgba(255,255,255,0.02)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: NEON_PURPLE,
    borderColor: NEON_PURPLE,
  },
  checkboxLabel: {
    color: TEXT_MUTED,
    fontSize: 13,
  },
  ctaButtonWrapper: {
    shadowColor: NEON_PURPLE,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 15,
    elevation: 8,
    marginBottom: 24,
  },
  ctaButton: {
    width: '100%',
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ctaText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
});

export default AuthScreen;
