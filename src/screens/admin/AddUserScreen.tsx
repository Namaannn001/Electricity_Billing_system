import React, { useState, useContext } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, Platform, KeyboardAvoidingView, Dimensions } from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { isValidEmail, isValidPassword, showError } from '../../utils/validators';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');
const IS_SMALL_DEVICE = width < 380;

const COLORS = {
  background: '#0e0e0e',
  surface_low: '#131313',
  surface_highest: '#262626',
  primary: '#81ecff',
  primary_dim: '#00d4ec',
  secondary: '#2ff801',
  error: '#ff716c',
  on_surface: '#ffffff',
  on_surface_variant: '#adaaaa',
  outline: '#777575',
};

export default function AddUserScreen() {
  const { addUser } = useContext(AuthContext);
  const navigation: any = useNavigation();

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
    <SafeAreaView style={styles.container}>
      {/* Background Ambience */}
      <View style={styles.ambientGlow} />

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={styles.keyboardView}
      >
        <View style={styles.appBar}>
          <TouchableOpacity 
            style={styles.backBtn} 
            activeOpacity={0.7} 
            onPress={() => step === 1 ? navigation.goBack() : setStep(1)}
          >
            <MaterialIcons name="arrow-back" size={24} color={COLORS.primary} style={{ marginRight: 8 }} />
            <Text style={styles.backBtnText}>{step === 1 ? 'CANCEL' : 'BACK'}</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <Text style={styles.pageTitle}>Provision <Text style={{color: COLORS.primary}}>Node</Text></Text>
          
          <Text style={styles.subtext}>
            {step === 1 
              ? 'Phase 1/2: Establish core identity signatures and access vectors for the incoming entity.'
              : 'Phase 2/2: Confirm physical tracking variables and set energy cycle limits.'}
          </Text>

          <View style={styles.stepperContainer}>
            <View style={[styles.stepBar, { backgroundColor: COLORS.primary }]} />
            <View style={[styles.stepBar, { backgroundColor: step === 2 ? COLORS.primary : COLORS.surface_highest }]} />
          </View>

          {step === 1 ? (
            <View style={styles.formCard}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>DESIGNATION (NAME) *</Text>
                <TextInput 
                  style={[styles.input, activeInput === 'name' && styles.inputActive]} 
                  value={form.name} 
                  onChangeText={t => handleChange('name', t)} 
                  onFocus={() => setActiveInput('name')}
                  onBlur={() => setActiveInput(null)}
                  placeholderTextColor={COLORS.outline}
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
                  placeholderTextColor={COLORS.outline}
                  placeholder="Enter email"
                  keyboardType="email-address"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>SECURITY KEY (PASSWORD) *</Text>
                <TextInput 
                  style={[styles.input, activeInput === 'pass' && styles.inputActive]} 
                  value={form.password} 
                  onChangeText={t => handleChange('password', t)} 
                  secureTextEntry
                  onFocus={() => setActiveInput('pass')}
                  onBlur={() => setActiveInput(null)}
                  placeholderTextColor={COLORS.outline}
                  placeholder="Enter temporary password"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>AUTO-GENERATED METER ID</Text>
                <TextInput 
                  style={[styles.input, { backgroundColor: 'transparent', borderColor: 'transparent', color: COLORS.primary, fontWeight: '900', paddingLeft: 0, fontSize: 18 }]} 
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
                  placeholderTextColor={COLORS.outline}
                  placeholder="Enter contact number"
                />
              </View>

              <TouchableOpacity onPress={handleNext} activeOpacity={0.8} style={{marginTop: 16}}>
                <LinearGradient
                  colors={[COLORS.primary_dim, COLORS.primary]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.actionBtn}
                >
                  <Text style={styles.actionText}>PROCEED TO PHASE 2</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.formCard}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>ASSIGNED METER ID</Text>
                <TextInput 
                  style={[styles.input, { backgroundColor: 'transparent', borderColor: 'transparent', color: COLORS.primary, fontWeight: '900', paddingLeft: 0, fontSize: 18 }]} 
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

              <TouchableOpacity onPress={handleSave} activeOpacity={0.8} style={{marginTop: 16}}>
                <LinearGradient
                  colors={[COLORS.secondary, '#106e00']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.actionBtn}
                >
                  <Text style={[styles.actionText, { color: '#ffffff' }]}>COMMIT CONFIGURATION</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: COLORS.background 
  },
  keyboardView: {
    flex: 1,
  },
  ambientGlow: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: width * 0.8,
    height: width * 0.8,
    borderRadius: width,
    backgroundColor: 'rgba(129, 236, 255, 0.05)',
  },
  appBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)'
  },
  backBtn: { 
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  backBtnText: { 
    color: '#ffffff', 
    fontSize: 12, 
    fontWeight: '800', 
    letterSpacing: 2 
  },
  scrollContent: { 
    paddingHorizontal: IS_SMALL_DEVICE ? 16 : 24, 
    paddingTop: 32,
    paddingBottom: 60, 
    flexGrow: 1 
  },
  pageTitle: {
    fontSize: IS_SMALL_DEVICE ? 32 : 40,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: -1,
    marginBottom: 8,
  },
  subtext: {
    color: COLORS.on_surface_variant,
    fontSize: 13,
    lineHeight: 20,
    fontWeight: '500',
    marginBottom: 32,
  },
  stepperContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 32,
  },
  stepBar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },
  formCard: { 
    padding: 24, 
    borderRadius: 16, 
    borderWidth: 1, 
    borderColor: 'rgba(255,255,255,0.05)', 
    backgroundColor: COLORS.surface_highest, 
    marginBottom: 32 
  },
  inputGroup: { 
    marginBottom: 24 
  },
  label: { 
    fontSize: 10, 
    color: COLORS.outline, 
    marginBottom: 12, 
    fontWeight: '900', 
    letterSpacing: 1.5 
  },
  input: { 
    backgroundColor: COLORS.surface_low, 
    borderWidth: 1, 
    borderColor: 'transparent', 
    borderRadius: 12, 
    paddingHorizontal: 16, 
    height: 56,
    fontSize: 14, 
    color: '#ffffff',
    fontWeight: '600'
  },
  inputActive: { 
    borderColor: COLORS.primary, 
    backgroundColor: 'rgba(129, 236, 255, 0.05)' 
  },
  toggleRow: { 
    flexDirection: 'row', 
    gap: 8 
  },
  optionBtn: { 
    flex: 1, 
    padding: 14, 
    borderWidth: 1, 
    borderColor: 'rgba(255,255,255,0.05)', 
    alignItems: 'center', 
    borderRadius: 12, 
    backgroundColor: COLORS.surface_low 
  },
  optionBtnActive: { 
    backgroundColor: 'rgba(129, 236, 255, 0.1)', 
    borderColor: COLORS.primary 
  },
  optionText: { 
    color: COLORS.on_surface_variant, 
    fontSize: 11, 
    fontWeight: '800', 
    letterSpacing: 1 
  },
  optionTextActive: { 
    color: COLORS.primary, 
    fontWeight: '900' 
  },
  actionBtn: { 
    height: 56, 
    borderRadius: 12, 
    alignItems: 'center',
    justifyContent: 'center'
  },
  actionText: { 
    color: '#003840', 
    fontSize: 12, 
    fontWeight: '900', 
    letterSpacing: 2 
  }
});
