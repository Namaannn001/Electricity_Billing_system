import React, { useContext, useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, Dimensions } from 'react-native';
import { AuthContext, User, Bill } from '../../context/AuthContext';
import { useRoute, useNavigation } from '@react-navigation/native';
import { showError } from '../../utils/validators';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

import { scheduleNewBillNotification, sendRemotePushNotification } from '../../utils/notifications';

export default function UserDetailsScreen() {
  const { getAllUsers, addBill, getCustomerBills } = useContext(AuthContext);
  const route: any = useRoute();
  const navigation: any = useNavigation();
  const { userId } = route.params;

  const [customer, setCustomer] = useState<User | null>(null);
  const [bills, setBills] = useState<Bill[]>([]);
  const [reading, setReading] = useState('');
  const [billingMonth, setBillingMonth] = useState('Jan');
  const [activeInput, setActiveInput] = useState<string | null>(null);

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  useEffect(() => {
    const fetchData = async () => {
      const users = await getAllUsers();
      const found = users.find(u => u.id === userId);
      setCustomer(found || null);

      if (found) {
        const customerBills = await getCustomerBills(found.id);
        setBills(customerBills.sort((a,b) => Number(b.id) - Number(a.id))); // latest first
      }
    };
    fetchData();
  }, [userId]);

  const handleGenerateBill = async () => {
    if (!reading || isNaN(Number(reading)) || reading.trim() === '') {
      showError('Please enter a valid numeric meter reading');
      return;
    }
    
    if (!customer) return;

    const currentReading = Number(reading);
    
    if (currentReading < 0) {
      showError('Meter reading cannot be a negative number');
      return;
    }

    const previousReading = bills.length > 0 ? bills[0].currentReading : 0; 
    if (currentReading < previousReading) {
      showError(`Current reading (${currentReading}) cannot be less than previous reading (${previousReading})`);
      return;
    }

    const unitsConsumed = currentReading - previousReading;
    const ratePerUnit = 5.5; 
    const baseEnergyCost = unitsConsumed * ratePerUnit;
    const fixedTaxes = 105; 
    const totalAmount = baseEnergyCost + fixedTaxes;
    
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 15);

    try {
      await addBill({
        customerId: customer.id,
        meterNumber: customer.meterNumber || 'N/A',
        billingMonth,
        readingDate: new Date().toISOString().split('T')[0],
        currentReading,
        previousReading,
        unitsConsumed,
        totalAmount,
        dueDate: dueDate.toISOString().split('T')[0],
        status: 'unpaid'
      });
      
      // 1. Send LOCAL notification to Admin (Confirmation)
      await scheduleNewBillNotification(totalAmount, customer.meterNumber || 'N/A');

      // 2. Send REMOTE notification to the actual Customer (Background wake-up)
      const allUsers = await getAllUsers();
      const targetUser = allUsers.find(u => u.id === customer.id);
      
      if (targetUser?.pushToken) {
        await sendRemotePushNotification(
          targetUser.pushToken, 
          '⚡ NEW ENERGY BILL', 
          `Your bill for ${billingMonth} (₹${totalAmount.toFixed(2)}) has been generated.`
        );
      }

      window && window.alert ? window.alert('Success: System bill generated.') : Alert.alert('Success', 'System bill generated.');
      setReading('');
      
      // refresh bills
      const updatedBills = await getCustomerBills(customer.id);
      setBills(updatedBills.sort((a,b) => Number(b.id) - Number(a.id)));
    } catch (e: any) {
      showError(e.message);
    }
  };

  if (!customer) return <View style={styles.mainContainer}><Text style={{color: '#fff', textAlign: 'center', marginTop: 50}}>Initializing...</Text></View>;

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
            <Text style={styles.backBtnText}>{'<'} BACK TO MANAGE</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Entity Details</Text>
        </View>
        
        <BlurView intensity={20} tint="dark" style={styles.card}>
          <Text style={styles.sectionHeader}>IDENTITY DATA</Text>
          <View style={styles.grid}>
            <View style={styles.gridItem}>
              <Text style={styles.bold}>ENTITY NAME</Text>
              <Text style={styles.val}>{customer.name}</Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.bold}>METER VECTOR</Text>
              <Text style={[styles.val, {color: '#00E5FF'}]}>{customer.meterNumber}</Text>
            </View>
          </View>
          
          <View style={[styles.grid, {marginTop: 15}]}>
            <View style={styles.gridItem}>
              <Text style={styles.bold}>EMAIL IDENTIFIER</Text>
              <Text style={styles.val} numberOfLines={1} ellipsizeMode="tail">{customer.email}</Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.bold}>COMMS HUB</Text>
              <Text style={styles.val}>{customer.phoneNumber || 'N/A'}</Text>
            </View>
          </View>
        </BlurView>

        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>GENERATE TRANSACTION</Text>
          <View style={styles.activeTag}>
            <View style={styles.pulseDot} />
            <Text style={styles.tagText}>LIVE</Text>
          </View>
        </View>

        <BlurView intensity={20} tint="dark" style={styles.card}>
          <Text style={styles.label}>TARGET EXTRACTION CYCLE (MONTH)</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.monthScroll} contentContainerStyle={{ paddingRight: 10 }}>
            {months.map(m => (
              <TouchableOpacity 
                key={m} 
                style={[styles.monthChip, billingMonth === m && styles.monthChipActive]}
                onPress={() => setBillingMonth(m)}
              >
                <Text style={[styles.monthText, billingMonth === m && styles.monthTextActive]}>{m}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Text style={styles.label}>METER READING (KWH)</Text>
          <TextInput 
            style={[styles.inputField, { marginBottom: 15 }, activeInput === 'read' && styles.inputActive]} 
            keyboardType="numeric" 
            value={reading} 
            onChangeText={setReading} 
            onFocus={() => setActiveInput('read')}
            onBlur={() => setActiveInput(null)}
            placeholder="0000" 
            placeholderTextColor="#64748B"
          />
          
          <TouchableOpacity onPress={handleGenerateBill} activeOpacity={0.8} style={styles.btnWrapper}>
            <LinearGradient
              colors={['#8B5CF6', '#3B82F6']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.actionBtn}
            >
              <Text style={styles.actionText}>EXECUTE BILL GENERATION</Text>
            </LinearGradient>
          </TouchableOpacity>
        </BlurView>

        <Text style={styles.sectionTitle}>TRANSACTION LOGS</Text>
        {bills.map((b) => (
          <BlurView key={b.id} intensity={20} tint="dark" style={styles.billCard}>
            <View style={styles.billRow}>
              <Text style={styles.billDate}>{b.billingMonth ? `${b.billingMonth.toUpperCase()} CYCLE` : 'LATEST CYCLE'}</Text>
              <LinearGradient
                colors={b.status === 'paid' ? ['rgba(16, 185, 129, 0.2)', 'rgba(6, 95, 70, 0.5)'] : ['rgba(239, 68, 68, 0.2)', 'rgba(185, 28, 28, 0.5)']}
                style={styles.statusGradient}
              >
                <Text style={[styles.statusText, b.status === 'paid' ? { color: '#10B981' } : { color: '#EF4444' }]}>
                  {b.status.toUpperCase()}
                </Text>
              </LinearGradient>
            </View>
            <View style={styles.billRow}>
              <Text style={styles.billText}>UNITS EXTRACTED:</Text>
              <Text style={styles.billVal}>{b.unitsConsumed}</Text>
            </View>
            <View style={styles.billRow}>
              <Text style={styles.billText}>LEVIES:</Text>
              <Text style={styles.amount}>₹{b.totalAmount.toFixed(2)}</Text>
            </View>
          </BlurView>
        ))}
        {bills.length === 0 && <Text style={styles.emptyText}>NO TRANSACTION DATA LOCATED.</Text>}
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
  sectionTitle: { fontSize: 13, fontWeight: '900', color: '#00E5FF', marginTop: 24, marginBottom: 16, letterSpacing: 2 },
  sectionHeader: { fontSize: 11, fontWeight: '900', color: '#8B5CF6', marginBottom: 16, letterSpacing: 2 },

  card: { padding: 20, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', backgroundColor: 'rgba(15, 23, 42, 0.6)', overflow: 'hidden', marginBottom: 15 },
  
  grid: { flexDirection: 'row', gap: 10 },
  gridItem: { flex: 1 },

  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 20, marginBottom: 10 },
  activeTag: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0, 229, 255, 0.1)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(0, 229, 255, 0.3)'},
  pulseDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#00E5FF', marginRight: 6 },
  tagText: { color: '#00E5FF', fontSize: 9, fontWeight: '900', letterSpacing: 1 },

  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  bold: { fontSize: 11, color: '#94A3B8', fontWeight: '800', letterSpacing: 1 },
  val: { fontSize: 13, color: '#F8FAFC', fontWeight: '600' },

  label: { fontSize: 10, color: '#94A3B8', marginBottom: 8, fontWeight: '800', letterSpacing: 1 },
  
  inputRow: { flexDirection: 'row', gap: 10, marginBottom: 20, height: 54 },
  inputField: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.4)', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.05)', borderRadius: 12, paddingHorizontal: 16, fontSize: 16, color: '#F8FAFC' },
  inputActive: { borderColor: '#8B5CF6', shadowColor: '#8B5CF6', shadowOpacity: 0.3, shadowRadius: 10 },
  
  lensBtnWrapper: { width: 120 },
  lensBtn: { flex: 1, borderRadius: 12, alignItems: 'center', justifyContent: 'center', shadowColor: '#00E5FF', shadowOpacity: 0.3, shadowRadius: 8 },
  lensBtnText: { color: '#FFFFFF', fontSize: 10, fontWeight: '900', letterSpacing: 1 },

  btnWrapper: { marginTop: 10 },
  actionBtn: { padding: 18, borderRadius: 12, alignItems: 'center', shadowColor: '#8B5CF6', shadowOpacity: 0.3, shadowRadius: 10 },
  actionText: { color: '#FFFFFF', fontSize: 12, fontWeight: '900', letterSpacing: 2 },

  monthScroll: { marginBottom: 20, height: 40 },
  monthChip: { paddingHorizontal: 16, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.05)', marginRight: 10, borderWidth: 1, borderColor: 'transparent', justifyContent: 'center', alignItems: 'center' },
  monthChipActive: { backgroundColor: 'rgba(0, 229, 255, 0.1)', borderColor: '#00E5FF' },
  monthText: { color: '#64748B', fontWeight: '800', fontSize: 11, letterSpacing: 1 },
  monthTextActive: { color: '#00E5FF' },

  emptyText: { color: '#64748B', textAlign: 'center', marginTop: 40, fontSize: 11, fontWeight: '800', letterSpacing: 2 },
  
  billCard: { padding: 20, borderRadius: 16, marginBottom: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', backgroundColor: 'rgba(15, 23, 42, 0.4)', overflow: 'hidden' },
  billRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  billDate: { fontSize: 14, fontWeight: '900', color: '#F8FAFC', letterSpacing: 1 },
  statusGradient: { paddingVertical: 4, paddingHorizontal: 12, borderRadius: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  statusText: { fontSize: 10, fontWeight: '900', letterSpacing: 1 },
  billText: { fontSize: 11, color: '#94A3B8', fontWeight: '800', letterSpacing: 1 },
  billVal: { fontSize: 13, color: '#F8FAFC', fontWeight: '800' },
  amount: { fontSize: 16, fontWeight: '900', color: '#00E5FF' }
});
