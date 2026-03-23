import React, { useContext, useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, Linking } from 'react-native';
import { AuthContext, Bill } from '../../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

import { scheduleLoginBillReminder } from '../../utils/notifications';

const { width } = Dimensions.get('window');

export default function CustomerDashboard() {
  const { user, logout, getCustomerBills } = useContext(AuthContext);
  const navigation: any = useNavigation();

  const [dueBills, setDueBills] = useState<Bill[]>([]);
  const [totalDue, setTotalDue] = useState(0);
  const [hasNotifiedThisSession, setHasNotifiedThisSession] = useState(false);

  useEffect(() => {
    const fetchBills = async () => {
      if (user) {
        const bills = await getCustomerBills(user.id);
        const unpaid = bills.filter(b => b.status === 'unpaid');
        setDueBills(unpaid);
        setTotalDue(unpaid.reduce((sum, b) => sum + b.totalAmount, 0));

        // When a user is login, then the user get notification for your electricity bill is here 
        // Only trigger these notifications once per session login
        if (unpaid.length > 0 && !hasNotifiedThisSession) {
          unpaid.forEach((unpaidBill, index) => {
            // Slight delay between each notification so the system doesn't drop them
            setTimeout(() => {
              scheduleLoginBillReminder(unpaidBill.billingMonth || 'Current', unpaidBill.totalAmount);
            }, index * 800); 
          });
          setHasNotifiedThisSession(true);
        }
      }
    };

    const unsubscribe = navigation.addListener('focus', () => {
      fetchBills();
    });

    return unsubscribe;
  }, [user, navigation]);

  return (
    <View style={styles.mainContainer}>
      <View style={[styles.orb, styles.orbTop]} />
      <View style={[styles.orb, styles.orbBottom]} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Welcome, {user?.name}</Text>
            <Text style={styles.subtext}>METER ID: {user?.meterNumber}</Text>
          </View>
          <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
            <Text style={styles.logoutText}>DISCONNECT</Text>
          </TouchableOpacity>
        </View>

        <BlurView intensity={20} tint="dark" style={styles.dueCard}>
          <Text style={styles.dueLabel}>ACTIVE OUTSTANDING BALANCE</Text>
          <Text style={styles.dueAmount}>₹{totalDue.toFixed(2)}</Text>
          {dueBills.length > 0 ? (
            <TouchableOpacity onPress={() => navigation.navigate('PayBill', { bills: dueBills })} activeOpacity={0.8}>
              <LinearGradient
                colors={['#EF4444', '#B91C1C']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.payBtn}
              >
                <Text style={styles.payBtnText}>RESOLVE BALANCE</Text>
              </LinearGradient>
            </TouchableOpacity>
          ) : (
            <View style={styles.allClearContainer}>
              <Text style={styles.allClear}>SYSTEM OPTIMAL</Text>
              <Text style={styles.allClearSub}>No pending dues detected</Text>
            </View>
          )}
        </BlurView>

        <View style={styles.actionsContainer}>
          <TouchableOpacity 
            activeOpacity={0.7}
            onPress={() => navigation.navigate('BillHistory')}
          >
            <BlurView intensity={20} tint="dark" style={styles.actionCard}>
              <LinearGradient
                colors={['rgba(139, 92, 246, 0.2)', 'transparent']}
                style={StyleSheet.absoluteFill}
              />
              <Text style={styles.actionTitle}>TRANSACTION LOGS</Text>
              <Text style={styles.actionDesc}>Review historical billing data</Text>
            </BlurView>
          </TouchableOpacity>

          <TouchableOpacity 
            activeOpacity={0.7}
            style={{ marginTop: 20 }}
            onPress={() => navigation.navigate('ProfileDetails')}
          >
            <BlurView intensity={20} tint="dark" style={styles.actionCard}>
              <LinearGradient
                colors={['rgba(0, 229, 255, 0.2)', 'transparent']}
                style={StyleSheet.absoluteFill}
              />
              <Text style={styles.actionTitle}>COMMUNICATIONS PROFILE</Text>
              <Text style={styles.actionDesc}>Manage identity parameters</Text>
            </BlurView>
          </TouchableOpacity>

          <TouchableOpacity 
            activeOpacity={0.7}
            style={{ marginTop: 20 }}
            onPress={() => Linking.openURL('tel:1912')} // 1912 is a common electricity emergency number in India, feel free to change
          >
            <BlurView intensity={20} tint="dark" style={styles.actionCard}>
              <LinearGradient
                colors={['rgba(239, 68, 68, 0.2)', 'transparent']}
                style={StyleSheet.absoluteFill}
              />
              <Text style={[styles.actionTitle, { color: '#EF4444' }]}>EMERGENCY SOS</Text>
              <Text style={styles.actionDesc}>Immediate assistance & outage reporting</Text>
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
    left: -100,
    backgroundColor: '#00E5FF',
  },
  orbBottom: {
    bottom: -100,
    right: -100,
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
  greeting: { color: '#F8FAFC', fontSize: 28, fontWeight: '900', letterSpacing: 0.5 },
  subtext: { color: '#00E5FF', fontSize: 12, marginTop: 4, fontWeight: '700', letterSpacing: 1 },
  logoutBtn: { 
    backgroundColor: 'rgba(255,255,255,0.05)', 
    paddingVertical: 8, 
    paddingHorizontal: 12, 
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)'
  },
  logoutText: { color: '#94A3B8', fontWeight: '700', fontSize: 11, letterSpacing: 1 },
  dueCard: {
    margin: 20,
    padding: 30,
    borderRadius: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    overflow: 'hidden',
  },
  dueLabel: { fontSize: 12, color: '#94A3B8', marginBottom: 8, fontWeight: '700', letterSpacing: 2 },
  dueAmount: { fontSize: 48, fontWeight: '900', color: '#EF4444', marginBottom: 24, textShadowColor: 'rgba(239, 68, 68, 0.4)', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 10 },
  payBtn: { paddingVertical: 14, paddingHorizontal: 36, borderRadius: 12, shadowColor: '#EF4444', shadowOpacity: 0.4, shadowRadius: 12, shadowOffset: { width: 0, height: 4 } },
  payBtnText: { color: '#FFF', fontSize: 14, fontWeight: '800', letterSpacing: 1 },
  allClearContainer: {
    alignItems: 'center',
    padding: 10,
  },
  allClear: { color: '#00E5FF', fontSize: 16, fontWeight: '800', letterSpacing: 1, textShadowColor: 'rgba(0, 229, 255, 0.4)', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 8 },
  allClearSub: { color: '#64748B', fontSize: 12, marginTop: 4, letterSpacing: 0.5 },
  actionsContainer: { paddingHorizontal: 20 },
  actionCard: {
    padding: 24,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
  },
  actionTitle: { color: '#F8FAFC', fontSize: 16, fontWeight: '800', letterSpacing: 1, marginBottom: 4 },
  actionDesc: { color: '#64748B', fontSize: 13 }
});
