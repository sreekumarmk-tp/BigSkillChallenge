import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import GradientBackground from '../components/GradientBackground';
import { COLORS, SIZES, GLOBAL_STYLES } from '../theme/constants';

const AuthScreen = ({ navigation }) => {
  return (
    <GradientBackground>
      <View style={styles.container}>
        <View style={[GLOBAL_STYLES.glassCard, styles.card]}>
          <Text style={styles.title}>Auth Screen</Text>
          <TouchableOpacity 
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    </GradientBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.padding,
  },
  card: {
    width: '100%',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    color: '#fff',
    marginBottom: 20,
    fontWeight: 'bold',
  },
  backBtn: {
    backgroundColor: COLORS.primary.orangeStart,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: SIZES.btnRadius,
  },
  backText: {
    color: '#fff',
    fontWeight: 'bold',
  }
});

export default AuthScreen;
