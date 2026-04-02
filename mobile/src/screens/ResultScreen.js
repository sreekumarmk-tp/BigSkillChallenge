import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../services/api';
import GradientBackground from '../components/GradientBackground';
import { COLORS, SIZES, GLOBAL_STYLES } from '../theme/constants';

const ResultScreen = ({ route, navigation }) => {
  const { entryId } = route.params;
  const [entry, setEntry] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEntryResult = async () => {
      try {
        const res = await api.get(`/submissions/me`);
        const found = res.data.find(e => e.id === entryId);
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
      <GradientBackground>
        <SafeAreaView style={[GLOBAL_STYLES.container, { justifyContent: 'center', alignItems: 'center' }]}>
          <ActivityIndicator size="large" color={COLORS.text.primary} />
        </SafeAreaView>
      </GradientBackground>
    );
  }

  if (!entry || !entry.score) {
    return (
      <GradientBackground>
        <SafeAreaView style={[GLOBAL_STYLES.container, { justifyContent: 'center', alignItems: 'center' }]}>
          <Text style={{color: COLORS.text.primary}}>Result not properly formulated yet.</Text>
          <TouchableOpacity style={{marginTop: 20}} onPress={() => navigation.goBack()}>
            <Text style={{color: COLORS.primary.orangeStart}}>Go Back</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </GradientBackground>
    );
  }

  const { score } = entry;

  return (
    <GradientBackground>
      <SafeAreaView style={GLOBAL_STYLES.container}>
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Text style={styles.backButton}>← Back</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>ENTRY-{entryId}</Text>
            <View style={{width: 50}} />
          </View>

          <View style={styles.scoreCircleContainer}>
            <View style={styles.scoreCircle}>
              <Text style={styles.scoreBig}>{score.total_score}</Text>
              <Text style={styles.scoreSub}>/ 100</Text>
            </View>
            <Text style={styles.aiLabel}>AI Evaluation Score</Text>
          </View>

          <View style={GLOBAL_STYLES.glassCard}>
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
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Overall Impact</Text>
              <Text style={styles.breakdownValue}>{score.impact_score}/100</Text>
            </View>
            
            <View style={styles.feedbackBox}>
              <Text style={styles.feedbackText}>"{score.feedback}"</Text>
            </View>
          </View>
          
          <Text style={styles.disclaimer}>
            Engine AI™ is a deterministic evaluation tool using exact rubrics. The highest 500 scoring entries will be read by human judges.
          </Text>
        </ScrollView>
      </SafeAreaView>
    </GradientBackground>
  );
};

const styles = StyleSheet.create({
  content: {
    padding: SIZES.padding * 1.5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.padding * 2,
  },
  backButton: {
    color: '#9CA3AF',
    fontSize: 16,
  },
  headerTitle: {
    color: COLORS.text.primary,
    fontSize: 18,
    fontWeight: 'bold',
  },
  scoreCircleContainer: {
    alignItems: 'center',
    marginBottom: SIZES.padding * 3,
  },
  scoreCircle: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 4,
    borderColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.glass.bg,
    marginBottom: SIZES.padding,
  },
  scoreBig: {
    fontSize: 42,
    fontWeight: 'bold',
    color: COLORS.text.primary,
  },
  scoreSub: {
    fontSize: 16,
    color: COLORS.text.secondary,
  },
  aiLabel: {
    color: '#3B82F6',
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  sectionTitle: {
    color: COLORS.text.primary,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: SIZES.padding,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SIZES.base,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.glass.border,
  },
  breakdownLabel: {
    color: COLORS.text.secondary,
  },
  breakdownValue: {
    color: COLORS.text.primary,
    fontWeight: 'bold',
  },
  feedbackBox: {
    marginTop: SIZES.padding * 2,
    padding: SIZES.padding,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderRadius: SIZES.radius,
    borderColor: 'rgba(59, 130, 246, 0.3)',
    borderWidth: 1,
  },
  feedbackText: {
    color: '#93C5FD',
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 20,
  },
  disclaimer: {
    color: COLORS.text.secondary,
    fontSize: 12,
    textAlign: 'center',
    marginTop: SIZES.padding * 3,
    lineHeight: 18,
  }
});

export default ResultScreen;
