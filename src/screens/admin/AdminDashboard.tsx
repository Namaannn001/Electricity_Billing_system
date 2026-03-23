import React, { useContext, useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { AuthContext, Bill, User } from '../../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

const { width } = Dimensions.get('window');

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
    
    const unsubscribe = navigation.addListener('focus', () => {
      fetchStats();
    });

    return unsubscribe;
  }, [navigation]);

  return (
    <View style={styles.mainContainer}>
      <View style={[styles.orb, styles.orbTop]} />
      <View style={[styles.orb, styles.orbBottom]} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>System Admin</Text>
          <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
            <Text style={styles.logoutText}>DISCONNECT</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.statsContainer}>
          <BlurView intensity={20} tint="dark" style={styles.statCard}>
            <Text style={styles.statLabel}>ENTITIES</Text>
            <Text style={styles.statValue}>{stats.users}</Text>
          </BlurView>
          <BlurView intensity={20} tint="dark" style={styles.statCard}>
            <Text style={styles.statLabel}>BILLS GEN.</Text>
            <Text style={styles.statValue}>{stats.bills}</Text>
          </BlurView>
          <BlurView intensity={20} tint="dark" style={styles.statCard}>
            <Text style={styles.statLabel}>PENDING</Text>
            <Text style={styles.statValue}>{stats.unpaid}</Text>
          </BlurView>
        </View>

        <View style={styles.actionsContainer}>
          <TouchableOpacity 
            activeOpacity={0.8}
            onPress={() => navigation.navigate('ManageUsers')}
          >
            <LinearGradient
              colors={['#8B5CF6', '#3B82F6']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.actionBtn}
            >
              <Text style={styles.actionText}>MANAGE CUSTOMERS</Text>
            </LinearGradient>
          </TouchableOpacity>
          
          <TouchableOpacity 
            activeOpacity={0.8}
            onPress={() => navigation.navigate('AddUser')}
          >
            <BlurView intensity={20} tint="dark" style={styles.actionBtnSecondary}>
              <Text style={styles.actionTextSecondary}>ADD NEW CUSTOMER</Text>
            </BlurView>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: { 
    flex: 1, 
    backgroundColor: '#0B0F19' 
  },
  orb: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    opacity: 0.15,
  },
  orbTop: {
    top: -50,
    right: -100,
    backgroundColor: '#3B82F6',
  },
  orbBottom: {
    bottom: -100,
    left: -100,
    width: 400,
    height: 400,
    borderRadius: 200,
    backgroundColor: '#8B5CF6',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  header: {
    padding: 24,
    paddingTop: 80,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  title: { color: '#F8FAFC', fontSize: 24, fontWeight: '900', letterSpacing: 1 },
  logoutBtn: { 
    backgroundColor: 'rgba(255,255,255,0.05)', 
    paddingVertical: 8, 
    paddingHorizontal: 12, 
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)'
  },
  logoutText: { color: '#94A3B8', fontWeight: '700', fontSize: 11, letterSpacing: 1 },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    justifyContent: 'space-between',
    marginBottom: 40,
  },
  statCard: {
    padding: 16,
    borderRadius: 16,
    width: '31%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    overflow: 'hidden',
  },
  statLabel: { fontSize: 10, color: '#94A3B8', textAlign: 'center', marginBottom: 8, fontWeight: '800', letterSpacing: 1 },
  statValue: { fontSize: 28, fontWeight: '900', color: '#00E5FF' },
  actionsContainer: { paddingHorizontal: 20 },
  actionBtn: {
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#8B5CF6',
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  actionText: { color: '#FFFFFF', fontSize: 14, fontWeight: '800', letterSpacing: 1 },
  actionBtnSecondary: {
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.3)',
    backgroundColor: 'rgba(0, 229, 255, 0.05)',
    overflow: 'hidden',
  },
  actionTextSecondary: { color: '#00E5FF', fontSize: 14, fontWeight: '800', letterSpacing: 1 }
});
