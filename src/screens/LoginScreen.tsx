import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, Dimensions } from 'react-native';
import { AuthContext, Role } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { isValidEmail, showError } from '../utils/validators';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

const { width, height } = Dimensions.get('window');

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>('customer');
  const [activeInput, setActiveInput] = useState<string | null>(null);

  const { login } = useContext(AuthContext);
  const navigation: any = useNavigation();

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
    <View style={styles.container}>
      {/* Background Orbs */}
      <View style={[styles.orb, styles.orbTop]} />
      <View style={[styles.orb, styles.orbBottom]} />
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <BlurView intensity={20} tint="dark" style={styles.glassCard}>
          <View style={styles.headerContainer}>
            <Text style={styles.brandTitle}>EEBS</Text>
            <Text style={styles.subtitle}>Electricity Billing System</Text>
          </View>
          
          <View style={styles.toggleContainer}>
            <TouchableOpacity 
              style={[styles.toggleBtn, role === 'customer' && styles.toggleBtnActive]} 
              onPress={() => setRole('customer')}
            >
              <Text style={[styles.toggleText, role === 'customer' && styles.toggleTextActive]}>Customer</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.toggleBtn, role === 'admin' && styles.toggleBtnActive]} 
              onPress={() => setRole('admin')}
            >
              <Text style={[styles.toggleText, role === 'admin' && styles.toggleTextActive]}>Admin</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>EMAIL</Text>
            <TextInput
              style={[styles.input, activeInput === 'email' && styles.inputActive]}
              placeholder="Enter your email"
              placeholderTextColor="#64748B"
              value={email}
              onChangeText={setEmail}
              onFocus={() => setActiveInput('email')}
              onBlur={() => setActiveInput(null)}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>PASSWORD</Text>
            <TextInput
              style={[styles.input, activeInput === 'password' && styles.inputActive]}
              placeholder="Enter your password"
              placeholderTextColor="#64748B"
              value={password}
              onChangeText={setPassword}
              onFocus={() => setActiveInput('password')}
              onBlur={() => setActiveInput(null)}
              secureTextEntry
            />
          </View>
          
          <TouchableOpacity onPress={handleLogin} activeOpacity={0.8}>
            <LinearGradient
              colors={['#00E5FF', '#8B5CF6']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.buttonGradient}
            >
              <Text style={styles.buttonText}>Authenticate {role === 'admin' ? 'Admin' : 'Customer'}</Text>
            </LinearGradient>
          </TouchableOpacity>

          

          {role === 'admin' && (
            <Text style={styles.hint}>System Admin: admin@system.com | password123</Text>
          )}
        </BlurView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0F19', // Deep dark ai theme
    justifyContent: 'center',
    alignItems: 'center',
  },
  orb: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    opacity: 0.25,
    backgroundColor: '#8B5CF6', // Purple orb
  },
  orbTop: {
    top: -100,
    left: -100,
    backgroundColor: '#00E5FF', // Blue orb
  },
  orbBottom: {
    bottom: -150,
    right: -100,
    width: 400,
    height: 400,
    borderRadius: 200,
  },
  keyboardView: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  glassCard: {
    width: width * 0.9,
    maxWidth: 400,
    padding: 30,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    overflow: 'hidden',
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 36,
  },
  brandTitle: {
    fontSize: 36,
    fontWeight: '900',
    color: '#00E5FF',
    letterSpacing: 2,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#94A3B8',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  toggleContainer: {
    flexDirection: 'row',
    marginBottom: 30,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  toggleBtnActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  toggleText: {
    color: '#64748B',
    fontWeight: '600',
    fontSize: 14,
  },
  toggleTextActive: {
    color: '#F8FAFC',
  },
  formGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 12,
    color: '#94A3B8',
    marginBottom: 8,
    fontWeight: '700',
    letterSpacing: 1,
  },
  input: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#F8FAFC',
  },
  inputActive: {
    borderColor: '#00E5FF',
    shadowColor: '#00E5FF',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
  },
  buttonGradient: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#00E5FF',
    shadowOpacity: 0.4,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  linkContainer: {
    marginTop: 24,
    alignItems: 'center',
  },
  linkText: {
    color: '#94A3B8',
    fontSize: 14,
  },
  linkHighlight: {
    color: '#00E5FF',
    fontWeight: '700',
  },
  hint: {
    marginTop: 20,
    textAlign: 'center',
    color: '#64748B',
    fontSize: 12,
    backgroundColor: 'rgba(0,0,0,0.2)',
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  }
});
