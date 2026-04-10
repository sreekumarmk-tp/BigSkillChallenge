import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import ScreenShell from '../components/ScreenShell';
import AppFooter from '../components/AppFooter';
import { NEON_CYAN, NEON_PURPLE, CARD_BG, TEXT_MUTED, CTA_GRADIENT_COLORS } from '../theme/neonTheme';

const Checkbox = ({ isChecked, onPress, label }) => (
  <TouchableOpacity style={styles.checkboxContainer} onPress={onPress} activeOpacity={0.7}>
    <View style={[styles.checkbox, isChecked && styles.checkboxChecked]}>
      {isChecked ? <MaterialCommunityIcons name="check" size={14} color="#000" /> : null}
    </View>
    <Text style={styles.checkboxLabel}>{label}</Text>
  </TouchableOpacity>
);

const EligibilityScreen = ({ navigation }) => {
  const [c1, setC1] = useState(false);
  const [c2, setC2] = useState(false);
  const [c3, setC3] = useState(false);

  const allChecked = c1 && c2 && c3;

  return (
    <ScreenShell>
      <ScrollView contentContainerStyle={styles.scrollContent} bounces={false}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} hitSlop={10}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#FFF" />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <View style={styles.logoContainer}>
              <MaterialCommunityIcons name="shield-check" size={26} color={NEON_PURPLE} />
              <Text style={styles.logoText}>
                <Text style={{ color: NEON_CYAN }}>BIG </Text>SKILL CHALLENGE
              </Text>
            </View>
            <Text style={styles.stepLabel}>STEP 3: ELIGIBILITY</Text>
          </View>
        </View>

        <Text style={styles.title}>
          Entry <Text style={styles.titleAccent}>Eligibility</Text>
        </Text>
        <Text style={styles.subtitle}>
          Please confirm the following before proceeding to payment.
        </Text>

        <View style={styles.checklistCard}>
          <Checkbox
            isChecked={c1}
            onPress={() => setC1(!c1)}
            label="I confirm I am eligible to enter this competition."
          />
          <Checkbox
            isChecked={c2}
            onPress={() => setC2(!c2)}
            label="I understand a maximum of 10 entries is permitted per competition."
          />
          <Checkbox
            isChecked={c3}
            onPress={() => setC3(!c3)}
            label="I acknowledge that this is a competition of skill, not chance."
          />
        </View>

        <View style={styles.infoStrip}>
          <MaterialCommunityIcons name="information-outline" size={16} color={NEON_CYAN} />
          <Text style={styles.infoText}>Please confirm all 3 items above to continue.</Text>
        </View>

        <TouchableOpacity
          style={styles.ctaButtonWrapper}
          disabled={!allChecked}
          onPress={() => navigation.navigate('Payment')}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={allChecked ? CTA_GRADIENT_COLORS : ['#4A4A5C', '#3D3D4D']}
            style={styles.ctaButton}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.ctaText}>Continue to Payment</Text>
            <MaterialCommunityIcons name="arrow-right" size={18} color="#FFF" />
          </LinearGradient>
        </TouchableOpacity>

        <View style={styles.secureCard}>
          <View style={styles.secureIconWrap}>
            <MaterialCommunityIcons name="shield-check-outline" size={16} color={NEON_CYAN} />
          </View>
          <View style={styles.secureTextWrap}>
            <Text style={styles.secureTitle}>Secure Vault Processing</Text>
            <Text style={styles.secureDesc}>
              Important: Payment is processed into a designated competition trust account. Entries are
              recorded upon successful quiz completion and creative submission.
            </Text>
          </View>
        </View>

        <AppFooter />
      </ScrollView>
    </ScreenShell>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  backBtn: {
    marginTop: 4,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    paddingRight: 32,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  logoText: {
    color: '#FFF',
    fontSize: 22,
    fontWeight: '900',
  },
  stepLabel: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1,
    textAlign: 'center',
  },
  title: {
    color: '#FFF',
    fontSize: 22,
    fontWeight: '900',
    marginBottom: 8,
  },
  titleAccent: {
    color: NEON_CYAN,
  },
  subtitle: {
    color: TEXT_MUTED,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 24,
  },
  checklistCard: {
    backgroundColor: CARD_BG,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    padding: 16,
    marginBottom: 16,
    gap: 16,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    marginRight: 12,
    marginTop: 2,
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
    lineHeight: 20,
    flex: 1,
  },
  infoStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 24,
  },
  infoText: {
    color: TEXT_MUTED,
    fontSize: 13,
    flex: 1,
    lineHeight: 20,
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
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  ctaText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  secureCard: {
    backgroundColor: CARD_BG,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    flexDirection: 'row',
    padding: 16,
    marginBottom: 24,
  },
  secureIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(161,140,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  secureTextWrap: {
    flex: 1,
  },
  secureTitle: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  secureDesc: {
    color: TEXT_MUTED,
    fontSize: 12,
    lineHeight: 18,
  },
});

export default EligibilityScreen;
