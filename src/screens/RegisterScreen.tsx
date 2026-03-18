import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { AuthContext, Role } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { isValidEmail, isValidPassword, showError } from '../utils/validators';

export default function RegisterScreen() {
  const { register } = useContext(AuthContext);
  const navigation: any = useNavigation();

  const [role, setRole] = useState<Role>('customer');
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    meterNumber: ''
  });

  const handleChange = (key: string, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const handleRegister = async () => {
    if (!form.name || !form.email || !form.password) {
      showError('Name, Email and Password are required');
      return;
    }

    if (!isValidEmail(form.email)) {
      showError('Please enter a valid email address');
      return;
    }

    if (!isValidPassword(form.password)) {
      showError('Password must be at least 6 characters');
      return;
    }

    if (role === 'customer' && (!form.meterNumber || form.meterNumber.trim() === '')) {
      showError('Meter Number is required for customers');
      return;
    }

    try {
      await register({
        name: form.name,
        email: form.email,
        password: form.password,
        role: role,
        meterNumber: form.meterNumber
      });
      // Context will auto login upon successful register
    } catch (error: any) {
      showError(error.message);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 50 }}>
      {/* Back Button */}
      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
        <Text style={styles.backBtnText}>{'<'} Back</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Create Account</Text>
      
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

        <Text style={styles.label}>Full Name *</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter full name"
          value={form.name}
          onChangeText={val => handleChange('name', val)}
        />

        <Text style={styles.label}>Email Address *</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter email"
          value={form.email}
          onChangeText={val => handleChange('email', val)}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <Text style={styles.label}>Password *</Text>
        <TextInput
          style={styles.input}
          placeholder="Create password"
          value={form.password}
          onChangeText={val => handleChange('password', val)}
          secureTextEntry
        />

        {role === 'customer' && (
          <View>
            <Text style={styles.label}>Meter Number *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your meter number"
              value={form.meterNumber}
              onChangeText={val => handleChange('meterNumber', val)}
            />
          </View>
        )}
        
        <TouchableOpacity style={styles.button} onPress={handleRegister}>
          <Text style={styles.buttonText}>Register</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    padding: 20,
  },
  backBtn: {
    marginTop: 40,
    marginBottom: 20,
  },
  backBtnText: {
    color: '#2563EB',
    fontSize: 16,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 20,
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
    marginBottom: 24,
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
    marginBottom: 16,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#2563EB',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  }
});
