import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, RefreshControl } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AppContext } from '../context/AppContext';
import api from '../services/api';
import ScreenShell from '../components/ScreenShell';
import AppFooter from '../components/AppFooter';
import {
  NEON_CYAN,
  NEON_PURPLE,
  CARD_BG,
  TEXT_MUTED,
  CTA_GRADIENT_COLORS,
  SCREEN_PADDING_H,
} from '../theme/neonTheme';

const DashboardScreen = ({ navigation }) => {
  const { logout, competition } = useContext(AppContext);
  const [entries, setEntries] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      const resEntries = await api.get('/submissions/me');
      setEntries(resEntries.data || []);

      if (competition) {
        const resAttempts = await api.get(`/quiz/attempts/${competition.id}`);
        setAttempts(resAttempts.data || []);
      }
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

  return (
    <ScreenShell>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={NEON_CYAN} />
        }
      >
        <View style={styles.header}>
          <Text style={styles.title}>Your Dashboard</Text>
          <TouchableOpacity onPress={handleLogout}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.statsCard}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{attempts.length}</Text>
            <Text style={styles.statLabel}>Quiz Attempts</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{10 - attempts.length}</Text>
            <Text style={styles.statLabel}>Attempts Left</Text>
          </View>
        </View>

        {attempts.some((a) => a.status === 'pending') ? (
          <TouchableOpacity style={styles.ctaWrap} onPress={() => navigation.navigate('Quiz')}>
            <LinearGradient colors={CTA_GRADIENT_COLORS} style={styles.newEntryBtn} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
              <Text style={styles.newEntryBtnText}>RESUME YOUR QUIZ</Text>
            </LinearGradient>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.ctaWrap}
            disabled={attempts.length >= 10}
            onPress={() => navigation.navigate('Eligibility')}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={attempts.length >= 10 ? ['#4A4A5C', '#3D3D4D'] : CTA_GRADIENT_COLORS}
              style={[styles.newEntryBtn, attempts.length >= 10 && styles.btnDisabled]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.newEntryBtnText}>
                {attempts.length >= 10 ? 'MAX ATTEMPTS USED' : '+ START NEW ENTRY'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        )}

        <Text style={styles.sectionTitle}>Recent Entries</Text>

        {entries.length === 0 ? (
          <Text style={styles.emptyText}>No entries yet. Start one above!</Text>
        ) : (
          entries.map((entry) => (
            <TouchableOpacity
              key={entry.id}
              style={styles.entryCard}
              onPress={() => navigation.navigate('Result', { entryId: entry.id })}
            >
              <View style={styles.entryHeader}>
                <Text style={styles.entryRef}>ENTRY-{entry.id}</Text>
                <Text
                  style={[styles.entryStatus, entry.status === 'scored' ? styles.statusScored : styles.statusPending]}
                >
                  {entry.status === 'scored' ? 'View Result' : 'Pending'}
                </Text>
              </View>
              <Text style={styles.entryDate}>{new Date(entry.created_at).toLocaleDateString()}</Text>
            </TouchableOpacity>
          ))
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
    flexDirection: 'row',
    backgroundColor: CARD_BG,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    marginBottom: 24,
    padding: 20,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
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
  statDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  ctaWrap: {
    shadowColor: NEON_PURPLE,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 15,
    elevation: 8,
    marginBottom: 32,
    borderRadius: 12,
    overflow: 'hidden',
  },
  newEntryBtn: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  newEntryBtnText: {
    color: '#FFF',
    fontWeight: 'bold',
    letterSpacing: 1,
    fontSize: 15,
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
  entryCard: {
    backgroundColor: CARD_BG,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    padding: 16,
    marginBottom: 12,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  entryRef: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  entryStatus: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  statusScored: {
    color: NEON_CYAN,
  },
  statusPending: {
    color: NEON_PURPLE,
  },
  entryDate: {
    color: TEXT_MUTED,
    fontSize: 12,
  },
});

export default DashboardScreen;
