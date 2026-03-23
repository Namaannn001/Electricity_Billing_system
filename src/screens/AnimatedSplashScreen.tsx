import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

export default function AnimatedSplashScreen({ onFinish }: { onFinish: () => void }) {
  const [progressText, setProgressText] = useState('0%');
  const [loadingMsg, setLoadingMsg] = useState('ALLOCATING NEURAL PATHWAYS...');

  const fadeAnim = useRef(new Animated.Value(0)).current; 
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const lineSweepAnim = useRef(new Animated.Value(-height)).current;
  
  useEffect(() => {
    // 1. Fade the whole logo in and slightly scale up
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        tension: 30,
        useNativeDriver: true,
      }),
    ]).start();

    // 2. Animate the progress bar width over 3.5 seconds
    Animated.timing(progressAnim, {
      toValue: width * 0.7,
      duration: 3500,
      useNativeDriver: false,
    }).start();

    // 3. Constant sweeping scanner line back and forth
    Animated.loop(
      Animated.sequence([
        Animated.timing(lineSweepAnim, {
          toValue: height,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(lineSweepAnim, {
          toValue: -height,
          duration: 3000,
          useNativeDriver: true,
        })
      ])
    ).start();

    // Emulate progress ticking and loading text
    let counter = 0;
    const interval = setInterval(() => {
      counter += Math.floor(Math.random() * 15) + 5; 
      if (counter > 100) counter = 100;
      setProgressText(`${counter}%`);
      
      if (counter >= 30 && counter < 60) setLoadingMsg('AUTHENTICATING GRID NODES...');
      if (counter >= 60 && counter < 95) setLoadingMsg('SYNCING PREDICTIVE MODELS...');
      if (counter >= 95) setLoadingMsg('CONNECTION ESTABLISHED. ⚡');
    }, 300);

    // Fade out and finish after 4.5 seconds
    const timeout = setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start(() => {
        onFinish();
      });
    }, 4500);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, []);

  return (
    <View style={styles.container}>
      {/* Background Orbs */}
      <View style={[styles.orb, styles.orbTop]} />
      <View style={[styles.orb, styles.orbBottom]} />

      {/* Cyberpunk Scanning Line */}
      <Animated.View style={[styles.scannerLine, { transform: [{ translateY: lineSweepAnim }]}]} />

      <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
        {/* Glow Logo */}
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>EE<Text style={styles.aiText}>BS</Text></Text>
          <Text style={styles.subLogoText}>SYSTEM INTELLIGENCE</Text>
        </View>

        {/* Console loading area */}
        <View style={styles.loadingConsole}>
          <Text style={styles.consoleText}>{loadingMsg}</Text>
          <View style={styles.progressTrack}>
             <Animated.View style={{ width: progressAnim, height: '100%' }}>
                <LinearGradient
                  colors={['#8B5CF6', '#00E5FF']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={{ flex: 1, borderRadius: 10 }}
                />
             </Animated.View>
          </View>
          <Text style={styles.progressPercent}>{progressText}</Text>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0F19', // Deep dark mode core
    justifyContent: 'center',
    alignItems: 'center',
  },
  orb: { position: 'absolute', width: 400, height: 400, borderRadius: 200, opacity: 0.15 },
  orbTop: { top: -100, right: -100, backgroundColor: '#00E5FF' },
  orbBottom: { bottom: -100, left: -100, backgroundColor: '#8B5CF6' },
  
  scannerLine: {
    position: 'absolute',
    width: '100%',
    height: 3,
    backgroundColor: '#00E5FF',
    opacity: 0.4,
    shadowColor: '#00E5FF',
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 10,
    zIndex: 0
  },
  content: {
    alignItems: 'center',
    width: '100%',
    zIndex: 10
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 80,
  },
  logoText: {
    fontSize: 54,
    fontWeight: '900',
    color: '#F8FAFC',
    letterSpacing: 4,
    textShadowColor: 'rgba(0, 229, 255, 0.4)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  aiText: {
    color: '#00E5FF',
  },
  subLogoText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#8B5CF6',
    letterSpacing: 8,
    marginTop: 5,
  },
  loadingConsole: {
    width: '80%',
    alignItems: 'center',
  },
  consoleText: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 2,
    marginBottom: 15,
  },
  progressTrack: {
    width: '100%',
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 10,
  },
  progressPercent: {
    color: '#00E5FF',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 2,
  }
});
