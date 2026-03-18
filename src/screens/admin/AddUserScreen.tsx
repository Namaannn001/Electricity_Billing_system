import React, { useState, useContext } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { isValidEmail, isValidPassword, showError } from '../../utils/validators';

export default function AddUserScreen() {
  const { addUser } = useContext(AuthContext);
  const navigation = useNavigation();

  const [step, setStep] = useState(1);

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    meterNumber: `MTR-${Math.floor(10000000 + Math.random() * 90000000)}`,
    address: '',
    city: '',
    state: '',
    phoneNumber: '',
    // Meter Information fields
    meterLocation: 'Inside',
    meterType: 'Electric',
    phaseCode: 'Phase 1',
    billType: 'Normal',
    billingDays: '30'
  });

  const handleChange = (key: string, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const handleNext = () => {
    if (!form.name || !form.email || !form.meterNumber || !form.password) {
      showError('Name, Email, Password and Meter Number are required!');
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
    setStep(2);
  };

  const handleSave = async () => {
    try {
      await addUser({
        ...form,
        role: 'customer'
      });
      // Use standard browser alert gracefully for success on web
      window && window.alert ? window.alert('Success: Customer added successfully') : null;
      navigation.goBack();
    } catch (error: any) {
      showError(error.message);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 50 }}>
      {step === 1 ? (
        <>
          <Text style={[styles.title, { marginTop: 40 }]}>Step 1: Customer Details</Text>

          <View style={styles.form}>
            <Text style={styles.label}>Customer Name *</Text>
            <TextInput style={styles.input} value={form.name} onChangeText={t => handleChange('name', t)} />

            <Text style={styles.label}>Email Address *</Text>
            <TextInput style={styles.input} value={form.email} onChangeText={t => handleChange('email', t)} autoCapitalize="none" />

            <Text style={styles.label}>Password *</Text>
            <TextInput style={styles.input} value={form.password} onChangeText={t => handleChange('password', t)} secureTextEntry />

            <Text style={styles.label}>Meter Number (Auto-Generated)</Text>
            <TextInput 
              style={[styles.input, { backgroundColor: '#E5E7EB', color: '#6B7280' }]} 
              value={form.meterNumber} 
              editable={false} 
            />

            <Text style={styles.label}>Phone Number</Text>
            <TextInput style={styles.input} value={form.phoneNumber} onChangeText={t => handleChange('phoneNumber', t)} keyboardType="phone-pad" />

            <Text style={styles.label}>Address</Text>
            <TextInput style={styles.input} value={form.address} onChangeText={t => handleChange('address', t)} />

            <Text style={styles.label}>City</Text>
            <TextInput style={styles.input} value={form.city} onChangeText={t => handleChange('city', t)} />

            <Text style={styles.label}>State</Text>
            <TextInput style={styles.input} value={form.state} onChangeText={t => handleChange('state', t)} />

            <TouchableOpacity style={styles.primaryBtn} onPress={handleNext}>
              <Text style={styles.primaryBtnText}>Next: Meter Info</Text>
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <>
          <TouchableOpacity style={styles.backBtn} onPress={() => setStep(1)}>
            <Text style={styles.backBtnText}>{'<'} Back to Customer Details</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Step 2: Meter Information</Text>

          <View style={styles.form}>
            <Text style={styles.label}>Auto Customer Meter Number</Text>
            <TextInput style={[styles.input, { backgroundColor: '#E5E7EB' }]} value={form.meterNumber} editable={false} />

            <Text style={styles.label}>Meter Location</Text>
            <View style={styles.toggleRow}>
              {['Inside', 'Outside'].map(opt => (
                <TouchableOpacity key={opt} style={[styles.optionBtn, form.meterLocation === opt && styles.optionBtnActive]} onPress={() => handleChange('meterLocation', opt)}>
                  <Text style={[styles.optionText, form.meterLocation === opt && styles.optionTextActive]}>{opt}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Meter Type</Text>
            <View style={styles.toggleRow}>
              {['Electric', 'Solar', 'Smart'].map(opt => (
                <TouchableOpacity key={opt} style={[styles.optionBtn, form.meterType === opt && styles.optionBtnActive]} onPress={() => handleChange('meterType', opt)}>
                  <Text style={[styles.optionText, form.meterType === opt && styles.optionTextActive]}>{opt}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Bill Type</Text>
            <View style={styles.toggleRow}>
              {['Normal', 'Industrial'].map(opt => (
                <TouchableOpacity key={opt} style={[styles.optionBtn, form.billType === opt && styles.optionBtnActive]} onPress={() => handleChange('billType', opt)}>
                  <Text style={[styles.optionText, form.billType === opt && styles.optionTextActive]}>{opt}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Phase Code</Text>
            <View style={styles.toggleRow}>
              {['Phase 1', 'Phase 2', 'Phase 3'].map(opt => (
                <TouchableOpacity key={opt} style={[styles.optionBtn, form.phaseCode === opt && styles.optionBtnActive]} onPress={() => handleChange('phaseCode', opt)}>
                  <Text style={[styles.optionText, form.phaseCode === opt && styles.optionTextActive]}>{opt}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Billing Days</Text>
            <TextInput style={styles.input} value={form.billingDays} onChangeText={t => handleChange('billingDays', t)} keyboardType="numeric" />

            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
              <Text style={styles.saveBtnText}>Submit and Save</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6', padding: 20 },
  backBtn: { marginTop: 30, marginBottom: 10 },
  backBtnText: { color: '#2563EB', fontSize: 16, fontWeight: 'bold' },
  title: { fontSize: 22, fontWeight: 'bold', color: '#1F2937', marginBottom: 20 },
  form: { backgroundColor: '#FFF', padding: 20, borderRadius: 10, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5, elevation: 2, marginBottom: 50 },
  label: { fontSize: 14, color: '#4B5563', marginBottom: 5, fontWeight: '600', marginTop: 10 },
  input: { backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 8, padding: 12, marginBottom: 5 },
  primaryBtn: { backgroundColor: '#10B981', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 20 },
  primaryBtnText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  saveBtn: { backgroundColor: '#2563EB', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 30 },
  saveBtnText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  toggleRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10, marginTop: 5, gap: 5 },
  optionBtn: { flex: 1, padding: 10, borderWidth: 1, borderColor: '#D1D5DB', alignItems: 'center', borderRadius: 6, backgroundColor: '#F9FAFB' },
  optionBtnActive: { backgroundColor: '#EFF6FF', borderColor: '#3B82F6' },
  optionText: { color: '#4B5563', fontSize: 13, fontWeight: '500' },
  optionTextActive: { color: '#2563EB', fontWeight: 'bold' }
});
