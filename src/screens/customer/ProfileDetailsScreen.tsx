import React, { useContext, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Platform } from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { isValidEmail, isValidPhone, showError } from '../../utils/validators';

export default function ProfileDetailsScreen() {
  const { user, updateUser } = useContext(AuthContext);
  const navigation = useNavigation();

  const [form, setForm] = useState({
    email: user?.email || '',
    phoneNumber: user?.phoneNumber || '',
    address: user?.address || '',
    city: user?.city || '',
    state: user?.state || '',
  });

  const handleChange = (key: string, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const handleUpdate = async () => {
    if (!form.email) {
      showError('Email cannot be empty');
      return;
    }
    
    if (!isValidEmail(form.email)) {
      showError('Please enter a valid email format');
      return;
    }

    if (form.phoneNumber && !isValidPhone(form.phoneNumber)) {
      showError('Please enter a valid 10-digit phone number');
      return;
    }
    
    try {
      if (user) {
        await updateUser(user.id, {
          email: form.email,
          phoneNumber: form.phoneNumber,
          address: form.address,
          city: form.city,
          state: form.state
        });
        Platform.OS === 'web' 
          ? window.alert('Success: Profile updated successfully!') 
          : window.alert('Profile updated successfully!'); // generic fallback
      }
    } catch (error: any) {
      showError(error.message);
    }
  };

  if (!user) return null;

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 50 }}>
      {/* Back Button */}
      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
        <Text style={styles.backBtnText}>{'<'} Back</Text>
      </TouchableOpacity>

      <Text style={styles.title}>My Profile & Meter Info</Text>

      {/* View Only Admin-Set Details */}
      <View style={styles.card}>
        <Text style={styles.sectionHeader}>Account Information</Text>
        <Text style={styles.readOnlyText}><Text style={styles.bold}>Name:</Text> {user.name} (Locked)</Text>
        <Text style={styles.readOnlyText}><Text style={styles.bold}>Meter Number:</Text> {user.meterNumber} (Locked)</Text>
        
        <View style={styles.divider} />
        
        <Text style={styles.sectionHeader}>Meter Configuration (Admin Set)</Text>
        <Text style={styles.readOnlyText}><Text style={styles.bold}>Meter Location:</Text> {user.meterLocation || 'Not Assigned'}</Text>
        <Text style={styles.readOnlyText}><Text style={styles.bold}>Meter Type:</Text> {user.meterType || 'Not Assigned'}</Text>
        <Text style={styles.readOnlyText}><Text style={styles.bold}>Phase Code:</Text> {user.phaseCode || 'Not Assigned'}</Text>
        <Text style={styles.readOnlyText}><Text style={styles.bold}>Bill Type:</Text> {user.billType || 'Not Assigned'}</Text>
        <Text style={styles.readOnlyText}><Text style={styles.bold}>Billing Days:</Text> {user.billingDays || '30'}</Text>
      </View>

      {/* Editable Contact Details */}
      <View style={[styles.card, { marginTop: 20 }]}>
        <Text style={styles.sectionHeader}>Update Contact Info</Text>
        
        <Text style={styles.label}>Email Address *</Text>
        <TextInput 
          style={styles.input} 
          value={form.email} 
          onChangeText={v => handleChange('email', v)} 
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <Text style={styles.label}>Phone Number</Text>
        <TextInput 
          style={styles.input} 
          value={form.phoneNumber} 
          onChangeText={v => handleChange('phoneNumber', v)} 
          keyboardType="phone-pad"
        />

        <Text style={styles.label}>Address</Text>
        <TextInput 
          style={styles.input} 
          value={form.address} 
          onChangeText={v => handleChange('address', v)} 
        />

        <Text style={styles.label}>City</Text>
        <TextInput 
          style={styles.input} 
          value={form.city} 
          onChangeText={v => handleChange('city', v)} 
        />

        <Text style={styles.label}>State</Text>
        <TextInput 
          style={styles.input} 
          value={form.state} 
          onChangeText={v => handleChange('state', v)} 
        />

        <TouchableOpacity style={styles.btn} onPress={handleUpdate}>
          <Text style={styles.btnText}>Update Details</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6', padding: 20 },
  backBtn: { marginTop: 40, marginBottom: 10 },
  backBtnText: { color: '#2563EB', fontSize: 16, fontWeight: 'bold' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#1F2937', marginBottom: 20 },
  card: { backgroundColor: '#FFF', padding: 20, borderRadius: 10, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5, elevation: 2 },
  sectionHeader: { fontSize: 18, fontWeight: 'bold', color: '#374151', marginBottom: 15 },
  readOnlyText: { fontSize: 15, color: '#4B5563', marginBottom: 8 },
  bold: { fontWeight: 'bold', color: '#1F2937' },
  divider: { height: 1, backgroundColor: '#E5E7EB', marginVertical: 15 },
  label: { fontSize: 14, color: '#4B5563', marginBottom: 5, fontWeight: '600' },
  input: { backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 8, padding: 12, marginBottom: 15 },
  btn: { backgroundColor: '#10B981', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 5 },
  btnText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' }
});
