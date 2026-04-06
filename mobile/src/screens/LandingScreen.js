import React, { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { AppContext } from '../context/AppContext';
import GradientBackground from '../components/GradientBackground';
import { COLORS, SIZES, GLOBAL_STYLES } from '../theme/constants';

const LandingScreen = ({ navigation }) => {
  const { userToken } = useContext(AppContext);

  React.useEffect(() => {
    if (userToken) {
      navigation.navigate('Dashboard');
    }
  }, [userToken]);

  return (
    <GradientBackground>
      <View style={styles.container}>
        <View style={styles.badgeContainer}>
          <Text style={styles.badgeText}>BIG WIN</Text>
        </View>

        <View style={[GLOBAL_STYLES.glassCard, styles.contentCard]}>
          <Text style={styles.title}>The 25-Word Challenge</Text>
          <Text style={styles.subtitle}>Test your creativity and win!</Text>
          
          <TouchableOpacity 
            style={styles.ctaButton}
            onPress={() => navigation.navigate('Auth')}
          >
            <Text style={styles.ctaText}>ENTER NOW</Text>
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
  badgeContainer: {
    marginBottom: 40,
    padding: 10,
    backgroundColor: COLORS.feedback.info,
    borderRadius: 20,
  },
  badgeText: {
    color: '#000',
    fontWeight: 'bold',
  },
  contentCard: {
    width: '100%',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.text.secondary,
    marginBottom: 30,
  },
  ctaButton: {
    backgroundColor: COLORS.primary.orangeStart,
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: SIZES.btnRadius,
    width: '100%',
    alignItems: 'center',
  },
  ctaText: {
    color: COLORS.text.primary,
    fontWeight: 'bold',
    fontSize: 18,
  }
});

export default LandingScreen;
