import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import GradientBackground from '../components/GradientBackground';
import { COLORS, SIZES, GLOBAL_STYLES } from '../theme/constants';

const EntryAcceptedScreen = ({ route, navigation }) => {
  const { entryId } = route.params || { entryId: 'UNKNOWN' };

  return (
    <GradientBackground>
      <SafeAreaView style={GLOBAL_STYLES.container}>
        <View style={styles.content}>
          <Text style={styles.icon}>🎯</Text>
          <Text style={styles.title}>Entry Accepted</Text>
          <Text style={styles.subtitle}>Reference: ENTRY-{entryId}</Text>
          
          <View style={GLOBAL_STYLES.glassCard}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Word Count Check:</Text>
              <Text style={styles.detailValueSuccess}>Passed (25 words)</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Originality Check:</Text>
              <Text style={styles.detailValueSuccess}>Passed</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Status:</Text>
              <Text style={styles.detailValue}>Pending AI Evaluation</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Dashboard')}>
            <Text style={styles.buttonText}>Return to Dashboard</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </GradientBackground>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
    padding: SIZES.padding * 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    fontSize: 64,
    marginBottom: SIZES.padding,
  },
  title: {
    fontSize: 28,
    color: '#3B82F6', // Blue like the prototype
    fontWeight: 'bold',
    marginBottom: SIZES.base,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.text.secondary,
    marginBottom: SIZES.padding * 2,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SIZES.base,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.glass.border,
  },
  detailLabel: {
    color: COLORS.text.secondary,
    fontSize: 16,
  },
  detailValue: {
    color: COLORS.text.primary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  detailValueSuccess: {
    color: COLORS.feedback.success,
    fontSize: 16,
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: COLORS.primary.orangeStart,
    padding: SIZES.padding,
    borderRadius: SIZES.btnRadius,
    alignItems: 'center',
    marginTop: SIZES.padding * 3,
    width: '100%',
  },
  buttonText: {
    color: COLORS.text.primary,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default EntryAcceptedScreen;
