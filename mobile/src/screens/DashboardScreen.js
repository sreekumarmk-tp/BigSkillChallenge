import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, RefreshControl } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AppContext } from '../context/AppContext';
import api from '../services/api';
import ScreenShell from '../components/ScreenShell';
import AppFooter from '../components/AppFooter';
import {
  NEON_CYAN,
  NEON_BLUE,
  CARD_BG,
  TEXT_MUTED,
  CTA_GRADIENT_COLORS,
  SCREEN_PADDING_H,
  getShadow,
  getTextShadow,
} from '../theme/neonTheme';

const DashboardScreen = ({ navigation }) => {
  const { logout, competition } = useContext(AppContext);
  const [entries, setEntries] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [payments, setPayments] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      const resEntries = await api.get('/submissions/me');
      setEntries(resEntries.data || []);

      const resPayments = await api.get('/payments/me');
      setPayments(resPayments.data || []);

      const resAttempts = await api.get('/quiz/attempts-all/me');
      setAttempts(resAttempts.data || []);
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    fetchData();
    const unsubscribe = navigation.addListener('focus', () => {
      fetchData();
    });
    return unsubscribe;
  }, [competition, navigation]);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchData().then(() => setRefreshing(false));
  }, [competition]);

  const handleLogout = async () => {
    await logout();
    navigation.reset({
      index: 0,
      routes: [{ name: 'Landing' }],
    });
  };

  const competitionPayments = payments.filter((p) => !competition || p.competition_id === competition.id);
  const completedPaymentsCount = competitionPayments.filter((p) => p.status === 'completed').length;
  const competitionAttempts = attempts.filter((a) => !competition || a.competition_id === competition.id);
  const finishedAttemptsCount = competitionAttempts.filter((a) => a.status === 'passed' || a.status === 'failed').length;
  const pendingAttempt = competitionAttempts.find((a) => a.status === 'pending');
  const hasPaidButNotStartedQuiz = completedPaymentsCount > finishedAttemptsCount && !pendingAttempt;
  const competitionEntries = entries.filter((e) => !competition || e.competition_id === competition.id);
  const passedAttemptsCount = competitionAttempts.filter((a) => a.status === 'passed').length;
  const hasPendingCreativeSubmission = passedAttemptsCount > competitionEntries.length;
  const attemptsDoneCount = competitionAttempts.length;
  const attemptsRemainingCount = Math.max(10 - attemptsDoneCount, 0);
  const successfulEntries = competitionEntries.filter(
    (entry) => entry.content?.trim().split(/\s+/).filter(Boolean).length === 25
  );
  const shortlistedEntriesCount = competitionEntries.filter(
    (entry) => entry.is_shortlisted || entry.status === 'shortlisted'
  ).length;

  return (
    <ScreenShell>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        nestedScrollEnabled
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={NEON_CYAN} />
        }
      >
        <View style={styles.header}>
          <Text style={[styles.title, styles.textShadowed]}>Your Dashboard</Text>
          <TouchableOpacity onPress={handleLogout}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.statsCard}>
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{attemptsDoneCount}</Text>
              <Text style={styles.statLabel}>Attempts Done</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{attemptsRemainingCount}</Text>
              <Text style={styles.statLabel}>Attempts Remaining</Text>
            </View>
          </View>
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{successfulEntries.length}</Text>
              <Text style={styles.statLabel}>Successful Entries</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{shortlistedEntriesCount}</Text>
              <Text style={styles.statLabel}>Shortlisted Entries</Text>
            </View>
          </View>
        </View>

        {pendingAttempt ? (
          <TouchableOpacity style={styles.notificationCard} onPress={() => navigation.navigate('Quiz')} activeOpacity={0.85}>
            <Text style={styles.notificationTitle}>Resume Quiz</Text>
            <Text style={styles.notificationText}>
              You have an unfinished paid quiz attempt. Tap to continue your challenge.
            </Text>
            <Text style={styles.notificationLink}>Continue Quiz</Text>
          </TouchableOpacity>
        ) : null}

        {hasPaidButNotStartedQuiz ? (
          <TouchableOpacity style={styles.notificationCard} onPress={() => navigation.navigate('Quiz')} activeOpacity={0.85}>
            <Text style={styles.notificationTitle}>Quiz Pending</Text>
            <Text style={styles.notificationText}>
              Payment is complete, but your quiz has not been attempted yet. Tap to start now.
            </Text>
            <Text style={styles.notificationLink}>Start Quiz</Text>
          </TouchableOpacity>
        ) : null}

        {hasPendingCreativeSubmission ? (
          <TouchableOpacity
            style={styles.notificationCard}
            onPress={() => navigation.navigate('CreativeSubmission')}
            activeOpacity={0.85}
          >
            <Text style={styles.notificationTitle}>Creative Submission Pending</Text>
            <Text style={styles.notificationText}>
              Your quiz is passed, but your 25-word creative submission is not submitted yet.
            </Text>
            <Text style={styles.notificationLink}>Resume Submission</Text>
          </TouchableOpacity>
        ) : null}

        {competitionAttempts.some((a) => a.status === 'pending') ? (
          <TouchableOpacity style={styles.ctaWrap} onPress={() => navigation.navigate('Quiz')}>
            <LinearGradient colors={CTA_GRADIENT_COLORS} style={styles.newEntryBtn} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
              <Text style={styles.newEntryBtnText}>RESUME AI CHALLENGE</Text>
            </LinearGradient>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            testID="start-new-challenge"
            style={styles.ctaWrap}
            disabled={competitionAttempts.length >= 10}
            onPress={() => navigation.navigate('Eligibility')}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={competitionAttempts.length >= 10 ? ['#4A4A5C', '#3D3D4D'] : CTA_GRADIENT_COLORS}
              style={[styles.newEntryBtn, competitionAttempts.length >= 10 && styles.btnDisabled]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.newEntryBtnText}>
                {competitionAttempts.length >= 10 ? 'MAX CHALLENGES USED' : '+ START NEW AI CHALLENGE'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        )}

        <Text style={styles.sectionTitle}>All Quiz Attempts</Text>

        {attempts.length === 0 ? (
          <Text style={styles.emptyText}>No attempts yet.</Text>
        ) : (
          <ScrollView
            style={styles.listScroll}
            contentContainerStyle={styles.listScrollContent}
            nestedScrollEnabled
            showsVerticalScrollIndicator
          >
            {attempts.map((attempt) => (
              <View key={attempt.id} style={styles.entryCard}>
                <View style={styles.entryHeader}>
                  <Text style={styles.entryRef}>ATTEMPT-{attempt.attempt_number}</Text>
                  <Text
                    style={[
                      styles.entryStatus,
                      attempt.status === 'passed'
                        ? styles.statusPassed
                        : attempt.status === 'failed'
                          ? styles.statusFailed
                          : styles.statusPending,
                    ]}
                  >
                    {attempt.status.toUpperCase()}
                  </Text>
                </View>
                <Text style={styles.cardField}>Attempt ID: {attempt.id}</Text>
                <Text style={styles.cardField}>Score: {attempt.score}/5</Text>
                <Text style={styles.cardField}>{new Date(attempt.created_at).toLocaleString()}</Text>
              </View>
            ))}
          </ScrollView>
        )}

        <Text style={styles.sectionTitle}>Successful Entries (25 Words)</Text>

        {successfulEntries.length === 0 ? (
          <Text style={styles.emptyText}>No successful 25-word submissions yet.</Text>
        ) : (
          <ScrollView
            style={styles.listScroll}
            contentContainerStyle={styles.listScrollContent}
            nestedScrollEnabled
            showsVerticalScrollIndicator
          >
            {successfulEntries.map((entry) => (
              <TouchableOpacity
                key={entry.id}
                style={styles.entryCard}
                onPress={() => navigation.navigate('Result', { entryId: entry.id })}
              >
                <View style={styles.entryHeader}>
                  <Text style={styles.entryRef}>ENTRY-{entry.id}</Text>
                  <Text
                    style={[
                      styles.entryStatus,
                      entry.is_shortlisted || entry.status === 'shortlisted'
                        ? styles.statusShortlisted
                        : entry.status === 'scored'
                          ? styles.statusAccepted
                          : styles.statusPending,
                    ]}
                  >
                    {entry.is_shortlisted || entry.status === 'shortlisted'
                      ? 'Shortlisted'
                      : entry.status === 'scored'
                        ? 'Entry Accepted'
                        : 'Pending'}
                  </Text>
                </View>
                <Text style={styles.cardField}>Entry ID: {entry.id}</Text>
                <Text style={styles.cardField}>{new Date(entry.created_at).toLocaleDateString()}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        <AppFooter />
      </ScrollView>
    </ScreenShell>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: SCREEN_PADDING_H,
    paddingTop: 16,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 22,
    color: '#FFF',
    fontWeight: '900',
  },
  logoutText: {
    color: TEXT_MUTED,
    fontSize: 14,
    fontWeight: '600',
  },
  statsCard: {
    backgroundColor: CARD_BG,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    marginBottom: 24,
    paddingVertical: 10,
    paddingHorizontal: 12,
    gap: 8,
  },
  statsRow: {
    flexDirection: 'row',
  },
  notificationCard: {
    backgroundColor: CARD_BG,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 240, 255, 0.35)',
    marginBottom: 12,
    padding: 14,
  },
  notificationTitle: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '900',
    marginBottom: 6,
  },
  notificationText: {
    color: TEXT_MUTED,
    fontSize: 13,
    lineHeight: 19,
  },
  notificationLink: {
    color: NEON_CYAN,
    fontSize: 13,
    fontWeight: '800',
    marginTop: 10,
    textTransform: 'uppercase',
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 78,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  statValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFF',
  },
  statLabel: {
    fontSize: 12,
    color: TEXT_MUTED,
    textTransform: 'uppercase',
    marginTop: 4,
  },
  ctaWrap: {
    ...getShadow(NEON_BLUE, { width: 0, height: 8 }, 0.25, 15),
    elevation: 8,
    marginBottom: 32,
    borderRadius: 12,
    overflow: 'hidden',
  },
  newEntryBtn: {
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  newEntryBtnText: {
    color: '#FFF',
    fontWeight: '900',
    letterSpacing: 1.2,
    fontSize: 16,
    textTransform: 'uppercase',
  },
  btnDisabled: {
    opacity: 0.5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 12,
  },
  emptyText: {
    color: TEXT_MUTED,
    textAlign: 'center',
    marginTop: 16,
    fontSize: 14,
    lineHeight: 20,
  },
  listScroll: {
    maxHeight: 280,
    marginBottom: 12,
  },
  listScrollContent: {
    paddingBottom: 4,
  },
  entryCard: {
    backgroundColor: CARD_BG,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    padding: 18,
    marginBottom: 12,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  entryRef: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 15,
    flex: 1,
    marginRight: 12,
  },
  entryStatus: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'right',
  },
  statusAccepted: {
    color: '#F59E0B',
  },
  statusShortlisted: {
    color: '#00FF99',
  },
  statusPending: {
    color: '#00F0FF',
  },
  statusPassed: {
    color: '#00FF99',
  },
  statusFailed: {
    color: '#FF6B6B',
  },
  cardField: {
    color: TEXT_MUTED,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 6,
  },
  textShadowed: {
    ...getTextShadow(0.5, 4),
  },
});

export default DashboardScreen;
