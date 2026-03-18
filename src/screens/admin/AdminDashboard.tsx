import React, { useContext, useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { AuthContext, Bill, User } from '../../context/AuthContext';
import { useNavigation } from '@react-navigation/native';

export default function AdminDashboard() {
  const { logout, getAllUsers, getAllBills } = useContext(AuthContext);
  const navigation: any = useNavigation();

  const [stats, setStats] = useState({ users: 0, bills: 0, unpaid: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      const users = await getAllUsers();
      const bills = await getAllBills();
      setStats({
        users: users.filter(u => u.role === 'customer').length,
        bills: bills.length,
        unpaid: bills.filter(b => b.status === 'unpaid').length
      });
    };
    
    // Polling or using focus effect is better, but this is simple mocked fetch for now
    const unsubscribe = navigation.addListener('focus', () => {
      fetchStats();
    });

    return unsubscribe;
  }, [navigation]);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Admin Panel</Text>
        <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Total Customers</Text>
          <Text style={styles.statValue}>{stats.users}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Total Bills Gen.</Text>
          <Text style={styles.statValue}>{stats.bills}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Pending Bills</Text>
          <Text style={styles.statValue}>{stats.unpaid}</Text>
        </View>
      </View>

      <View style={styles.actionsContainer}>
        <TouchableOpacity 
          style={styles.actionBtn} 
          onPress={() => navigation.navigate('ManageUsers')}
        >
          <Text style={styles.actionText}>Manage Customers</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.actionBtnSecondary} 
          onPress={() => navigation.navigate('AddUser')}
        >
          <Text style={styles.actionTextSecondary}>Add New Customer</Text>
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
  },
  title: { color: '#FFF', fontSize: 22, fontWeight: 'bold' },
  logoutBtn: { backgroundColor: '#1E40AF', padding: 8, borderRadius: 6 },
  logoutText: { color: '#FFF', fontWeight: 'bold' },
  statsContainer: {
    flexDirection: 'row',
    padding: 15,
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: '#FFF',
    padding: 15,
    borderRadius: 8,
    width: '31%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  statLabel: { fontSize: 12, color: '#6B7280', textAlign: 'center', marginBottom: 5 },
  statValue: { fontSize: 20, fontWeight: 'bold', color: '#1F2937' },
  actionsContainer: { padding: 20 },
  actionBtn: {
    backgroundColor: '#10B981',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
  },
  actionText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  actionBtnSecondary: {
    backgroundColor: '#FFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#10B981',
  },
  actionTextSecondary: { color: '#10B981', fontSize: 16, fontWeight: 'bold' }
});
