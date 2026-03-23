import React, { useState, useContext } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, Platform, KeyboardAvoidingView } from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { isValidEmail, isValidPassword, showError } from '../../utils/validators';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

export default function AddUserScreen() {
  const { addUser } = useContext(AuthContext);
  const navigation = useNavigation();

  const [step, setStep] = useState(1);
  const [activeInput, setActiveInput] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    meterNumber: `MTR-${Math.floor(10000000 + Math.random() * 90000000)}`,
    address: '',
    city: '',
    state: '',
    phoneNumber: '',
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
      window && window.alert ? window.alert('Success: System entity generated.') : null;
      navigation.goBack();
    } catch (error: any) {
      showError(error.message);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      style={styles.mainContainer}
    >
      <View style={[styles.orb, styles.orbTop]} />
      <View style={[styles.orb, styles.orbBottom]} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {step === 1 ? (
          <>
            <View style={styles.header}>
              <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
                <Text style={styles.backBtnText}>{'<'} CANCEL</Text>
              </TouchableOpacity>
              <Text style={styles.title}>Phase 1: Identity Config</Text>
            </View>

            <BlurView intensity={20} tint="dark" style={styles.formCard}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>DESIGNATION (NAME) *</Text>
                <TextInput 
                  style={[styles.input, activeInput === 'name' && styles.inputActive]} 
                  value={form.name} 
                  onChangeText={t => handleChange('name', t)} 
                  onFocus={() => setActiveInput('name')}
                  onBlur={() => setActiveInput(null)}
                  placeholderTextColor="#64748B"
                  placeholder="Enter designation"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>COMM VECTOR (EMAIL) *</Text>
                <TextInput 
                  style={[styles.input, activeInput === 'email' && styles.inputActive]} 
                  value={form.email} 
                  onChangeText={t => handleChange('email', t)} 
                  autoCapitalize="none"
                  onFocus={() => setActiveInput('email')}
                  onBlur={() => setActiveInput(null)}
                  placeholderTextColor="#64748B"
                  placeholder="Enter email"
                  keyboardType="email-address"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>SECURITY KEY *</Text>
                <TextInput 
                  style={[styles.input, activeInput === 'pass' && styles.inputActive]} 
                  value={form.password} 
                  onChangeText={t => handleChange('password', t)} 
                  secureTextEntry
                  onFocus={() => setActiveInput('pass')}
                  onBlur={() => setActiveInput(null)}
                  placeholderTextColor="#64748B"
                  placeholder="Enter temporary password"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>AUTO-GENERATED METER ID</Text>
                <TextInput 
                  style={[styles.input, { backgroundColor: 'rgba(0,0,0,0.5)', color: '#3B82F6', fontWeight: 'bold' }]} 
                  value={form.meterNumber} 
                  editable={false} 
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>FREQUENCY CONTACT (PHONE)</Text>
                <TextInput 
                  style={[styles.input, activeInput === 'phone' && styles.inputActive]} 
                  value={form.phoneNumber} 
                  onChangeText={t => handleChange('phoneNumber', t)} 
                  keyboardType="phone-pad"
                  onFocus={() => setActiveInput('phone')}
                  onBlur={() => setActiveInput(null)}
                  placeholderTextColor="#64748B"
                />
              </View>

              <TouchableOpacity onPress={handleNext} activeOpacity={0.8} style={{marginTop: 10}}>
                <LinearGradient
                  colors={['#00E5FF', '#3B82F6']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.primaryBtn}
                >
                  <Text style={styles.primaryBtnText}>PROCEED TO PHASE 2</Text>
                </LinearGradient>
              </TouchableOpacity>
            </BlurView>
          </>
        ) : (
          <>
            <View style={styles.header}>
              <TouchableOpacity style={styles.backBtn} onPress={() => setStep(1)}>
                <Text style={styles.backBtnText}>{'<'} PREVIOUS PHASE</Text>
              </TouchableOpacity>
              <Text style={styles.title}>Phase 2: Hardware Config</Text>
            </View>

            <BlurView intensity={20} tint="dark" style={styles.formCard}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>ASSIGNED METER ID</Text>
                <TextInput 
                  style={[styles.input, { backgroundColor: 'rgba(0,0,0,0.5)', color: '#3B82F6', fontWeight: 'bold' }]} 
                  value={form.meterNumber} 
                  editable={false} 
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>HARDWARE LOCATION</Text>
                <View style={styles.toggleRow}>
                  {['Inside', 'Outside'].map(opt => (
                    <TouchableOpacity key={opt} style={[styles.optionBtn, form.meterLocation === opt && styles.optionBtnActive]} onPress={() => handleChange('meterLocation', opt)}>
                      <Text style={[styles.optionText, form.meterLocation === opt && styles.optionTextActive]}>{opt}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>HARDWARE TYPE</Text>
                <View style={styles.toggleRow}>
                  {['Electric', 'Solar', 'Smart'].map(opt => (
                    <TouchableOpacity key={opt} style={[styles.optionBtn, form.meterType === opt && styles.optionBtnActive]} onPress={() => handleChange('meterType', opt)}>
                      <Text style={[styles.optionText, form.meterType === opt && styles.optionTextActive]}>{opt}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>CYCLE TYPE</Text>
                <View style={styles.toggleRow}>
                  {['Normal', 'Industrial'].map(opt => (
                    <TouchableOpacity key={opt} style={[styles.optionBtn, form.billType === opt && styles.optionBtnActive]} onPress={() => handleChange('billType', opt)}>
                      <Text style={[styles.optionText, form.billType === opt && styles.optionTextActive]}>{opt}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>PHASE ARCHITECTURE</Text>
                <View style={styles.toggleRow}>
                  {['Phase 1', 'Phase 2', 'Phase 3'].map(opt => (
                    <TouchableOpacity key={opt} style={[styles.optionBtn, form.phaseCode === opt && styles.optionBtnActive]} onPress={() => handleChange('phaseCode', opt)}>
                      <Text style={[styles.optionText, form.phaseCode === opt && styles.optionTextActive]}>{opt}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>BILLING CYCLE (DAYS)</Text>
                <TextInput 
                  style={[styles.input, activeInput === 'days' && styles.inputActive]} 
                  value={form.billingDays} 
                  onChangeText={t => handleChange('billingDays', t)} 
                  keyboardType="numeric" 
                  onFocus={() => setActiveInput('days')}
                  onBlur={() => setActiveInput(null)}
                />
              </View>

              <TouchableOpacity onPress={handleSave} activeOpacity={0.8} style={{marginTop: 10}}>
                <LinearGradient
                  colors={['#8B5CF6', '#00E5FF']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.primaryBtn}
                >
                  <Text style={styles.primaryBtnText}>COMMIT CONFIGURATION</Text>
                </LinearGradient>
              </TouchableOpacity>
            </BlurView>
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: '#0B0F19' },
  orb: { position: 'absolute', width: 300, height: 300, borderRadius: 150, opacity: 0.15 },
  orbTop: { top: -50, right: -50, backgroundColor: '#00E5FF' },
  orbBottom: { bottom: -100, left: -50, width: 400, height: 400, borderRadius: 200, backgroundColor: '#8B5CF6' },
  
  scrollContent: { paddingHorizontal: 20, paddingBottom: 60, flexGrow: 1 },
  header: { paddingTop: 60, paddingBottom: 20 },
  backBtn: { marginBottom: 15 },
  backBtnText: { color: '#00E5FF', fontSize: 12, fontWeight: '800', letterSpacing: 2 },
  title: { fontSize: 24, fontWeight: '900', color: '#F8FAFC', letterSpacing: 1 },

  formCard: { padding: 24, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', backgroundColor: 'rgba(15, 23, 42, 0.6)Label ', overflow: 'hidden' },
  
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 10, color: '#94A3B8', marginBottom: 8, fontWeight: '800', letterSpacing: 1 },
  input: { backgroundColor: 'rgba(0, 0, 0, 0.3)', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.05)', borderRadius: 12, padding: 14, fontSize: 14, color: '#F8FAFC' },
  inputActive: { borderColor: '#00E5FF', shadowColor: '#00E5FF', shadowOpacity: 0.2, shadowRadius: 10, shadowOffset: { width: 0, height: 0 } },
  
  toggleRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  optionBtn: { flex: 1, padding: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', alignItems: 'center', borderRadius: 8, backgroundColor: 'rgba(0,0,0,0.3)' },
  optionBtnActive: { backgroundColor: 'rgba(0, 229, 255, 0.1)', borderColor: '#00E5FF' },
  optionText: { color: '#64748B', fontSize: 11, fontWeight: '700', letterSpacing: 1 },
  optionTextActive: { color: '#00E5FF', fontWeight: '900' },
  
  primaryBtn: { padding: 16, borderRadius: 12, alignItems: 'center', shadowColor: '#00E5FF', shadowOpacity: 0.4, shadowRadius: 12, shadowOffset: { width: 0, height: 4 } },
  primaryBtnText: { color: '#FFFFFF', fontSize: 13, fontWeight: '900', letterSpacing: 2 }
});
