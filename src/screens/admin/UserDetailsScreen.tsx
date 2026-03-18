import React, { useContext, useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert } from 'react-native';
import { AuthContext, User, Bill } from '../../context/AuthContext';
import { useRoute, useNavigation } from '@react-navigation/native';
import { showError } from '../../utils/validators';

export default function UserDetailsScreen() {
  const { getAllUsers, addBill, getCustomerBills } = useContext(AuthContext);
  const route: any = useRoute();
  const navigation = useNavigation();
  const { userId } = route.params;

  const [customer, setCustomer] = useState<User | null>(null);
  const [bills, setBills] = useState<Bill[]>([]);
  const [reading, setReading] = useState('');
  const [billingMonth, setBillingMonth] = useState('Jan');

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

    const previousReading = bills.length > 0 ? bills[0].currentReading : 0; // simplistic assumption
    if (currentReading < previousReading) {
      showError(`Current reading (${currentReading}) cannot be less than previous reading (${previousReading})`);
      return;
    }

    const unitsConsumed = currentReading - previousReading;
    const ratePerUnit = 5.5; // Fixed rate for calculation
    const baseEnergyCost = unitsConsumed * ratePerUnit;
    const fixedTaxes = 105; // 50 Rent + 30 S.Charge + 15 S.Tax + 10 F.Tax
    const totalAmount = baseEnergyCost + fixedTaxes;
    
    // Auto due date is 15 days from now
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
      
      // Success fallback logic for web
      window && window.alert ? window.alert('Success: Bill generated successfully') : Alert.alert('Success', 'Bill generated successfully');
      setReading('');
      
      // refresh bills
      const updatedBills = await getCustomerBills(customer.id);
      setBills(updatedBills.sort((a,b) => Number(b.id) - Number(a.id)));
    } catch (e: any) {
      showError(e.message);
    }
  };

  if (!customer) return <View style={styles.container}><Text>Loading...</Text></View>;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Customer Details</Text>
      
      <View style={styles.card}>
        <Text style={styles.detailText}><Text style={styles.bold}>Name:</Text> {customer.name}</Text>
        <Text style={styles.detailText}><Text style={styles.bold}>Email:</Text> {customer.email}</Text>
        <Text style={styles.detailText}><Text style={styles.bold}>Phone:</Text> {customer.phoneNumber || 'N/A'}</Text>
        <Text style={styles.detailText}><Text style={styles.bold}>Meter No:</Text> {customer.meterNumber}</Text>
        <Text style={styles.detailText}><Text style={styles.bold}>Address:</Text> {customer.address}</Text>
      </View>

      <Text style={styles.sectionTitle}>Generate Bill</Text>
      <View style={styles.card}>
        <Text style={styles.label}>Billing Month</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.monthScroll} contentContainerStyle={{ paddingBottom: 10 }}>
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

        <Text style={styles.label}>Current Meter Reading</Text>
        <TextInput 
          style={styles.input} 
          keyboardType="numeric" 
          value={reading} 
          onChangeText={setReading} 
          placeholder="Enter current reading" 
        />
        <TouchableOpacity style={styles.btn} onPress={handleGenerateBill}>
          <Text style={styles.btnText}>Generate Bill</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Bill History</Text>
      {bills.map((b) => (
        <View key={b.id} style={styles.billCard}>
          <View style={styles.billRow}>
            <Text style={styles.billDate}>{b.billingMonth ? `${b.billingMonth} - ` : ''}{b.readingDate}</Text>
            <Text style={[styles.status, b.status === 'paid' ? styles.statusPaid : styles.statusUnpaid]}>
              {b.status.toUpperCase()}
            </Text>
          </View>
          <Text style={styles.billText}>Units: {b.unitsConsumed}</Text>
          <Text style={styles.amount}>₹{b.totalAmount.toFixed(2)}</Text>
        </View>
      ))}
      {bills.length === 0 && <Text style={{ color: '#6B7280', margin: 20 }}>No bills generated yet.</Text>}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6', padding: 20 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#1F2937', marginBottom: 20, marginTop: 40 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1F2937', marginTop: 20, marginBottom: 10 },
  card: { backgroundColor: '#FFF', padding: 20, borderRadius: 10, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5, elevation: 2 },
  detailText: { fontSize: 16, marginBottom: 5, color: '#374151' },
  bold: { fontWeight: 'bold' },
  label: { fontSize: 14, color: '#4B5563', marginBottom: 8, fontWeight: '600' },
  input: { backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 8, padding: 12, marginBottom: 15 },
  btn: { backgroundColor: '#10B981', padding: 15, borderRadius: 8, alignItems: 'center' },
  btnText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  billCard: { backgroundColor: '#FFF', padding: 15, borderRadius: 8, marginBottom: 10, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 3, elevation: 1 },
  billRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  billDate: { fontSize: 14, fontWeight: 'bold', color: '#4B5563' },
  status: { fontSize: 12, fontWeight: 'bold', paddingVertical: 2, paddingHorizontal: 6, borderRadius: 4, overflow: 'hidden' },
  statusPaid: { backgroundColor: '#D1FAE5', color: '#065F46' },
  statusUnpaid: { backgroundColor: '#FEE2E2', color: '#B91C1C' },
  billText: { fontSize: 14, color: '#6B7280' },
  amount: { fontSize: 18, fontWeight: 'bold', color: '#1F2937', marginTop: 5 },
  monthScroll: { marginBottom: 15, maxHeight: 50 },
  monthChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#F3F4F6', marginRight: 10, borderWidth: 1, borderColor: '#D1D5DB' },
  monthChipActive: { backgroundColor: '#DBEAFE', borderColor: '#3B82F6' },
  monthText: { color: '#4B5563', fontWeight: '500' },
  monthTextActive: { color: '#2563EB', fontWeight: 'bold' }
});
