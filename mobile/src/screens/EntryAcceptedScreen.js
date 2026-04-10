import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import ScreenShell from '../components/ScreenShell';
import AppFooter from '../components/AppFooter';
import { TEXT_MUTED, SUCCESS, CTA_GRADIENT_COLORS, CARD_BG, SCREEN_PADDING_H } from '../theme/neonTheme';

const EntryAcceptedScreen = ({ route, navigation }) => {
  const { entryId } = route.params || { entryId: 'UNKNOWN' };

  return (
    <ScreenShell>
      <ScrollView contentContainerStyle={styles.scrollContent} bounces={false}>
        <Text style={styles.icon}>🎯</Text>
        <Text style={styles.title}>Entry Accepted</Text>
        <Text style={styles.subtitle}>Reference: ENTRY-{entryId}</Text>

        <View style={styles.card}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Word Count Check:</Text>
            <Text style={styles.detailValueSuccess}>Passed (25 words)</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Originality Check:</Text>
            <Text style={styles.detailValueSuccess}>Passed</Text>
          </View>
          <View style={[styles.detailRow, { borderBottomWidth: 0 }]}>
            <Text style={styles.detailLabel}>Status:</Text>
            <Text style={styles.detailValue}>Pending AI Evaluation</Text>
          </View>
        </View>

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
  icon: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    color: SUCCESS,
    fontWeight: '900',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: TEXT_MUTED,
    marginBottom: 24,
  },
  card: {
    width: '100%',
    backgroundColor: CARD_BG,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    padding: 16,
    marginBottom: 24,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  detailLabel: {
    color: TEXT_MUTED,
    fontSize: 14,
    flex: 1,
  },
  detailValue: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'right',
  },
  detailValueSuccess: {
    color: SUCCESS,
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'right',
  },
  ctaWrap: {
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
  },
  button: {
    paddingVertical: 16,
    borderRadius: 12,
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
