import React, { useState, useContext, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, Dimensions, Animated, Easing, ScrollView, SafeAreaView } from 'react-native';
import { AuthContext, Role } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { isValidEmail, showError } from '../utils/validators';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { MaterialIcons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');
const IS_SMALL_DEVICE = width < 380;

const COLORS = {
  background: '#0e0e0e',
  surface_low: '#131313',
  surface_highest: '#262626',
  primary: '#81ecff',
  primary_dim: '#00d4ec',
  primary_container: '#00e3fd',
  secondary: '#2ff801',
  on_surface: '#ffffff',
  on_surface_variant: '#adaaaa',
  outline_variant: '#494847',
};

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>('customer');
  const [activeInput, setActiveInput] = useState<string | null>(null);

  const { login } = useContext(AuthContext);
  const navigation: any = useNavigation();

  // Animations
  const rippleAnim = useRef(new Animated.Value(0)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(rippleAnim, {
        toValue: 1,
        duration: 4000,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const handlePressIn = () => {
    Animated.spring(buttonScale, { toValue: 0.95, useNativeDriver: true }).start();
  };
  const handlePressOut = () => {
    Animated.spring(buttonScale, { toValue: 1, useNativeDriver: true }).start();
  };

  const handleLogin = async () => {
    if (!email || !password) {
      showError('Please enter email and password');
      return;
    }
    if (!isValidEmail(email)) {
      showError('Please enter a valid email address');
      return;
    }
    try {
      await login(email.trim(), password, role);
    } catch (error: any) {
      showError(error.message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Background Energy Ripples / Ambient Glow */}
      <View style={styles.ambientGlowTop} />
      <View style={styles.ambientGlowBottom} />
      
      <Animated.View style={[
        styles.rippleRing,
        {
          transform: [{ scale: rippleAnim.interpolate({ inputRange: [0, 1], outputRange: [0.5, 1.5] }) }],
          opacity: rippleAnim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, 0.15, 0] })
        }
      ]} pointerEvents="none" />

      {/* Top Header - Kept out of ScrollView so it doesn't move */}
      <View style={styles.topHeader}>
        <View style={styles.logoRow}>
          <MaterialIcons name="bolt" size={24} color={COLORS.primary} />
          <Text style={styles.headerTitle}>KINETIC ETHER</Text>
        </View>
        <Text style={styles.versionText}>Energy Grid v2.4</Text>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardView}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <BlurView intensity={30} tint="dark" style={styles.glassCard}>
            
            <View style={styles.cardHeader}>
              <Text style={styles.mainHeading}>Powering Up.</Text>
              <Text style={styles.subHeading}>Access your enterprise energy management dashboard.</Text>
            </View>

            {/* Role Toggle */}
            <View style={styles.toggleContainer}>
              <TouchableOpacity 
                style={[styles.toggleBtn, role === 'customer' && styles.toggleBtnActiveCustomer]} 
                onPress={() => setRole('customer')}
                activeOpacity={0.8}
              >
                <Text style={[styles.toggleText, role === 'customer' && styles.toggleTextActiveCustomer]}>Customer</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.toggleBtn, role === 'admin' && styles.toggleBtnActiveAdmin]} 
                onPress={() => setRole('admin')}
                activeOpacity={0.8}
              >
                <Text style={[styles.toggleText, role === 'admin' && styles.toggleTextActiveAdmin]}>Admin</Text>
              </TouchableOpacity>
            </View>

            {/* Form Fields */}
            <View style={styles.formGroup}>
              <Text style={[styles.label, activeInput === 'email' && styles.labelActive]}>Corporate Email</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={[styles.input, activeInput === 'email' && styles.inputActiveBorder]}
                  placeholder=""
                  value={email}
                  onChangeText={setEmail}
                  onFocus={() => setActiveInput('email')}
                  onBlur={() => setActiveInput(null)}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  selectionColor={COLORS.primary}
                />
                <MaterialIcons 
                  name="alternate-email" 
                  size={20} 
                  color={activeInput === 'email' ? COLORS.primary : COLORS.on_surface_variant} 
                  style={styles.inputIcon} 
                />
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.label, activeInput === 'password' && styles.labelActive]}>Access Key</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={[styles.input, activeInput === 'password' && styles.inputActiveBorder]}
                  placeholder=""
                  value={password}
                  onChangeText={setPassword}
                  onFocus={() => setActiveInput('password')}
                  onBlur={() => setActiveInput(null)}
                  secureTextEntry
                  selectionColor={COLORS.primary}
                />
                <MaterialIcons 
                  name="lock-open" 
                  size={20} 
                  color={activeInput === 'password' ? COLORS.primary : COLORS.on_surface_variant} 
                  style={styles.inputIcon} 
                />
              </View>
            </View>

            {/* Session Active Toggle (Visual) */}
            <View style={styles.sessionRow}>
              <View style={styles.checkboxRow}>
                <View style={styles.fakeCheckboxWrapper}>
                  <View style={styles.fakeCheckboxNubbin} />
                </View>
                <Text style={styles.sessionText}>Keep active</Text>
              </View>
            </View>

            {/* Login Button */}
            <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
              <TouchableOpacity 
                onPress={handleLogin} 
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                activeOpacity={0.9}
              >
                <LinearGradient
                  colors={[COLORS.primary, COLORS.primary_dim]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.loginButton}
                >
                  <Text style={styles.loginButtonText}>Initialize Session</Text>
                  <MaterialIcons name="arrow-forward" size={18} color={COLORS.surface_low} style={{marginLeft: 8}} />
                </LinearGradient>
                <View style={styles.loginButtonGlow} pointerEvents="none" />
              </TouchableOpacity>
            </Animated.View>

            {role === 'admin' && (
              <Text style={styles.hintText}>OVERRIDE: admin@system.com / password123</Text>
            )}

            {/* Security Notice */}
            <View style={styles.securityNotice}>
              <MaterialIcons name="verified-user" size={12} color={COLORS.on_surface_variant} />
              <Text style={styles.securityText}>End-to-End Quantum Encrypted</Text>
            </View>

          </BlurView>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  ambientGlowTop: {
    position: 'absolute',
    top: -height * 0.1,
    left: -width * 0.2,
    width: width * 0.8,
    height: width * 0.8,
    borderRadius: width * 0.4,
    backgroundColor: COLORS.primary_container,
    opacity: 0.04,
  },
  ambientGlowBottom: {
    position: 'absolute',
    bottom: -height * 0.1,
    right: -width * 0.2,
    width: width,
    height: width,
    borderRadius: width * 0.5,
    backgroundColor: COLORS.secondary,
    opacity: 0.02,
  },
  rippleRing: {
    position: 'absolute',
    top: '30%',
    left: '10%',
    width: width * 1.5,
    height: width * 1.5,
    borderRadius: width * 0.75,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'android' ? 40 : 10,
    paddingBottom: 20,
    zIndex: 50,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    color: COLORS.primary,
    fontSize: IS_SMALL_DEVICE ? 14 : 16,
    fontWeight: '900',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  versionText: {
    color: COLORS.on_surface_variant,
    fontSize: IS_SMALL_DEVICE ? 9 : 10,
    letterSpacing: -0.5,
    textTransform: 'uppercase',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  glassCard: {
    width: '100%',
    maxWidth: 480,
    padding: IS_SMALL_DEVICE ? 24 : 32,
    borderRadius: 24,
    backgroundColor: 'rgba(32, 31, 31, 0.4)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  cardHeader: {
    marginBottom: 28,
  },
  mainHeading: {
    color: COLORS.on_surface,
    fontSize: IS_SMALL_DEVICE ? 28 : 32,
    fontWeight: '700',
    letterSpacing: -1,
    marginBottom: 8,
  },
  subHeading: {
    color: COLORS.on_surface_variant,
    fontSize: IS_SMALL_DEVICE ? 12 : 14,
    lineHeight: 20,
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 32,
    padding: 4,
    marginBottom: 28,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 32,
  },
  toggleBtnActiveCustomer: {
    backgroundColor: COLORS.primary_container,
  },
  toggleBtnActiveAdmin: {
    backgroundColor: COLORS.surface_highest,
  },
  toggleText: {
    color: COLORS.on_surface_variant,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  toggleTextActiveCustomer: {
    color: '#004d57',
  },
  toggleTextActiveAdmin: {
    color: COLORS.on_surface,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    color: COLORS.on_surface_variant,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  labelActive: {
    color: COLORS.primary,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    height: 44,
    color: COLORS.on_surface,
    fontSize: 15,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.outline_variant,
  },
  inputActiveBorder: {
    borderBottomColor: COLORS.primary,
  },
  inputIcon: {
    position: 'absolute',
    right: 0,
    bottom: 12,
  },
  sessionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 28,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fakeCheckboxWrapper: {
    width: 30,
    height: 16,
    borderRadius: 8,
    backgroundColor: COLORS.surface_highest,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    paddingHorizontal: 2,
    marginRight: 8,
  },
  fakeCheckboxNubbin: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.secondary,
    transform: [{ translateX: 14 }],
  },
  sessionText: {
    color: COLORS.on_surface,
    fontSize: 9,
    fontWeight: '600',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  loginButton: {
    height: IS_SMALL_DEVICE ? 56 : 64,
    borderRadius: 32,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  loginButtonGlow: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.primary_container,
    borderRadius: 32,
    zIndex: 1,
    transform: [{ scale: 1.05 }],
    opacity: 0.15,
  },
  loginButtonText: {
    color: '#005762',
    fontSize: IS_SMALL_DEVICE ? 16 : 18,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  securityNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    opacity: 0.4,
  },
  securityText: {
    color: COLORS.on_surface,
    fontSize: IS_SMALL_DEVICE ? 8 : 9,
    fontWeight: '600',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginLeft: 6,
  },
  hintText: {
    color: COLORS.primary,
    fontSize: 10,
    textAlign: 'center',
    marginTop: 16,
    letterSpacing: 1,
  }
});
