import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppContext } from '../context/AppContext';
import api from '../services/api';
import GradientBackground from '../components/GradientBackground';
import { COLORS, SIZES, GLOBAL_STYLES } from '../theme/constants';

const DashboardScreen = ({ navigation }) => {
  const { logout } = useContext(AppContext);
  const [entries, setEntries] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchEntries = async () => {
    try {
      const res = await api.get('/submissions/me');
      setEntries(res.data);
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, []);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchEntries().then(() => setRefreshing(false));
  }, []);

  return (
    <GradientBackground>
      <SafeAreaView style={GLOBAL_STYLES.container}>
        <ScrollView 
          contentContainerStyle={styles.content}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.text.primary} />}
        >
          <View style={styles.header}>
            <Text style={styles.title}>Your Dashboard</Text>
            <TouchableOpacity onPress={() => logout()}>
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
          </View>
          
          <View style={[GLOBAL_STYLES.glassCard, styles.statsCard]}>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{entries.length}</Text>
              <Text style={styles.statLabel}>Entries Used</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{10 - entries.length}</Text>
              <Text style={styles.statLabel}>Slots Left</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.newEntryBtn} onPress={() => navigation.navigate('Eligibility')}>
            <Text style={styles.newEntryBtnText}>+ START NEW ENTRY</Text>
          </TouchableOpacity>

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
                  <Text style={[styles.entryStatus, entry.status === 'scored' ? styles.statusScored : styles.statusPending]}>
                    {entry.status === 'scored' ? 'View Result' : 'Pending'}
                  </Text>
                </View>
                <Text style={styles.entryDate}>{new Date(entry.created_at).toLocaleDateString()}</Text>
              </TouchableOpacity>
            ))
          )}
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
  title: {
    fontSize: 28,
    color: COLORS.text.primary,
    fontWeight: 'bold',
  },
  logoutText: {
    color: '#9CA3AF',
    fontSize: 14,
  },
  statsCard: {
    flexDirection: 'row',
    marginBottom: SIZES.padding * 2,
    padding: SIZES.padding * 1.5,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.text.primary,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.text.secondary,
    textTransform: 'uppercase',
    marginTop: SIZES.base / 2,
  },
  statDivider: {
    width: 1,
    backgroundColor: COLORS.glass.border,
  },
  newEntryBtn: {
    backgroundColor: COLORS.glass.bg,
    borderColor: COLORS.primary.orangeStart,
    borderWidth: 1,
    padding: SIZES.padding,
    borderRadius: SIZES.radius,
    alignItems: 'center',
    marginBottom: SIZES.padding * 3,
  },
  newEntryBtnText: {
    color: COLORS.primary.orangeStart,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginBottom: SIZES.padding,
  },
  emptyText: {
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginTop: SIZES.padding * 2,
  },
  entryCard: {
    backgroundColor: COLORS.glass.bg,
    borderColor: COLORS.glass.border,
    borderWidth: 1,
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    marginBottom: SIZES.padding,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SIZES.base,
  },
  entryRef: {
    color: COLORS.text.primary,
    fontWeight: 'bold',
    fontSize: 16,
  },
  entryStatus: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  statusScored: {
    color: '#3B82F6',
  },
  statusPending: {
    color: COLORS.primary.orangeStart,
  },
  entryDate: {
    color: COLORS.text.secondary,
    fontSize: 12,
  }
});

export default DashboardScreen;
