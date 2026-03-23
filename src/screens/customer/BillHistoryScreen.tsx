import React, { useContext, useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Dimensions } from 'react-native';
import { AuthContext, Bill } from '../../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

const { width } = Dimensions.get('window');

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
    <BlurView intensity={20} tint="dark" style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.date}>{item.billingMonth ? `${item.billingMonth} - ` : ''}{item.readingDate}</Text>
        <LinearGradient
          colors={item.status === 'paid' ? ['rgba(16, 185, 129, 0.2)', 'rgba(6, 95, 70, 0.5)'] : ['rgba(239, 68, 68, 0.2)', 'rgba(185, 28, 28, 0.5)']}
          style={styles.statusGradient}
        >
          <Text style={[styles.statusText, item.status === 'paid' ? { color: '#10B981' } : { color: '#EF4444' }]}>
            {item.status.toUpperCase()}
          </Text>
        </LinearGradient>
      </View>
      
      <View style={styles.row}>
        <Text style={styles.label}>UNITS CONSUMED</Text>
        <Text style={styles.value}>{item.unitsConsumed}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>DUE DATE</Text>
        <Text style={styles.value}>{item.dueDate}</Text>
      </View>
      
      <View style={styles.divider} />
      
      <View style={styles.row}>
        <Text style={styles.totalLabel}>TOTAL PAYABLE</Text>
        <Text style={styles.totalValue}>₹{item.totalAmount.toFixed(2)}</Text>
      </View>

      <TouchableOpacity 
        style={styles.downloadBtnContainer}
        onPress={() => viewReceipt(item)}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={['rgba(0, 229, 255, 0.1)', 'rgba(0, 229, 255, 0.3)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.downloadBtn}
        >
          <Text style={styles.downloadBtnText}>VIEW RECEIPT</Text>
        </LinearGradient>
      </TouchableOpacity>
    </BlurView>
  );

  return (
    <View style={styles.mainContainer}>
      <View style={[styles.orb, styles.orbTop]} />
      <View style={[styles.orb, styles.orbBottom]} />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backBtnText}>{'<'} BACK</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Transaction Log</Text>
      </View>

      <FlatList 
        data={bills}
        keyExtractor={b => b.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={<Text style={styles.emptyText}>No historical records found.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: '#0B0F19' },
  orb: { position: 'absolute', width: 300, height: 300, borderRadius: 150, opacity: 0.15 },
  orbTop: { top: -100, left: -50, backgroundColor: '#8B5CF6' },
  orbBottom: { bottom: -100, right: -50, width: 400, height: 400, borderRadius: 200, backgroundColor: '#00E5FF' },
  
  header: { paddingHorizontal: 20, paddingTop: 60, paddingBottom: 20 },
  backBtn: { marginBottom: 15 },
  backBtnText: { color: '#00E5FF', fontSize: 12, fontWeight: '800', letterSpacing: 2 },
  title: { fontSize: 28, fontWeight: '900', color: '#F8FAFC', letterSpacing: 1 },
  
  listContainer: { paddingHorizontal: 20, paddingBottom: 40 },
  emptyText: { textAlign: 'center', marginTop: 40, color: '#64748B', fontSize: 14, letterSpacing: 1 },
  
  card: { padding: 20, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', backgroundColor: 'rgba(15, 23, 42, 0.6)', overflow: 'hidden', marginBottom: 20 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  date: { fontSize: 18, fontWeight: '800', color: '#F8FAFC', letterSpacing: 1 },
  statusGradient: { paddingVertical: 4, paddingHorizontal: 12, borderRadius: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  statusText: { fontSize: 11, fontWeight: '900', letterSpacing: 1 },
  
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  label: { fontSize: 11, color: '#94A3B8', fontWeight: '700', letterSpacing: 1 },
  value: { fontSize: 14, color: '#F8FAFC', fontWeight: '600' },
  
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.1)', marginVertical: 15 },
  
  totalLabel: { fontSize: 12, color: '#94A3B8', fontWeight: '800', letterSpacing: 1 },
  totalValue: { fontSize: 24, color: '#00E5FF', fontWeight: '900', textShadowColor: 'rgba(0, 229, 255, 0.4)', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 8 },
  
  downloadBtnContainer: { marginTop: 20 },
  downloadBtn: { padding: 14, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(0, 229, 255, 0.3)' },
  downloadBtnText: { color: '#00E5FF', fontWeight: '900', fontSize: 12, letterSpacing: 2 }
});
