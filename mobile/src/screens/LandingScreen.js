import React, { useContext, useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated, Image, ImageBackground } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AppContext } from '../context/AppContext';
import ScreenShell from '../components/ScreenShell';
import AppFooter from '../components/AppFooter';
import { NEON_CYAN, NEON_BLUE, DARK_BG, CARD_BG, TEXT_MUTED, PREMIUM_GOLD, GOLD_GRADIENT, getShadow, getTextShadow, neonStyles } from '../theme/neonTheme';
/** Warm amber blocks — pairs with neon accents on dark UI */
const COUNTDOWN_AMBER = '#F5C542';
const COUNTDOWN_NUMBER = '#0B0D17';

const DEFAULT_COMPETITION_START = new Date('2026-01-30T00:00:00');
const DEFAULT_COMPETITION_END = new Date('2026-04-29T23:59:59');

function getTimeLeft(endDate) {
  const end = endDate.getTime();
  const now = Date.now();
  const diff = Math.max(0, end - now);
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);
  return { days, hours, minutes, seconds };
}

const LandingScreen = ({ navigation }) => {
  const { userToken, isEmailVerified, competition } = useContext(AppContext);
  const [timeLeft, setTimeLeft] = useState(() => getTimeLeft(DEFAULT_COMPETITION_END));
  
  // Animation values
  const [fadeAnim] = useState(new Animated.Value(0)); // Hero section fade
  const [prizeFade] = useState(new Animated.Value(0)); // Prize info fade

  useEffect(() => {
    Animated.stagger(300, [
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(prizeFade, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useEffect(() => {
    if (userToken && isEmailVerified) {
      navigation.navigate('Dashboard');
    }
  }, [userToken, isEmailVerified, navigation]);

  useEffect(() => {
    const endDate = competition?.end_date ? new Date(competition.end_date) : DEFAULT_COMPETITION_END;
    const tick = () => setTimeLeft(getTimeLeft(endDate));
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [competition?.end_date]);

  const formatNumber = (num) => String(num).padStart(2, '0');
  const formatDisplayDate = (value, fallbackDate) => {
    const date = value ? new Date(value) : fallbackDate;
    const day = date.getDate();
    const month = date.toLocaleString('en-US', { month: 'long' });
    const year = date.getFullYear();
    const mod10 = day % 10;
    const mod100 = day % 100;
    const suffix =
      mod10 === 1 && mod100 !== 11 ? 'st' :
      mod10 === 2 && mod100 !== 12 ? 'nd' :
      mod10 === 3 && mod100 !== 13 ? 'rd' : 'th';
    return `${day}${suffix} ${month} ${year}`;
  };

  const startDateText = formatDisplayDate(competition?.start_date, DEFAULT_COMPETITION_START);
  const endDateText = formatDisplayDate(competition?.end_date, DEFAULT_COMPETITION_END);
  const entryFee = Number(competition?.entry_fee ?? 2.99).toFixed(2);

  return (
    <ScreenShell>
      <ScrollView contentContainerStyle={styles.scrollContent} bounces={false} nestedScrollEnabled keyboardShouldPersistTaps="handled">
        
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <MaterialCommunityIcons name="gamepad-variant" size={24} color={NEON_BLUE} />
            <Text style={styles.logoText}>
              <Text style={{color: NEON_CYAN}}>BIG </Text>AI CHALLENGE
            </Text>
          </View>
          <TouchableOpacity
            testID="landing-login-button"
            style={styles.loginBtn}
            onPress={() => navigation.navigate('Auth', { mode: 'login' })}
          >
            <Text style={styles.loginText}>LOGIN</Text>
          </TouchableOpacity>
        </View>

        {/* Hero Section */}
        <Animated.View style={[styles.heroSection, { opacity: fadeAnim }]}>
          <View style={styles.heroBgContainer}>
            <Animated.Image 
              source={require('../../assets/domain/hero_bg.png')} 
              style={styles.heroBgImage}
              resizeMode="cover"
            />
            <LinearGradient
              colors={['rgba(9,11,18,0)', 'rgba(9,11,18,0.4)', DARK_BG]}
              style={styles.heroOverlay}
            />
          </View>
          
          <View style={styles.badge}>
            <Text style={styles.badgeText}>SKILL COMPETITION</Text>
          </View>

          <Text style={[styles.titleLineOne, styles.textShadowed]}>
            WIN A <Text style={styles.titlePrice}>1-YEAR</Text>
          </Text>
          <Text style={[styles.titleLineTwo, styles.textShadowed]}>OPENAI SUBSCRIPTION</Text>

          <Animated.View style={{ opacity: prizeFade }}>
            <Text style={[styles.subtitle, styles.textShadowed]}>
              Master Generative AI - Solve the Challenge - Win the Prize
            </Text>
            <View style={styles.dateLabel}>
              <MaterialCommunityIcons name="calendar-clock" size={14} color={NEON_CYAN} />
              <Text style={styles.dateText}>Starts {startDateText} · Ends {endDateText}</Text>
            </View>
          </Animated.View>

          {/* Timer Card — amber blocks + labels (reference layout), theme-aligned */}
          <View style={styles.timerCard}>
            <View style={styles.countdownRow}>
              {[
                { label: 'Days', value: timeLeft.days },
                { label: 'Hours', value: timeLeft.hours },
                { label: 'Minutes', value: timeLeft.minutes },
                { label: 'Seconds', value: timeLeft.seconds },
              ].map(({ label, value }) => (
                <View key={label} style={styles.countdownUnit}>
                  <View style={styles.countdownBlock}>
                    <Text style={styles.countdownNumber} numberOfLines={1}>
                      {formatNumber(value)}
                    </Text>
                  </View>
                  <Text style={styles.countdownLabel}>{label}</Text>
                </View>
              ))}
            </View>

            {/* <View style={styles.timerDividerFull} /> */}

            {/* <View style={styles.playerCountContainer}>
              <Text style={styles.playerCount}>9.2k</Text>
              <Text style={styles.playerLabel}>PLAYERS</Text>
            </View> */}
          </View>

          {/* CTA */}
          <TouchableOpacity 
            testID="landing-enter-button"
            style={styles.ctaButtonWrapper}
            onPress={() => navigation.navigate('Auth')}
          >
            <LinearGradient
              colors={['#8EFFFF', NEON_CYAN, '#00C4CC']}
              style={styles.ctaButton}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 0}}
            >
              <Text style={styles.ctaText}>ENTER FOR $ {entryFee}</Text>
            </LinearGradient>
          </TouchableOpacity>

          <View style={styles.trustIndicatorsRow}>
            <View style={styles.trustIndicatorItem}>
              <MaterialCommunityIcons name="login-variant" size={14} color={NEON_CYAN} />
              <Text style={styles.trustIndicatorText}>$ {entryFee} per attempt · Max 10 attempts per participant · AI Skill-based</Text>
            </View>
          </View>

          <Animated.View style={[styles.prizePreviewContainer, { opacity: prizeFade }]}>
            <Image 
              source={require('../../assets/domain/prize_card.png')} 
              style={styles.prizeCardSmall}
              resizeMode="contain"
            />
          </Animated.View>
        </Animated.View>



        {/* Global Trust Standards */}
        <View style={styles.trustStandardsSection}>
          <Text style={styles.trustStandardsTitle}>GLOBAL TRUST STANDARDS</Text>
          <View style={styles.trustStandardsDivider} />

          {[{
            title: 'FULLY REGULATED', desc: 'Transparent competition standards since 2018.', icon: 'check-decagram'
          }, {
            title: 'BANK-GRADE PRIVACY', desc: '256-bit encryption on every transaction.', icon: 'shield-check'
          }, {
            title: 'VERIFIED WINNERS', desc: 'Human judges ensure pure skill expression.', icon: 'ribbon'
          }].map((item, index) => (
            <View key={index} style={styles.trustStandardItem}>
              <MaterialCommunityIcons name={item.icon} size={24} color={NEON_CYAN} style={styles.trustStandardIcon} />
              <View style={styles.trustStandardTextContent}>
                <Text style={styles.trustStandardItemTitle}>{item.title}</Text>
                <Text style={styles.trustStandardItemDesc}>{item.desc}</Text>
              </View>
            </View>
          ))}
        </View>

        <AppFooter />

      </ScrollView>
    </ScreenShell>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    paddingTop: 30,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '900',
    // fontStyle: 'italic',
    // letterSpacing: 0.8,
  },
  loginBtn: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  loginText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  heroSection: {
    paddingHorizontal: 20,
    paddingTop: 10,
    alignItems: 'flex-start',
    position: 'relative',
    minHeight: 480,
  },
  heroBgContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: -1,
    overflow: 'hidden',
  },
  heroBgImage: {
    width: '100%',
    height: '110%', // Slight overflow for parallax if needed later
    position: 'absolute',
    top: -20,
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  heroGradientOverlay: {
    position: 'absolute',
    top: -100,
    left: 0,
    right: 0,
    height: 300,
    zIndex: -1,
  },
  badge: {
    borderWidth: 1,
    borderColor: 'rgba(0, 240, 255, 0.4)',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginBottom: 16,
    backgroundColor: 'rgba(0, 240, 255, 0.1)'
  },
  badgeText: {
    color: NEON_CYAN,
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  titleLineOne: {
    fontSize: 38,
    fontWeight: 'bold',
    color: '#FFF',
    letterSpacing: -0.5,
  },
  titlePrice: {
    color: PREMIUM_GOLD,
    fontStyle: 'italic',
  },
  titleLineTwo: {
    fontSize: 38,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  subtitle: {
    color: TEXT_MUTED,
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 8,
    paddingRight: 20,
  },
  dateLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 30,
  },
  dateText: {
    color: NEON_CYAN,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  timerCard: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    paddingVertical: 20,
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  countdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
    // marginBottom: 16,
  },
  countdownUnit: {
    flex: 1,
    alignItems: 'center',
    minWidth: 0,
  },
  countdownBlock: {
    width: '100%',
    maxWidth: 76,
    aspectRatio: 1,
    maxHeight: 76,
    backgroundColor: COUNTDOWN_AMBER,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 240, 255, 0.15)',
  },
  countdownNumber: {
    color: COUNTDOWN_NUMBER,
    fontSize: 22,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  countdownLabel: {
    color: TEXT_MUTED,
    fontSize: 12,
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'center',
  },
  timerDividerFull: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginBottom: 16,
  },
  playerCountContainer: {
    alignItems: 'center',
  },
  playerCount: {
    color: '#FFF',
    fontSize: 22,
    fontWeight: 'bold',
    fontStyle: 'italic',
  },
  playerLabel: {
    color: TEXT_MUTED,
    fontSize: 10,
    marginTop: 2,
  },
  ctaButtonWrapper: {
    ...getShadow(NEON_CYAN, { width: 0, height: 10 }, 0.3, 20),
    elevation: 10,
    marginBottom: 24,
    width: '100%',
    alignSelf: 'stretch',
  },
  ctaButton: {
    width: '100%',
    paddingVertical: 20,
    paddingHorizontal: 30,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaText: {
    color: DARK_BG,
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  trustIndicatorsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  prizePreviewContainer: {
    width: '100%',
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  prizeCardSmall: {
    width: '100%',
    height: '100%',
  },
  trustIndicatorItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  trustIndicatorText: {
    color: TEXT_MUTED,
    fontSize: 10,
    fontWeight: '600',
  },

  trustStandardsSection: {
    backgroundColor: '#000',
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 24,
    marginBottom: 40,
  },
  trustStandardsTitle: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    letterSpacing: 1,
    marginBottom: 16,
  },
  trustStandardsDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    width: '40%',
    alignSelf: 'center',
    marginBottom: 24,
  },
  trustStandardItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  trustStandardIcon: {
    marginTop: 2,
    marginRight: 16,
  },
  trustStandardTextContent: {
    flex: 1,
  },
  trustStandardItemTitle: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  trustStandardItemDesc: {
    color: TEXT_MUTED,
    fontSize: 11,
    lineHeight: 16,
  },
  footerLinksRow: {
    flexDirection: 'row',
    gap: 24,
  },
  footerLink: {
    color: TEXT_MUTED,
    fontSize: 10,
    letterSpacing: 1,
  },
  textShadowed: {
    ...getTextShadow(),
  },
});

export default LandingScreen;
