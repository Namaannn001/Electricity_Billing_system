import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions, Easing } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

// Kinetic Ether Tokens
const COLORS = {
  background: '#0e0e0e',
  surface_low: '#131313',
  primary: '#81ecff',
  secondary: '#2ff801',
  on_surface: '#ffffff',
  on_surface_variant: '#adaaaa',
};

export default function AnimatedSplashScreen({ onFinish }: { onFinish: () => void }) {
  const fadeAnim = useRef(new Animated.Value(0)).current; 
  const pulseAnim = useRef(new Animated.Value(0)).current;
  const streamAnim = useRef(new Animated.Value(-100)).current; 
  const blinkAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim1 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // 1. Enter Sequence
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();

    // 2. Pulse Aura and Orbitals (Continuous)
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1, duration: 1500, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 0, duration: 1500, easing: Easing.inOut(Easing.ease), useNativeDriver: true })
      ])
    ).start();

    // 3. Status Dot Blinking
    Animated.loop(
      Animated.sequence([
        Animated.timing(blinkAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(blinkAnim, { toValue: 0, duration: 800, useNativeDriver: true })
      ])
    ).start();

    // 4. Kinetic Data Stream Loading Bar
    Animated.timing(streamAnim, {
      toValue: width, // Sweep across
      duration: 3500,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: true,
    }).start();

    // Rotate orbitals
    Animated.loop(
      Animated.timing(rotateAnim1, {
        toValue: 1,
        duration: 20000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    // Transition Out
    const timeout = setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 800,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }).start(() => {
        onFinish();
      });
    }, 4500);

    return () => clearTimeout(timeout);
  }, []);

  const spin1 = rotateAnim1.interpolate({ inputRange: [0, 1], outputRange: ['-3deg', '357deg'] });
  const spin2 = rotateAnim1.interpolate({ inputRange: [0, 1], outputRange: ['6deg', '-354deg'] });

  return (
    <View style={styles.container}>
      {/* Visual Polish: Decorative Asymmetric Elements */}
      <View style={[styles.ambientGlow, styles.topRightGlow]} />
      <View style={[styles.ambientGlow, styles.bottomLeftGlow]} />

      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        
        {/* Logo Energy Core */}
        <View style={styles.logoWrapper}>
          {/* Pulsing Outer Aura */}
          <Animated.View style={[
            styles.pulseAura, 
            { 
              transform: [{ scale: pulseAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.5] }) }],
              opacity: pulseAnim.interpolate({ inputRange: [0, 1], outputRange: [0.1, 0.3] })
            }
          ]} />

          {/* Main Logo Housing */}
          <View style={styles.logoHousing}>
            <MaterialIcons name="bolt" size={80} color={COLORS.primary} style={styles.boltIcon} />
            
            {/* Decorative Orbitals */}
            <Animated.View style={[styles.orbital, styles.orbital1, { transform: [{ rotate: spin1 }, { scale: 1.1 }] }]} />
            <Animated.View style={[styles.orbital, styles.orbital2, { transform: [{ rotate: spin2 }, { scale: 1.25 }] }]} />
          </View>
        </View>

        {/* Branding & Identity */}
        <View style={styles.brandingWrapper}>
          <Text style={styles.brandTitle}>EEBS</Text>
          <Text style={styles.tagline}>
            Smart Electricity. <Text style={styles.taglineHighlight}>Smarter Billing.</Text>
          </Text>
        </View>

        {/* Kinetic Data Stream Decorator */}
        <View style={styles.dataStreamTrack}>
          <Animated.View style={[styles.dataStreamBar, { transform: [{ translateX: streamAnim }] }]}>
            <LinearGradient
              colors={['transparent', COLORS.primary, 'transparent']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={StyleSheet.absoluteFill}
            />
          </Animated.View>
        </View>

        {/* Status Indicator */}
        <View style={styles.statusWrapper}>
          <View style={styles.dotContainer}>
            <Animated.View style={[styles.dotPing, { opacity: blinkAnim, transform: [{ scale: blinkAnim.interpolate({ inputRange: [0,1], outputRange: [1,2] }) }] }]} />
            <View style={styles.dotCore} />
          </View>
          <Text style={styles.statusText}>INITIALIZING KINETIC GRID</Text>
        </View>

      </Animated.View>

      {/* Footnote Information */}
      <Animated.View style={[styles.footer, { opacity: fadeAnim }]}>
        <Text style={styles.footerText}>© 2026 KINETIC ETHER GLOBAL</Text>
        <View style={styles.secureLinkWrapper}>
          <MaterialIcons name="lock-outline" size={12} color={COLORS.on_surface_variant} />
          <Text style={styles.secureText}>SECURE LINK ESTABLISHED</Text>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background, // bg-background
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  ambientGlow: {
    position: 'absolute',
    width: 600,
    height: 600,
    borderRadius: 300,
  },
  topRightGlow: {
    top: -300,
    right: -200,
    backgroundColor: COLORS.primary,
    opacity: 0.05,
  },
  bottomLeftGlow: {
    bottom: -300,
    left: -200,
    backgroundColor: COLORS.secondary,
    opacity: 0.05,
  },
  content: {
    alignItems: 'center',
    width: '100%',
    padding: 24,
  },
  logoWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 160,
    height: 160,
  },
  pulseAura: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: COLORS.primary,
  },
  logoHousing: {
    width: 120,
    height: 120,
    backgroundColor: COLORS.surface_low,
    borderRadius: 24, // xl
    borderWidth: 1,
    borderColor: 'rgba(129,236,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 25,
    elevation: 10,
  },
  boltIcon: {
    textShadowColor: 'rgba(129,236,255,0.8)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 15,
  },
  orbital: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 24,
    borderWidth: 1,
  },
  orbital1: {
    borderColor: 'rgba(129,236,255,0.2)',
  },
  orbital2: {
    borderColor: 'rgba(47,248,1,0.2)', // secondary/20
  },
  brandingWrapper: {
    alignItems: 'center',
    marginTop: 48,
  },
  brandTitle: {
    fontSize: 64, // text-7xl equivalent
    fontWeight: '900',
    color: '#ffffff',
    textTransform: 'uppercase',
    letterSpacing: -2,
    textShadowColor: COLORS.primary,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10, // Simulating the shimmer-text drop shadow
  },
  tagline: {
    fontSize: 16,
    color: COLORS.on_surface_variant,
    fontWeight: '300',
    letterSpacing: 2,
    marginTop: 8,
  },
  taglineHighlight: {
    color: COLORS.secondary,
    fontWeight: '500',
  },
  dataStreamTrack: {
    width: 200,
    height: 4,
    backgroundColor: COLORS.surface_highest,
    borderRadius: 2,
    marginTop: 64,
    overflow: 'hidden',
  },
  dataStreamBar: {
    width: 100, // half width
    height: '100%',
  },
  statusWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 32,
  },
  dotContainer: {
    width: 8,
    height: 8,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dotCore: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.secondary,
  },
  dotPing: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.secondary,
  },
  statusText: {
    fontSize: 10,
    color: COLORS.on_surface_variant,
    fontWeight: '700', // font-bold
    textTransform: 'uppercase',
    letterSpacing: 2, // tracking-[0.2em]
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 30,
    alignItems: 'center',
    opacity: 0.4,
  },
  footerText: {
    fontSize: 10,
    color: COLORS.on_surface_variant,
    textTransform: 'uppercase',
    letterSpacing: -0.5,
  },
  secureLinkWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  secureText: {
    fontSize: 10,
    color: COLORS.on_surface_variant,
    textTransform: 'uppercase',
    letterSpacing: -0.5,
    marginLeft: 6,
  }
});
