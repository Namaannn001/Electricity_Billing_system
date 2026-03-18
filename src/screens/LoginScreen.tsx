import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { AuthContext, Role } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { isValidEmail, showError } from '../utils/validators';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>('customer');

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
      <Text style={styles.title}>Electricity Billing System</Text>
      
      <View style={styles.card}>
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

        <Text style={styles.label}>Email Address</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <Text style={styles.label}>Password</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        
        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Login as {role === 'admin' ? 'Admin' : 'Customer'}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.linkContainer} onPress={() => navigation.navigate('Register')}>
          <Text style={styles.linkText}>Don't have an account? <Text style={{fontWeight: 'bold'}}>Create one</Text></Text>
        </TouchableOpacity>
        
        {role === 'admin' && (
          <Text style={styles.hint}>Default Admin: admin@system.com | password123</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 40,
  },
  card: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  toggleContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 4,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 6,
  },
  toggleBtnActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  toggleText: {
    color: '#6B7280',
    fontWeight: '600',
  },
  toggleTextActive: {
    color: '#2563EB',
  },
  label: {
    fontSize: 14,
    color: '#4B5563',
    marginBottom: 8,
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#2563EB',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  linkContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  linkText: {
    color: '#4B5563',
    fontSize: 14,
  },
  hint: {
    marginTop: 15,
    textAlign: 'center',
    color: '#9CA3AF',
    fontSize: 12,
  }
});
