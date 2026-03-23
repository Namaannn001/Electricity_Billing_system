import React, { useContext, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Platform, KeyboardAvoidingView } from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { isValidEmail, isValidPhone, showError } from '../../utils/validators';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

export default function ProfileDetailsScreen() {
  const { user, updateUser } = useContext(AuthContext);
  const navigation = useNavigation();

  const [activeInput, setActiveInput] = useState<string | null>(null);
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
          : window.alert('Profile updated successfully!'); 
      }
    } catch (error: any) {
      showError(error.message);
    }
  };

  if (!user) return null;

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.mainContainer}
    >
      <View style={[styles.orb, styles.orbTop]} />
      <View style={[styles.orb, styles.orbBottom]} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.backBtnText}>{'<'} RETURN</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Communications Profile</Text>
        </View>

        {/* View Only Admin-Set Details */}
        <BlurView intensity={20} tint="dark" style={styles.card}>
          <Text style={styles.sectionHeader}>CORE IDENTITY</Text>
          
          <View style={styles.row}>
            <Text style={styles.textLabel}>DESIGNATION</Text>
            <Text style={styles.textValue}>{user.name}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.textLabel}>METER ID</Text>
            <Text style={styles.textValue}>{user.meterNumber}</Text>
          </View>
          
          <View style={styles.divider} />
          
          <Text style={styles.sectionHeader}>HARDWARE CONFIG</Text>
          <View style={styles.row}>
            <Text style={styles.textLabel}>LOCATION</Text>
            <Text style={styles.textValue}>{user.meterLocation || 'UNDEFINED'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.textLabel}>TYPE</Text>
            <Text style={styles.textValue}>{user.meterType || 'UNDEFINED'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.textLabel}>PHASE</Text>
            <Text style={styles.textValue}>{user.phaseCode || 'UNDEFINED'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.textLabel}>BILL CYCLE</Text>
            <Text style={styles.textValue}>{user.billingDays || '30'} DAYS</Text>
          </View>
        </BlurView>

        {/* Editable Contact Details */}
        <BlurView intensity={20} tint="dark" style={styles.formCard}>
          <Text style={styles.sectionHeader}>UPDATE PARAMETERS</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>COMMUNICATION VECTOR (EMAIL)</Text>
            <TextInput 
              style={[styles.input, activeInput === 'email' && styles.inputActive]} 
              value={form.email} 
              onChangeText={v => handleChange('email', v)} 
              onFocus={() => setActiveInput('email')}
              onBlur={() => setActiveInput(null)}
              autoCapitalize="none"
              keyboardType="email-address"
              placeholderTextColor="#64748B"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>FREQUENCY CONTACT (PHONE)</Text>
            <TextInput 
              style={[styles.input, activeInput === 'phone' && styles.inputActive]} 
              value={form.phoneNumber} 
              onChangeText={v => handleChange('phoneNumber', v)} 
              onFocus={() => setActiveInput('phone')}
              onBlur={() => setActiveInput(null)}
              keyboardType="phone-pad"
              placeholderTextColor="#64748B"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>PHYSICAL VECTOR</Text>
            <TextInput 
              style={[styles.input, activeInput === 'address' && styles.inputActive]} 
              value={form.address} 
              onChangeText={v => handleChange('address', v)} 
              onFocus={() => setActiveInput('address')}
              onBlur={() => setActiveInput(null)}
              placeholderTextColor="#64748B"
            />
          </View>

          <View style={styles.inputGroup}>
             <Text style={styles.label}>LOCALIZATION NODE (CITY)</Text>
            <TextInput 
              style={[styles.input, activeInput === 'city' && styles.inputActive]} 
              value={form.city} 
              onChangeText={v => handleChange('city', v)} 
              onFocus={() => setActiveInput('city')}
              onBlur={() => setActiveInput(null)}
              placeholderTextColor="#64748B"
            />
          </View>

          <View style={styles.inputGroup}>
             <Text style={styles.label}>MACRO REGION (STATE)</Text>
            <TextInput 
              style={[styles.input, activeInput === 'state' && styles.inputActive]} 
              value={form.state} 
              onChangeText={v => handleChange('state', v)} 
              onFocus={() => setActiveInput('state')}
              onBlur={() => setActiveInput(null)}
              placeholderTextColor="#64748B"
            />
          </View>

          <TouchableOpacity onPress={handleUpdate} activeOpacity={0.8}>
            <LinearGradient
              colors={['#00E5FF', '#3B82F6']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.updateBtn}
            >
              <Text style={styles.btnText}>SYNCHRONIZE DATA</Text>
            </LinearGradient>
          </TouchableOpacity>
        </BlurView>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: '#0B0F19' },
  orb: { position: 'absolute', width: 300, height: 300, borderRadius: 150, opacity: 0.15 },
  orbTop: { top: -100, right: -50, backgroundColor: '#00E5FF' },
  orbBottom: { bottom: -100, left: -50, width: 400, height: 400, borderRadius: 200, backgroundColor: '#8B5CF6' },
  
  scrollContent: { paddingHorizontal: 20, paddingBottom: 60 },
  header: { paddingTop: 60, paddingBottom: 20 },
  backBtn: { marginBottom: 15 },
  backBtnText: { color: '#00E5FF', fontSize: 12, fontWeight: '800', letterSpacing: 2 },
  title: { fontSize: 24, fontWeight: '900', color: '#F8FAFC', letterSpacing: 1 },

  card: { padding: 24, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', backgroundColor: 'rgba(15, 23, 42, 0.6)', overflow: 'hidden', marginBottom: 20 },
  formCard: { padding: 24, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', backgroundColor: 'rgba(15, 23, 42, 0.6)', overflow: 'hidden' },
  
  sectionHeader: { fontSize: 13, fontWeight: '900', color: '#00E5FF', marginBottom: 20, letterSpacing: 2 },
  
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  textLabel: { fontSize: 11, color: '#94A3B8', fontWeight: '700', letterSpacing: 1 },
  textValue: { fontSize: 13, color: '#F8FAFC', fontWeight: '600' },
  
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.1)', marginVertical: 20 },
  
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 10, color: '#94A3B8', marginBottom: 8, fontWeight: '800', letterSpacing: 1 },
  input: { backgroundColor: 'rgba(0, 0, 0, 0.3)', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.05)', borderRadius: 12, padding: 14, fontSize: 14, color: '#F8FAFC' },
  inputActive: { borderColor: '#00E5FF', shadowColor: '#00E5FF', shadowOpacity: 0.2, shadowRadius: 10, shadowOffset: { width: 0, height: 0 } },
  
  updateBtn: { padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 10, shadowColor: '#00E5FF', shadowOpacity: 0.3, shadowRadius: 12, shadowOffset: { width: 0, height: 4 } },
  btnText: { color: '#FFFFFF', fontSize: 14, fontWeight: '900', letterSpacing: 2 }
});
