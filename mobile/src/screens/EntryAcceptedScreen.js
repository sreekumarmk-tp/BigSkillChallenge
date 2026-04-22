import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import ScreenShell from '../components/ScreenShell';
import AppFooter from '../components/AppFooter';
import { TEXT_MUTED, SUCCESS, CTA_GRADIENT_COLORS, CARD_BG, SCREEN_PADDING_H } from '../theme/neonTheme';

const EntryAcceptedScreen = ({ route, navigation }) => {
  const { entryId } = route.params || { entryId: 'UNKNOWN' };
  const entryReference = `TBSC-2026-${String(entryId).padStart(6, '0')}`;
  const submittedAt = new Date().toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <ScreenShell>
      <ScrollView contentContainerStyle={styles.scrollContent} bounces={false}>
        <View style={styles.iconWrap}>
          <Text style={styles.icon}>✓</Text>
        </View>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>Entry Accepted!</Text>
        </View>
        <Text style={styles.title}>Entry Accepted!</Text>
        <Text style={styles.subtitle}>Your entry has been successfully submitted and recorded.</Text>

        <View style={styles.receiptCard}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Word Count</Text>
            <Text style={styles.detailValue}>25 / 25 ✓</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Entry Reference</Text>
            <Text style={styles.detailValue}>{entryReference}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Submitted</Text>
            <Text style={styles.detailValue}>{submittedAt}</Text>
          </View>
          <View style={[styles.detailRow, styles.lastDetailRow]}>
            <Text style={styles.detailLabel}>Status</Text>
            <Text style={styles.detailValueSuccess}>Entry Recorded ✓</Text>
          </View>
        </View>

        <Text style={styles.emailNote}>A confirmation email has been sent to your registered email address.</Text>

        <TouchableOpacity style={styles.ctaWrap} onPress={() => navigation.navigate('Dashboard')} activeOpacity={0.85}>
          <LinearGradient colors={CTA_GRADIENT_COLORS} style={styles.button} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
            <Text style={styles.buttonText}>Return to Dashboard</Text>
          </LinearGradient>
        </TouchableOpacity>

        <AppFooter />
      </ScrollView>
    </ScreenShell>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: SCREEN_PADDING_H,
    paddingTop: 32,
    paddingBottom: 40,
    alignItems: 'center',
  },
  iconWrap: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: 'rgba(74, 222, 128, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(74, 222, 128, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  icon: {
    fontSize: 36,
    fontWeight: '900',
    color: '#FFF',
  },
  badge: {
    backgroundColor: 'rgba(74, 222, 128, 0.14)',
    borderColor: 'rgba(74, 222, 128, 0.35)',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 7,
    marginBottom: 14,
  },
  badgeText: {
    color: SUCCESS,
    fontSize: 14,
    fontWeight: '700',
  },
  title: {
    fontSize: 26,
    color: '#FFF',
    fontWeight: '900',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: 24,
    maxWidth: 320,
  },
  receiptCard: {
    width: '100%',
    backgroundColor: CARD_BG,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    padding: 14,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.07)',
    gap: 10,
  },
  lastDetailRow: {
    borderBottomWidth: 0,
  },
  detailLabel: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: 13,
    flex: 1,
  },
  detailValue: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'right',
    flex: 1,
  },
  detailValueSuccess: {
    color: SUCCESS,
    fontSize: 13,
    fontWeight: 'bold',
    textAlign: 'right',
    flex: 1,
  },
  emailNote: {
    color: 'rgba(255,255,255,0.42)',
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 22,
  },
  ctaWrap: {
    width: '100%',
    borderRadius: 50,
    overflow: 'hidden',
  },
  button: {
    paddingVertical: 16,
    borderRadius: 50,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
});

export default EntryAcceptedScreen;
