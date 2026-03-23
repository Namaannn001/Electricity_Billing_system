import React, { useContext, useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Platform } from 'react-native';
import { AuthContext, User, Bill } from '../../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

export default function ManageUsersScreen() {
  const { getAllUsers, getAllBills } = useContext(AuthContext);
  const navigation: any = useNavigation();

  const [customers, setCustomers] = useState<User[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  
  const [searchMeter, setSearchMeter] = useState('');
  const [filterMonth, setFilterMonth] = useState('All');
  const [isFocused, setIsFocused] = useState(false);

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
    return userBills[userBills.length - 1].status; 
  };

  const renderItem = ({ item }: { item: User }) => {
    const status = getStatusForMonth(item.id, filterMonth);

    let statusColors = ['transparent', 'transparent'];
    let statusTextColor = '#64748B';
    let statusText = status || '';

    if (status === 'paid') {
      statusColors = ['rgba(16, 185, 129, 0.1)', 'rgba(6, 95, 70, 0.4)'];
      statusTextColor = '#10B981';
      statusText = 'PAID';
    } else if (status === 'unpaid') {
      statusColors = ['rgba(239, 68, 68, 0.1)', 'rgba(185, 28, 28, 0.4)'];
      statusTextColor = '#EF4444';
      statusText = 'UNPAID';
    } else if (status === 'No Bill') {
      statusColors = ['rgba(255, 255, 255, 0.05)', 'rgba(255, 255, 255, 0.1)'];
      statusTextColor = '#94A3B8';
      statusText = 'NULL';
    }

    return (
      <TouchableOpacity 
        activeOpacity={0.8}
        onPress={() => navigation.navigate('UserDetails', { userId: item.id })}
      >
        <BlurView intensity={20} tint="dark" style={styles.card}>
          <View style={styles.infoBox}>
            <Text style={styles.name}>{item.name.toUpperCase()}</Text>
            <Text style={styles.meter}>METER ID: <Text style={{fontWeight: '900', color: '#00E5FF'}}>{item.meterNumber}</Text></Text>
            <Text style={styles.email}>{item.email}</Text>
          </View>

          <View style={styles.actionArrow}>
            {status && (
              <LinearGradient colors={statusColors as any} style={styles.statusGradient}>
                <Text style={[styles.statusText, { color: statusTextColor }]}>{statusText}</Text>
              </LinearGradient>
            )}
            <Text style={styles.arrowText}>{'>'}</Text>
          </View>
        </BlurView>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.mainContainer}>
      <View style={[styles.orb, styles.orbTop]} />
      
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backBtnText}>{'<'} BACK TO DASHBOARD</Text>
        </TouchableOpacity>
        <Text style={styles.title}>System Entities</Text>
      </View>

      <View style={styles.filterContainer}>
        <TextInput 
          style={[styles.searchInput, isFocused && styles.searchInputActive]} 
          placeholder="QUERY HARDWARE ID..." 
          placeholderTextColor="#64748B"
          value={searchMeter}
          onChangeText={setSearchMeter}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
        
        <FlatList 
          horizontal
          showsHorizontalScrollIndicator={false}
          data={months}
          keyExtractor={(item) => item}
          style={styles.monthScroll}
          contentContainerStyle={{ paddingHorizontal: 20 }}
          renderItem={({item}) => (
            <TouchableOpacity 
              style={[styles.monthChip, filterMonth === item && styles.monthChipActive]}
              onPress={() => setFilterMonth(item)}
            >
              <Text style={[styles.monthText, filterMonth === item && styles.monthTextActive]}>{item.toUpperCase()}</Text>
            </TouchableOpacity>
          )}
        />
      </View>

      <FlatList 
        data={filteredCustomers}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={<Text style={styles.emptyText}>NO ENTITIES LOCATED.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: '#0B0F19' },
  orb: { position: 'absolute', width: 400, height: 400, borderRadius: 200, opacity: 0.15 },
  orbTop: { top: -100, right: -100, backgroundColor: '#3B82F6' },
  
  header: { paddingTop: 60, paddingBottom: 20, paddingHorizontal: 20 },
  backBtn: { marginBottom: 15 },
  backBtnText: { color: '#00E5FF', fontSize: 12, fontWeight: '800', letterSpacing: 2 },
  title: { fontSize: 24, fontWeight: '900', color: '#F8FAFC', letterSpacing: 1 },

  filterContainer: { marginBottom: 10 },
  searchInput: { marginHorizontal: 20, backgroundColor: 'rgba(0, 0, 0, 0.4)', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.1)', borderRadius: 12, padding: 14, marginBottom: 15, fontSize: 13, color: '#F8FAFC', fontWeight: 'bold', letterSpacing: 1 },
  searchInputActive: { borderColor: '#00E5FF' },
  
  monthScroll: { maxHeight: 40, flexGrow: 0 },
  monthChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.05)', marginRight: 10, borderWidth: 1, borderColor: 'transparent', alignSelf: 'center', height: 34, justifyContent: 'center' },
  monthChipActive: { backgroundColor: 'rgba(0, 229, 255, 0.1)', borderColor: '#00E5FF' },
  monthText: { color: '#64748B', fontWeight: '800', fontSize: 11, letterSpacing: 1 },
  monthTextActive: { color: '#00E5FF' },
  
  listContainer: { paddingHorizontal: 20, paddingBottom: 40, paddingTop: 10 },
  emptyText: { textAlign: 'center', marginTop: 40, color: '#64748B', fontSize: 12, letterSpacing: 1, fontWeight: 'bold' },

  card: { padding: 20, borderRadius: 16, marginBottom: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', backgroundColor: 'rgba(15, 23, 42, 0.6)' },
  infoBox: { flex: 1, paddingRight: 10 },
  name: { fontSize: 14, fontWeight: '900', color: '#F8FAFC', letterSpacing: 1 },
  meter: { fontSize: 11, color: '#94A3B8', marginTop: 6, fontWeight: '700', letterSpacing: 1 },
  email: { fontSize: 11, color: '#64748B', marginTop: 4 },
  
  actionArrow: { flexDirection: 'row', alignItems: 'center' },
  statusGradient: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  statusText: { fontSize: 10, fontWeight: '900', letterSpacing: 1 },
  arrowText: { fontSize: 18, color: '#3B82F6', marginLeft: 12, fontWeight: 'bold' },
});
