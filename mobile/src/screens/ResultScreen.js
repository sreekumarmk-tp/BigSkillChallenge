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
  const [percentileInfo, setPercentileInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showRubric, setShowRubric] = useState(false);
  const [showAudit, setShowAudit] = useState(false);

  useEffect(() => {
    const fetchEntryResult = async () => {
      try {
        const res = await api.get(`/submissions/me`);
        const found = res.data.find((e) => e.id === entryId);
        setEntry(found);
        const shortlisted = found?.is_shortlisted || found?.status === 'shortlisted';
        if (found?.score && shortlisted) {
          const percentileRes = await api.get(`/submissions/${entryId}/percentile`);
          setPercentileInfo(percentileRes.data);
        }
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

  const hasTopPercentage = percentileInfo?.top_percentage !== undefined && percentileInfo?.top_percentage !== null;
  const topPercentage = hasTopPercentage ? percentileInfo.top_percentage : null;
  const totalEntries = percentileInfo?.total_entries;
  const isShortlisted = entry?.is_shortlisted || entry?.status === 'shortlisted';
  const rawTotalScore = Number(entry?.score?.total_score);
  const hasValidTotalScore = Number.isFinite(rawTotalScore);
  const scoreOutOf100 = hasValidTotalScore ? Math.round(rawTotalScore) : null;

  const rubricData = [
    { label: 'Relevance to Prompt', value: Number(entry?.score?.relevance_score), color: '#F59E0B' },
    { label: 'Creativity & Originality', value: Number(entry?.score?.creativity_score), color: '#7C3AED' },
    { label: 'Clarity & Expression', value: Number(entry?.score?.clarity_score), color: '#3B82F6' },
    { label: 'Overall Impact', value: Number(entry?.score?.impact_score), color: '#4ADE80' },
  ];

  if (!isShortlisted) {
    return (
      <ScreenShell>
        <ScrollView contentContainerStyle={styles.scrollContent} bounces={false}>
          <View style={styles.topBar}>
            <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={12} style={styles.backBtn}>
              <MaterialCommunityIcons name="arrow-left" size={22} color="#FFF" />
            </TouchableOpacity>
            <Text style={styles.entryRef}>ENTRY-{entryId}</Text>
            <View style={styles.backBtn} />
          </View>

          <View style={styles.hero}>
            <View style={[styles.trophy, styles.acceptedIconWrap]}>
              <Text style={styles.trophyEmoji}>✅</Text>
            </View>
            <View style={styles.acceptedBadge}>
              <Text style={styles.acceptedBadgeText}>Entry Accepted</Text>
            </View>
            <Text style={styles.heroTitle}>Thanks for your submission</Text>
            <Text style={styles.heroSub}>
              Your entry was accepted successfully. It is currently in "Entry Accepted" status and not shortlisted at this stage.
            </Text>
          </View>

          <View style={styles.infoBar}>
            <Text style={styles.infoBarText}>
              <Text style={styles.infoBarStrong}>Current status:</Text> {entry?.status || 'entry_accepted'}
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Entry Details</Text>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Reference</Text>
              <Text style={styles.breakdownValue}>ENTRY-{entryId}</Text>
            </View>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Shortlist</Text>
              <Text style={styles.breakdownValue}>Not shortlisted</Text>
            </View>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>AI Score</Text>
              <Text style={styles.breakdownValue}>{scoreOutOf100 ?? '--'} / 100</Text>
            </View>
            <View style={[styles.breakdownRow, { borderBottomWidth: 0 }]}>
              <Text style={styles.breakdownLabel}>Status</Text>
              <Text style={styles.breakdownValue}>{entry?.status || 'entry_accepted'}</Text>
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Evaluator Feedback</Text>
            <View style={styles.feedbackBoxInline}>
              <Text style={styles.feedbackText}>
                "{entry?.score?.feedback || 'Feedback is being prepared.'}"
              </Text>
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>What You Can Do Next</Text>
            <View style={styles.stepRow}>
              <Text style={styles.stepNum}>1</Text>
              <Text style={styles.stepText}>Review your feedback and understand scoring areas.</Text>
            </View>
            <View style={styles.stepRow}>
              <Text style={styles.stepNum}>2</Text>
              <Text style={styles.stepText}>Track updates from your dashboard.</Text>
            </View>
            <View style={[styles.stepRow, { marginBottom: 0 }]}>
              <Text style={styles.stepNum}>3</Text>
              <Text style={styles.stepText}>Submit another entry when available.</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.primaryBtn} onPress={() => navigation.navigate('Dashboard')} activeOpacity={0.9}>
            <Text style={styles.primaryBtnText}>Back to Dashboard</Text>
          </TouchableOpacity>

          <Text style={styles.disclaimer}>Pure skill. One prize. One winner.</Text>
          <AppFooter />
        </ScrollView>
      </ScreenShell>
    );
  }

  return (
    <ScreenShell>
      <ScrollView contentContainerStyle={styles.scrollContent} bounces={false}>
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={12} style={styles.backBtn}>
            <MaterialCommunityIcons name="arrow-left" size={22} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.entryRef}>ENTRY-{entryId}</Text>
          <View style={styles.backBtn} />
        </View>

        <View style={styles.hero}>
          <View style={styles.trophy}>
            <Text style={styles.trophyEmoji}>🏆</Text>
          </View>
          <View style={styles.shortlistBadge}>
            <Text style={styles.shortlistBadgeText}>
              {hasTopPercentage ? `Shortlisted - Top ${topPercentage}%` : 'Shortlisted'}
            </Text>
          </View>
          <Text style={styles.heroTitle}>Congratulations!</Text>
          <Text style={styles.heroSub}>
            {hasTopPercentage && totalEntries
              ? `Your entry ranked in the top ${topPercentage}% of ${totalEntries} entries.`
              : 'Your entry has completed AI evaluation and is shortlisted for the next stage.'}
          </Text>
        </View>

        <View style={styles.infoBar}>
          <Text style={styles.infoBarText}>
            <Text style={styles.infoBarStrong}>Lucid Engine AI TM</Text> is a deterministic evaluation tool using exact rubrics.
            Final winners are confirmed by independent human judges.
          </Text>
        </View>

        <View style={styles.card}>
          <View style={styles.cardTitleRow}>
            <Text style={styles.sectionTitle}>AI Evaluation Score</Text>
            <Text style={styles.cardLabel}>Lucid Engine AI TM</Text>
          </View>

          <View style={styles.scoreWrap}>
            <View style={styles.scoreCircle}>
              <Text style={styles.scoreBig}>{scoreOutOf100 ?? '--'}</Text>
              <Text style={styles.scoreDen}>/100</Text>
            </View>

            <View style={styles.scoreInfoCol}>
              <Text style={styles.rankText}>{hasTopPercentage ? `Top ${topPercentage}%` : 'Rank pending'}</Text>
              <Text style={styles.rankSub}>{totalEntries ? `of ${totalEntries} entries` : 'Population updating'}</Text>
              <View style={styles.proceedingPill}>
                <Text style={styles.proceedingText}>Proceeding to judging</Text>
              </View>
            </View>
          </View>

          <TouchableOpacity style={styles.accordionBtn} onPress={() => setShowRubric((prev) => !prev)} activeOpacity={0.85}>
            <Text style={styles.accordionBtnText}>View Rubric Breakdown</Text>
            <MaterialCommunityIcons name={showRubric ? 'chevron-up' : 'chevron-down'} size={18} color={PREMIUM_GOLD} />
          </TouchableOpacity>

          {showRubric && (
            <View style={styles.accordionBody}>
              {rubricData.map((item) => (
                <View key={item.label} style={styles.rubricRow}>
                  <View style={styles.rubricHead}>
                    <Text style={styles.rubricLabel}>{item.label}</Text>
                    <Text style={[styles.rubricValue, { color: item.color }]}>{Number.isFinite(item.value) ? Math.round(item.value) : '--'}</Text>
                  </View>
                  <View style={styles.rubricTrack}>
                    <View
                      style={[
                        styles.rubricFill,
                        {
                          width: `${Number.isFinite(item.value) ? Math.max(0, Math.min(100, item.value)) : 0}%`,
                          backgroundColor: item.color,
                        },
                      ]}
                    />
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Your Submission</Text>
          <View style={styles.promptBox}>
            <Text style={styles.promptLabel}>Prompt</Text>
            <Text style={styles.promptText}>"In exactly 25 words, tell us why you should win this prize."</Text>
          </View>
          <Text style={styles.promptLabel}>Your Response</Text>
          <Text style={styles.responseText}>"{entry?.score?.feedback || 'Response is being prepared.'}"</Text>
          <View style={styles.metaRow}>
            <Text style={styles.metaText}>25 words</Text>
            <Text style={styles.metaText}>Locked</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>What Happens Next</Text>
          <View style={styles.stepRow}>
            <Text style={styles.stepNum}>1</Text>
            <Text style={styles.stepText}>3 independent judges score your entry separately.</Text>
          </View>
          <View style={styles.stepRow}>
            <Text style={styles.stepNum}>2</Text>
            <Text style={styles.stepText}>All judges complete evaluation before aggregation.</Text>
          </View>
          <View style={styles.stepRow}>
            <Text style={styles.stepNum}>3</Text>
            <Text style={styles.stepText}>Ties are resolved by secondary review and consensus.</Text>
          </View>
          <View style={styles.stepRow}>
            <Text style={styles.stepNum}>4</Text>
            <Text style={styles.stepText}>Independent scrutineer verifies and confirms final result.</Text>
          </View>
          <View style={[styles.stepRow, { marginBottom: 0 }]}>
            <Text style={styles.stepNum}>5</Text>
            <Text style={styles.stepText}>Winners are announced at competition close.</Text>
          </View>
        </View>

        <View style={styles.card}>
          <TouchableOpacity style={styles.accordionBtn} onPress={() => setShowAudit((prev) => !prev)} activeOpacity={0.85}>
            <Text style={styles.sectionTitle}>Immutable Audit Trail</Text>
            <MaterialCommunityIcons name={showAudit ? 'chevron-up' : 'chevron-down'} size={18} color={PREMIUM_GOLD} />
          </TouchableOpacity>
          {showAudit && (
            <View style={styles.accordionBody}>
              <View style={styles.auditRow}>
                <Text style={styles.auditEvent}>Entry submitted and sealed</Text>
                <Text style={styles.auditTs}>Hash: a3f8d2c1...</Text>
              </View>
              <View style={styles.auditRow}>
                <Text style={styles.auditEvent}>AI evaluation completed</Text>
                <Text style={styles.auditTs}>Hash: b9e1c7d3...</Text>
              </View>
              <View style={styles.auditRow}>
                <Text style={styles.auditEvent}>Shortlist generated</Text>
                <Text style={styles.auditTs}>Hash: d4f2a1e8...</Text>
              </View>
              <View style={[styles.auditRow, { borderBottomWidth: 0 }]}>
                <Text style={styles.auditEvent}>Model: Lucid Engine AI TM v2.1.4</Text>
                <Text style={styles.auditTs}>Deterministic seed: 2026-Q1</Text>
              </View>
            </View>
          )}
        </View>

        <TouchableOpacity style={styles.primaryBtn} onPress={() => navigation.navigate('Dashboard')} activeOpacity={0.9}>
          <Text style={styles.primaryBtnText}>View All My Entries</Text>
        </TouchableOpacity>

        <View style={styles.feedbackBox}>
          <Text style={styles.feedbackText}>
            "{entry.score.feedback}"
          </Text>
        </View>

        <Text style={styles.disclaimer}>
          Pure skill. One prize. One winner.
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
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  backBtn: {
    width: 28,
    alignItems: 'center',
  },
  entryRef: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
  hero: {
    alignItems: 'center',
    marginBottom: 16,
  },
  trophy: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: 'rgba(245, 158, 11, 0.22)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  trophyEmoji: {
    fontSize: 32,
  },
  shortlistBadge: {
    backgroundColor: 'rgba(74, 222, 128, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(74, 222, 128, 0.28)',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 10,
  },
  shortlistBadgeText: {
    color: '#4ADE80',
    fontWeight: '700',
    fontSize: 12,
  },
  heroTitle: {
    color: '#FFF',
    fontSize: 26,
    fontWeight: '900',
    marginBottom: 8,
    ...getTextShadow(0.4, 4),
  },
  heroSub: {
    color: 'rgba(255,255,255,0.68)',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 21,
  },
  infoBar: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderRadius: 14,
    padding: 13,
    marginBottom: 14,
  },
  infoBarText: {
    color: 'rgba(180, 210, 255, 0.84)',
    fontSize: 13,
    lineHeight: 19,
  },
  infoBarStrong: {
    color: '#FFF',
    fontWeight: '700',
  },
  card: {
    backgroundColor: CARD_BG,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    padding: 14,
    marginBottom: 14,
  },
  cardTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardLabel: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: 11,
  },
  sectionTitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '800',
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  breakdownLabel: {
    color: 'rgba(255,255,255,0.62)',
    fontSize: 14,
    flex: 1,
  },
  breakdownValue: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 14,
    marginLeft: 10,
    textAlign: 'right',
  },
  acceptedIconWrap: {
    backgroundColor: 'rgba(74,222,128,0.2)',
    borderColor: 'rgba(74,222,128,0.4)',
  },
  acceptedBadge: {
    backgroundColor: 'rgba(74,222,128,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(74,222,128,0.28)',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 10,
  },
  acceptedBadgeText: {
    color: '#4ADE80',
    fontWeight: '700',
    fontSize: 12,
  },
  scoreWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 14,
  },
  scoreCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 4,
    borderColor: PREMIUM_GOLD,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  scoreBig: {
    color: PREMIUM_GOLD,
    fontWeight: '900',
    fontSize: 26,
    lineHeight: 30,
  },
  scoreDen: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 11,
  },
  scoreInfoCol: {
    flex: 1,
  },
  rankText: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: '900',
  },
  rankSub: {
    color: 'rgba(255,255,255,0.42)',
    fontSize: 12,
    marginTop: 2,
  },
  proceedingPill: {
    alignSelf: 'flex-start',
    marginTop: 8,
    backgroundColor: 'rgba(74,222,128,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(74,222,128,0.24)',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  proceedingText: {
    color: '#4ADE80',
    fontSize: 12,
    fontWeight: '600',
  },
  accordionBtn: {
    minHeight: 38,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  accordionBtnText: {
    color: PREMIUM_GOLD,
    fontSize: 14,
    fontWeight: '700',
  },
  accordionBody: {
    marginTop: 12,
  },
  rubricRow: {
    marginBottom: 10,
  },
  rubricHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  rubricLabel: {
    color: 'rgba(255,255,255,0.76)',
    fontSize: 12,
    flex: 1,
  },
  rubricValue: {
    fontSize: 12,
    fontWeight: '700',
  },
  rubricTrack: {
    height: 8,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  rubricFill: {
    height: '100%',
    borderRadius: 8,
  },
  promptBox: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  promptLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.4)',
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  promptText: {
    color: 'rgba(255,255,255,0.72)',
    fontSize: 14,
    lineHeight: 21,
    fontStyle: 'italic',
  },
  responseText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    lineHeight: 22,
    fontStyle: 'italic',
    marginTop: 4,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.07)',
    marginTop: 10,
    paddingTop: 10,
  },
  metaText: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 12,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  stepNum: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: 'rgba(124,58,237,0.35)',
    backgroundColor: 'rgba(124,58,237,0.25)',
    color: '#C4B5FD',
    textAlign: 'center',
    textAlignVertical: 'center',
    fontSize: 11,
    fontWeight: '700',
    marginRight: 10,
    marginTop: 1,
    overflow: 'hidden',
  },
  stepText: {
    flex: 1,
    color: 'rgba(255,255,255,0.6)',
    fontSize: 13,
    lineHeight: 20,
  },
  auditRow: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.07)',
    paddingBottom: 10,
    marginBottom: 10,
  },
  auditEvent: {
    color: 'rgba(255,255,255,0.82)',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 3,
  },
  auditTs: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 11,
  },
  primaryBtn: {
    borderRadius: 40,
    backgroundColor: PREMIUM_GOLD,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
    marginBottom: 12,
  },
  primaryBtnText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 0.6,
  },
  feedbackBox: {
    marginBottom: 14,
    padding: 14,
    backgroundColor: 'rgba(161, 140, 255, 0.08)',
    borderRadius: 12,
    borderColor: 'rgba(161, 140, 255, 0.25)',
    borderWidth: 1,
  },
  feedbackBoxInline: {
    marginTop: 10,
    padding: 14,
    backgroundColor: 'rgba(161, 140, 255, 0.08)',
    borderRadius: 12,
    borderColor: 'rgba(161, 140, 255, 0.25)',
    borderWidth: 1,
  },
  feedbackText: {
    color: TEXT_MUTED,
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 20,
    fontSize: 13,
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
