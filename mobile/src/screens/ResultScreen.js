import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import api from '../services/api';
import ScreenShell from '../components/ScreenShell';
import AppFooter from '../components/AppFooter';
import { NEON_CYAN, CARD_BG, TEXT_MUTED, SCREEN_PADDING_H, PREMIUM_GOLD, getTextShadow } from '../theme/neonTheme';

const ResultScreen = ({ route, navigation }) => {
  const { entryId } = route.params;
  const [entry, setEntry] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEntryResult = async () => {
      try {
        const res = await api.get(`/submissions/me`);
        const found = res.data.find((e) => e.id === entryId);
        setEntry(found);
      } catch (e) {
        console.log(e);
      }
      setLoading(false);
    };

    fetchEntryResult();
  }, [entryId]);

  if (loading) {
    return (
      <ScreenShell>
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={NEON_CYAN} />
        </View>
      </ScreenShell>
    );
  }

  if (!entry || !entry.score) {
    return (
      <ScreenShell>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={styles.mutedCenter}>Result not properly formulated yet.</Text>
          <TouchableOpacity style={styles.linkBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.linkText}>Go Back</Text>
          </TouchableOpacity>
          <AppFooter />
        </ScrollView>
      </ScreenShell>
    );
  }

  const { score } = entry;

  return (
    <ScreenShell>
      <ScrollView contentContainerStyle={styles.scrollContent} bounces={false}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={12}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#FFF" />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, styles.textShadowed]}>ENTRY-{entryId}</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.scoreCircleContainer}>
          <View style={styles.scoreCircle}>
            <Text style={[styles.scoreBig, styles.textShadowed]}>{score.total_score}</Text>
            <Text style={styles.scoreSub}>/ 100</Text>
          </View>
          <Text style={[styles.aiLabel, styles.textShadowed]}>AI Evaluation Score</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Breakdown</Text>

          <View style={styles.breakdownRow}>
            <Text style={styles.breakdownLabel}>Relevance to Question</Text>
            <Text style={styles.breakdownValue}>{score.relevance_score}/100</Text>
          </View>
          <View style={styles.breakdownRow}>
            <Text style={styles.breakdownLabel}>Clarity & Grammar</Text>
            <Text style={styles.breakdownValue}>{score.clarity_score}/100</Text>
          </View>
          <View style={styles.breakdownRow}>
            <Text style={styles.breakdownLabel}>Creativity</Text>
            <Text style={styles.breakdownValue}>{score.creativity_score}/100</Text>
          </View>
          <View style={[styles.breakdownRow, { borderBottomWidth: 0 }]}>
            <Text style={styles.breakdownLabel}>Overall Impact</Text>
            <Text style={styles.breakdownValue}>{score.impact_score}/100</Text>
          </View>

          <View style={styles.feedbackBox}>
            <Text style={styles.feedbackText}>"{score.feedback}"</Text>
          </View>
        </View>

        <Text style={styles.disclaimer}>
          Engine AI™ is a deterministic evaluation tool using exact rubrics. The highest 500 scoring entries will be read by
          human judges.
        </Text>

        <AppFooter />
      </ScrollView>
    </ScreenShell>
  );
};

const styles = StyleSheet.create({
  loadingWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: SCREEN_PADDING_H,
    paddingTop: 16,
    paddingBottom: 40,
  },
  mutedCenter: {
    color: TEXT_MUTED,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
  },
  linkBtn: {
    alignSelf: 'center',
    padding: 12,
  },
  linkText: {
    color: NEON_CYAN,
    fontSize: 15,
    fontWeight: 'bold',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  scoreCircleContainer: {
    alignItems: 'center',
    marginBottom: 28,
  },
  scoreCircle: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 3,
    borderColor: PREMIUM_GOLD,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: CARD_BG,
    marginBottom: 12,
  },
  scoreBig: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#FFF',
  },
  scoreSub: {
    fontSize: 16,
    color: TEXT_MUTED,
  },
  aiLabel: {
    color: PREMIUM_GOLD,
    fontWeight: 'bold',
    letterSpacing: 1,
    fontSize: 12,
  },
  card: {
    backgroundColor: CARD_BG,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    padding: 16,
    marginBottom: 20,
  },
  sectionTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  breakdownLabel: {
    color: TEXT_MUTED,
    fontSize: 14,
    flex: 1,
  },
  breakdownValue: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  feedbackBox: {
    marginTop: 20,
    padding: 16,
    backgroundColor: 'rgba(161, 140, 255, 0.08)',
    borderRadius: 12,
    borderColor: 'rgba(161, 140, 255, 0.25)',
    borderWidth: 1,
  },
  feedbackText: {
    color: TEXT_MUTED,
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 22,
    fontSize: 14,
  },
  disclaimer: {
    color: TEXT_MUTED,
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 8,
  },
  textShadowed: {
    ...getTextShadow(0.5, 4),
  },
});

export default ResultScreen;
