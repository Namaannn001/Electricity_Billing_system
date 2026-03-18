import React, { useContext, useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { AuthContext, Bill } from '../../context/AuthContext';
import { useNavigation } from '@react-navigation/native';

export default function CustomerDashboard() {
  const { user, logout, getCustomerBills } = useContext(AuthContext);
  const navigation: any = useNavigation();

  const [dueBills, setDueBills] = useState<Bill[]>([]);
  const [totalDue, setTotalDue] = useState(0);

  useEffect(() => {
    const fetchBills = async () => {
      if (user) {
        const bills = await getCustomerBills(user.id);
        const unpaid = bills.filter(b => b.status === 'unpaid');
        setDueBills(unpaid);
        setTotalDue(unpaid.reduce((sum, b) => sum + b.totalAmount, 0));
      }
    };

    const unsubscribe = navigation.addListener('focus', () => {
      fetchBills();
    });

    return unsubscribe;
  }, [user, navigation]);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello, {user?.name}</Text>
          <Text style={styles.subtext}>Meter: {user?.meterNumber}</Text>
        </View>
        <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.dueCard}>
        <Text style={styles.dueLabel}>Total Due Amount</Text>
        <Text style={styles.dueAmount}>₹{totalDue.toFixed(2)}</Text>
        {dueBills.length > 0 ? (
          <TouchableOpacity 
            style={styles.payBtn} 
            onPress={() => navigation.navigate('PayBill', { bills: dueBills })}
          >
            <Text style={styles.payBtnText}>Pay Now</Text>
          </TouchableOpacity>
        ) : (
          <Text style={styles.allClear}>All bills are paid!</Text>
        )}
      </View>

      <View style={styles.actionsContainer}>
        <TouchableOpacity 
          style={styles.actionBtn} 
          onPress={() => navigation.navigate('BillHistory')}
        >
          <Text style={styles.actionText}>View Bill History</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.actionBtn, { marginTop: 15 }]} 
          onPress={() => navigation.navigate('ProfileDetails')}
        >
          <Text style={styles.actionText}>View & Update Profile</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  header: {
    backgroundColor: '#2563EB',
    padding: 20,
    paddingTop: 60,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  greeting: { color: '#FFF', fontSize: 24, fontWeight: 'bold' },
  subtext: { color: '#D1D5DB', fontSize: 14, marginTop: 4 },
  logoutBtn: { backgroundColor: '#1E40AF', padding: 8, borderRadius: 6 },
  logoutText: { color: '#FFF', fontWeight: 'bold' },
  dueCard: {
    backgroundColor: '#FFF',
    margin: 20,
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  dueLabel: { fontSize: 16, color: '#6B7280', marginBottom: 8 },
  dueAmount: { fontSize: 36, fontWeight: 'bold', color: '#EF4444', marginBottom: 20 },
  payBtn: { backgroundColor: '#10B981', paddingVertical: 12, paddingHorizontal: 30, borderRadius: 8 },
  payBtnText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  allClear: { color: '#10B981', fontSize: 16, fontWeight: 'bold' },
  actionsContainer: { paddingHorizontal: 20 },
  actionBtn: {
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  actionText: { color: '#1F2937', fontSize: 16, fontWeight: 'bold' }
});
