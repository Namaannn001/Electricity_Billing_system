import React, { useContext, useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, Animated, Platform } from 'react-native';
import { AuthContext, Bill, User } from '../../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');
const IS_SMALL_DEVICE = width < 380;

const COLORS = {
  background: '#0e0e0e',
  surface_low: '#131313',
  surface_highest: '#262626',
  surface_high: '#201f1f',
  primary: '#81ecff',
  primary_dim: '#00d4ec',
  primary_container: '#004d57',
  secondary: '#2ff801',
  tertiary: '#ac89ff',
  error: '#ff716c',
  error_container: '#9f0519',
  on_surface: '#ffffff',
  on_surface_variant: '#adaaaa',
  outline: '#777575',
};

export default function AdminDashboard() {
  const { logout, getAllUsers, getAllBills } = useContext(AuthContext);
  const navigation: any = useNavigation();

  const [stats, setStats] = useState({ users: 0, totalRevenue: 0, unpaidCount: 0, totalBills: 0, anomalies: 0, currentMonthRevenue: 0, currentMonthStr: 'MAR' });
  const [recentBills, setRecentBills] = useState<any[]>([]);
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 1, duration: 2500, useNativeDriver: true }),
        Animated.timing(glowAnim, { toValue: 0, duration: 2500, useNativeDriver: true })
      ])
    ).start();

    const fetchStats = async () => {
      const users = await getAllUsers();
      const bills = await getAllBills();
      
      const paidBills = bills.filter((b: Bill) => b.status === 'paid');
      const unpaidBills = bills.filter((b: Bill) => b.status === 'unpaid');
      
      const totalPaidRev = paidBills.reduce((sum: number, b: Bill) => sum + b.totalAmount, 0);
      const customerNodes = users.filter((u: User) => u.role === 'customer');
      
      const allMonths = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
      const currentMonthIndex = new Date().getMonth();
      const last6Months: string[] = [];
      const last6MonthsIndices: number[] = [];
      for (let i = 5; i >= 0; i--) {
        let mIdx = currentMonthIndex - i;
        if (mIdx < 0) mIdx += 12;
        last6Months.push(allMonths[mIdx]);
        last6MonthsIndices.push(mIdx);
      }

      const monthlyData = last6Months.map((mLabel, loopIdx) => {
        const targetMonthIdx = last6MonthsIndices[loopIdx];
        const _rev = paidBills.filter((b: Bill) => {
          const sMatch = b.billingMonth?.toUpperCase().includes(mLabel) || b.readingDate?.toUpperCase().includes(mLabel);
          let dMatch = false;
          if (!sMatch && b.readingDate) {
              const parsed = new Date(b.readingDate);
              if (!isNaN(parsed.getTime()) && parsed.getMonth() === targetMonthIdx) {
                  dMatch = true;
              }
          }
          return sMatch || dMatch;
        }).reduce((sum: number, b: Bill) => sum + b.totalAmount, 0);
        
        return { month: mLabel, rev: _rev };
      });
      
      const currentMonthStr = last6Months[5];
      const currentMonthRev = monthlyData[5].rev;

      setStats({
        users: customerNodes.length,
        totalRevenue: totalPaidRev,
        unpaidCount: unpaidBills.length,
        totalBills: bills.length,
        anomalies: unpaidBills.length,
        currentMonthRevenue: currentMonthRev,
        currentMonthStr: currentMonthStr,
      });

      // grab 3 most recent and attach actual user data
      const sorted = [...bills].reverse();
      const mappedRecent = sorted.slice(0, 3).map((b: Bill) => {
        const matchingDoc = users.find((u: User) => u.id === b.customerId);
        return {
          ...b,
          customerName: matchingDoc ? matchingDoc.name : `Node: ${b.meterNumber}`,
        };
      });
      setRecentBills(mappedRecent);
    };
    
    const unsubscribe = navigation.addListener('focus', () => {
      fetchStats();
    });

    return unsubscribe;
  }, [navigation]);

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Header */}
      <View style={styles.appBar}>
        <View style={styles.appBarLeft}>
          <MaterialIcons name="bolt" size={IS_SMALL_DEVICE ? 20 : 24} color={COLORS.primary} style={{ marginRight: 8 }} />
          <Text style={styles.appBarTitle}>KINETIC ETHER</Text>
        </View>
        <View style={styles.appBarRight}>
          <TouchableOpacity style={styles.iconBtn} activeOpacity={0.7} onPress={logout}>
            <MaterialIcons name="logout" size={IS_SMALL_DEVICE ? 20 : 24} color={COLORS.primary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Hero Metrics */}
        <View style={styles.heroSection}>
          <View style={styles.heroTextCol}>
            <Text style={styles.heroPreTitle}>System Performance</Text>
            <Text style={styles.heroTitle}>{stats.currentMonthStr} Revenue</Text>
            <Text style={styles.heroAmount}>₹{stats.currentMonthRevenue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</Text>
          </View>

          <View style={styles.heroSubBox}>
            <Animated.View style={[styles.ambientGlowPulse, { 
              opacity: glowAnim.interpolate({ inputRange: [0, 1], outputRange: [0.05, 0.15] }),
              transform: [{ scale: glowAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.5] }) }]
            }]} />
            
            <Text style={styles.boxLabel}>ACTIVE CUSTOMERS</Text>
            <Text style={styles.boxAmount}>{stats.users}</Text>
            
            <View style={styles.boxTrending}>
              <MaterialIcons name="trending-up" size={16} color={COLORS.secondary} />
              <Text style={styles.boxTrendingText}>LIVE DEPLOYMENT</Text>
            </View>
          </View>
        </View>

        {/* Bento Grid Stats */}
        <View style={styles.bentoGrid}>
          {/* Pending Bills */}
          <View style={styles.bentoCard}>
            <View style={styles.bentoCardHeader}>
              <View style={[styles.iconWrap, { backgroundColor: 'rgba(129, 236, 255, 0.2)' }]}>
                <MaterialIcons name="receipt-long" size={20} color={COLORS.primary} />
              </View>
              <View style={styles.realtimeTag}><Text style={styles.tagText}>REAL-TIME</Text></View>
            </View>
            <Text style={styles.bentoCardTitle}>Pending Bills</Text>
            <Text style={styles.bentoCardValue}>{stats.unpaidCount}</Text>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${stats.totalBills > 0 ? (stats.unpaidCount / stats.totalBills) * 100 : 0}%`, backgroundColor: COLORS.primary }]} />
            </View>
          </View>

          {/* Server Status */}
          <View style={styles.bentoCard}>
            <View style={styles.bentoCardHeader}>
              <View style={[styles.iconWrap, { backgroundColor: 'rgba(172, 137, 255, 0.2)' }]}>
                <MaterialIcons name="dns" size={20} color={COLORS.tertiary} />
              </View>
            </View>
            <Text style={styles.bentoCardTitle}>Nodes Online</Text>
            <Text style={styles.bentoCardValue}>{stats.users}/{stats.users}</Text>
            <View style={styles.progressRow}>
              <View style={styles.progressNodeOn} />
              <View style={styles.progressNodeOn} />
              <View style={styles.progressNodeOn} />
              <View style={styles.progressNodeOn} />
            </View>
          </View>

          {/* System Warnings */}
          <View style={styles.bentoCard}>
            <View style={styles.bentoCardHeader}>
              <View style={[styles.iconWrap, { backgroundColor: 'rgba(255, 113, 108, 0.2)' }]}>
                <MaterialIcons name="warning" size={20} color={COLORS.error} />
              </View>
            </View>
            <Text style={styles.bentoCardTitle}>Anomalies</Text>
            <Text style={[styles.bentoCardValue, { color: COLORS.error }]}>{stats.anomalies < 10 ? `0${stats.anomalies}` : stats.anomalies}</Text>
            <Text style={styles.resolveLink}>RESOLVE NOW</Text>
          </View>
        </View>

        {/* Chart & Ledgers Section */}
        <View style={styles.mainGrid}>
          


          {/* Recent Invoices List */}
          <View style={styles.ledgerPanel}>
            <Text style={styles.chartTitle}>Recent Invoices</Text>
            
            <View style={styles.ledgerList}>
              {recentBills.map((b, idx) => (
                <View key={idx} style={styles.ledgerItem}>
                  <View style={styles.ledgerLeft}>
                    <View style={styles.avatarMock}>
                      <MaterialIcons name="person" size={16} color={COLORS.on_surface_variant} />
                    </View>
                    <View>
                      <Text style={styles.ledgerName}>{b.customerName}</Text>
                      <Text style={styles.ledgerRef}>INV #{b.id.substring(0,4).toUpperCase()}</Text>
                    </View>
                  </View>
                  <Text style={styles.ledgerAmt}>₹{b.totalAmount.toFixed(2)}</Text>
                </View>
              ))}
            </View>

            <TouchableOpacity style={styles.viewLedgerBtn}>
              <Text style={styles.viewLedgerBtnText}>VIEW ALL LEDGERS</Text>
            </TouchableOpacity>
          </View>

        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  appBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
    zIndex: 50,
    backgroundColor: 'rgba(38, 38, 38, 0.8)',
  },
  appBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  appBarRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  appBarTitle: {
    color: COLORS.primary,
    fontSize: IS_SMALL_DEVICE ? 16 : 18,
    fontWeight: '900',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  iconBtn: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  scrollContent: {
    paddingHorizontal: IS_SMALL_DEVICE ? 16 : 24,
    paddingTop: 32,
    paddingBottom: 100, // Account for Bottom Tabs natively!
  },
  heroSection: {
    flexDirection: IS_SMALL_DEVICE ? 'column' : 'row',
    justifyContent: 'space-between',
    alignItems: IS_SMALL_DEVICE ? 'flex-start' : 'flex-end',
    gap: 24,
    marginBottom: 40,
  },
  heroTextCol: {
    flex: 1,
  },
  heroPreTitle: {
    color: COLORS.secondary,
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 3,
    marginBottom: 12,
  },
  heroTitle: {
    color: '#ffffff',
    fontSize: IS_SMALL_DEVICE ? 36 : 48,
    fontWeight: '800',
    letterSpacing: -1,
  },
  heroAmount: {
    color: COLORS.primary_dim,
    fontSize: IS_SMALL_DEVICE ? 36 : 48,
    fontWeight: '900',
    letterSpacing: -1,
  },
  heroSubBox: {
    backgroundColor: COLORS.surface_low,
    padding: 24,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    width: IS_SMALL_DEVICE ? '100%' : 200,
    overflow: 'hidden',
  },
  ambientGlowPulse: {
    position: 'absolute',
    bottom: -40,
    right: -40,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: COLORS.primary,
    zIndex: 0,
  },
  boxLabel: {
    color: COLORS.on_surface_variant,
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 2,
    fontWeight: '600',
  },
  boxAmount: {
    color: '#ffffff',
    fontSize: 32,
    fontWeight: '800',
    marginTop: 8,
    marginBottom: 16,
  },
  boxTrending: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  boxTrendingText: {
    color: COLORS.secondary,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  bentoGrid: {
    flexDirection: width > 768 ? 'row' : 'column',
    gap: 16,
    marginBottom: 24,
  },
  bentoCard: {
    backgroundColor: COLORS.surface_highest,
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    flex: 1,
  },
  bentoCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  iconWrap: {
    padding: 10,
    borderRadius: 20,
  },
  realtimeTag: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagText: {
    color: COLORS.on_surface_variant,
    fontSize: 9,
    fontWeight: '800',
  },
  bentoCardTitle: {
    color: COLORS.on_surface_variant,
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
  },
  bentoCardValue: {
    color: '#ffffff',
    fontSize: 32,
    fontWeight: '800',
    marginBottom: 16,
  },
  progressTrack: {
    height: 4,
    backgroundColor: COLORS.surface_low,
    width: '100%',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressRow: {
    flexDirection: 'row',
    gap: 4,
  },
  progressNodeOn: {
    flex: 1,
    height: 4,
    backgroundColor: COLORS.secondary,
    borderRadius: 2,
  },
  resolveLink: {
    color: COLORS.error,
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  mainGrid: {
    flexDirection: width > 768 ? 'row' : 'column',
    gap: 16,
    marginBottom: 40,
  },
  chartPanel: {
    backgroundColor: COLORS.surface_low,
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    flex: 2,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
  },
  chartTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#ffffff',
  },
  chartSubtitle: {
    fontSize: 10,
    color: COLORS.on_surface_variant,
    letterSpacing: 2,
    marginTop: 4,
    textTransform: 'uppercase',
  },
  chartMockArea: {
    height: 200,
    justifyContent: 'flex-end',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  barGraphLayout: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: '100%',
    paddingHorizontal: 10,
  },
  barCol: {
    alignItems: 'center',
    width: 30,
    height: '100%',
    justifyContent: 'flex-end',
  },
  barLayer: {
    width: 8,
    backgroundColor: 'rgba(129, 236, 255, 0.2)',
    borderRadius: 4,
    marginBottom: 8,
  },
  barCtxText: {
    fontSize: 9,
    color: COLORS.on_surface_variant,
    fontWeight: '600',
    marginTop: 8,
  },
  ledgerPanel: {
    backgroundColor: COLORS.surface_low,
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    flex: 1,
    justifyContent: 'space-between',
  },
  ledgerList: {
    marginTop: 24,
    gap: 20,
    marginBottom: 32,
  },
  ledgerItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ledgerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarMock: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.surface_highest,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ledgerName: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  ledgerRef: {
    color: COLORS.on_surface_variant,
    fontSize: 9,
    textTransform: 'uppercase',
    marginTop: 2,
  },
  ledgerAmt: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
  },
  viewLedgerBtn: {
    width: '100%',
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    alignItems: 'center',
  },
  viewLedgerBtnText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 2,
  }
});
