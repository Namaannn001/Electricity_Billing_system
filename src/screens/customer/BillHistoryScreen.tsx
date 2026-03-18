import React, { useContext, useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { AuthContext, Bill } from '../../context/AuthContext';
import { useNavigation } from '@react-navigation/native';

export default function BillHistoryScreen() {
  const { user, getCustomerBills } = useContext(AuthContext);
  const navigation: any = useNavigation();
  const [bills, setBills] = useState<Bill[]>([]);

  useEffect(() => {
    const fetchBills = async () => {
      if (user) {
        const data = await getCustomerBills(user.id);
        setBills(data.sort((a,b) => Number(b.id) - Number(a.id)));
      }
    };
    const unsubscribe = navigation.addListener('focus', fetchBills);
    return unsubscribe;
  }, [user, navigation]);

  const viewReceipt = (item: Bill) => {
    navigation.navigate('Receipt', { bill: item });
  };

  const renderItem = ({ item }: { item: Bill }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.date}>{item.billingMonth ? `${item.billingMonth} - ` : ''}{item.readingDate}</Text>
        <Text style={[styles.status, item.status === 'paid' ? styles.paid : styles.unpaid]}>
          {item.status.toUpperCase()}
        </Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Units Consumed:</Text>
        <Text style={styles.value}>{item.unitsConsumed}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Due Date:</Text>
        <Text style={styles.value}>{item.dueDate}</Text>
      </View>
      <View style={[styles.row, { marginTop: 10 }]}>
        <Text style={styles.totalLabel}>Total Payable:</Text>
        <Text style={styles.totalValue}>₹{item.totalAmount.toFixed(2)}</Text>
      </View>

      <TouchableOpacity 
        style={styles.downloadBtn}
        onPress={() => viewReceipt(item)}
      >
        <Text style={styles.downloadBtnText}>View Detailed Receipt</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bill History</Text>
      <FlatList 
        data={bills}
        keyExtractor={b => b.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 20 }}
        ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 20, color: '#6B7280' }}>No bills found.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6', padding: 20 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#1F2937', marginBottom: 20, marginTop: 40 },
  card: { backgroundColor: '#FFF', padding: 15, borderRadius: 10, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5, elevation: 2, marginBottom: 15 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10, borderBottomWidth: 1, borderBottomColor: '#F3F4F6', paddingBottom: 10 },
  date: { fontSize: 16, fontWeight: 'bold', color: '#374151' },
  status: { fontSize: 12, fontWeight: 'bold', paddingVertical: 2, paddingHorizontal: 6, borderRadius: 4, overflow: 'hidden' },
  paid: { backgroundColor: '#D1FAE5', color: '#065F46' },
  unpaid: { backgroundColor: '#FEE2E2', color: '#B91C1C' },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  label: { fontSize: 14, color: '#6B7280' },
  value: { fontSize: 14, color: '#1F2937', fontWeight: '500' },
  totalLabel: { fontSize: 16, color: '#374151', fontWeight: 'bold' },
  totalValue: { fontSize: 18, color: '#10B981', fontWeight: 'bold' },
  downloadBtn: { backgroundColor: '#2563EB', padding: 12, borderRadius: 8, marginTop: 15, alignItems: 'center' },
  downloadBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 14 }
});
