import React, { useContext, useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { AuthContext, User, Bill } from '../../context/AuthContext';
import { useNavigation } from '@react-navigation/native';

export default function ManageUsersScreen() {
  const { getAllUsers, getAllBills } = useContext(AuthContext);
  const navigation: any = useNavigation();

  const [customers, setCustomers] = useState<User[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  
  const [searchMeter, setSearchMeter] = useState('');
  const [filterMonth, setFilterMonth] = useState('All');

  const months = ['All', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', async () => {
      const users = await getAllUsers();
      const allBills = await getAllBills();
      
      setCustomers(users.filter(u => u.role === 'customer'));
      setBills(allBills);
    });
    return unsubscribe;
  }, [navigation]);

  const filteredCustomers = customers.filter(c => {
    if (searchMeter && (!c.meterNumber || !c.meterNumber.toLowerCase().includes(searchMeter.toLowerCase()))) {
      return false;
    }
    return true;
  });

  const getStatusForMonth = (customerId: string, month: string) => {
    if (month === 'All') return null;
    const userBills = bills.filter(b => b.customerId === customerId && b.billingMonth === month);
    if (userBills.length === 0) return 'No Bill';
    return userBills[userBills.length - 1].status; // 'paid' or 'unpaid'
  };

  const renderItem = ({ item }: { item: User }) => {
    const status = getStatusForMonth(item.id, filterMonth);

    return (
      <TouchableOpacity 
        style={styles.card} 
        onPress={() => navigation.navigate('UserDetails', { userId: item.id })}
      >
        <View style={styles.infoBox}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.meter}>Meter: <Text style={{fontWeight: 'bold'}}>{item.meterNumber}</Text></Text>
          <Text style={styles.email}>{item.email}</Text>
        </View>
        <View style={styles.actionArrow}>
          {status === 'paid' && <Text style={[styles.statusBadge, styles.statusPaid]}>Paid</Text>}
          {status === 'unpaid' && <Text style={[styles.statusBadge, styles.statusUnpaid]}>Not Paid</Text>}
          {status === 'No Bill' && <Text style={[styles.statusBadge, styles.statusNoBill]}>No Bill</Text>}
          <Text style={styles.arrowText}>{'>'}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Deposit Details</Text>
      
      <View style={styles.filterContainer}>
        <TextInput 
          style={styles.searchInput} 
          placeholder="Search by Meter Number..." 
          value={searchMeter}
          onChangeText={setSearchMeter}
        />
        
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.monthScroll} contentContainerStyle={{ paddingRight: 20 }}>
          {months.map(m => (
            <TouchableOpacity 
              key={m} 
              style={[styles.monthChip, filterMonth === m && styles.monthChipActive]}
              onPress={() => setFilterMonth(m)}
            >
              <Text style={[styles.monthText, filterMonth === m && styles.monthTextActive]}>{m}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <FlatList 
        data={filteredCustomers}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 20 }}
        ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 20, color: '#6B7280' }}>No customers found.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6', padding: 20 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#1F2937', marginBottom: 15, marginTop: 40 },
  filterContainer: { marginBottom: 15 },
  searchInput: { backgroundColor: '#FFF', borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 8, padding: 12, marginBottom: 15, fontSize: 16 },
  monthScroll: { marginBottom: 5, maxHeight: 40 },
  monthChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#E5E7EB', marginRight: 10, alignSelf: 'center' },
  monthChipActive: { backgroundColor: '#DBEAFE' },
  monthText: { color: '#4B5563', fontWeight: '500' },
  monthTextActive: { color: '#2563EB', fontWeight: 'bold' },
  card: {
    backgroundColor: '#FFF',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  infoBox: { flex: 1 },
  name: { fontSize: 16, fontWeight: 'bold', color: '#1F2937' },
  meter: { fontSize: 13, color: '#4B5563', marginTop: 4 },
  email: { fontSize: 13, color: '#6B7280', marginTop: 2 },
  actionArrow: { flexDirection: 'row', alignItems: 'center', padding: 10, paddingRight: 0 },
  arrowText: { fontSize: 18, color: '#9CA3AF', marginLeft: 10 },
  statusBadge: { fontSize: 12, fontWeight: 'bold', paddingVertical: 4, paddingHorizontal: 8, borderRadius: 6, overflow: 'hidden' },
  statusPaid: { backgroundColor: '#D1FAE5', color: '#065F46' },
  statusUnpaid: { backgroundColor: '#FEE2E2', color: '#B91C1C' },
  statusNoBill: { backgroundColor: '#F3F4F6', color: '#6B7280' }
});
