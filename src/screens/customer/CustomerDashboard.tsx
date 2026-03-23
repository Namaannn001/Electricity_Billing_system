import React, { useContext, useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated, Dimensions, SafeAreaView, Platform } from 'react-native';
import { AuthContext, Bill } from '../../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { scheduleLoginBillReminder } from '../../utils/notifications';

const { width, height } = Dimensions.get('window');
const IS_SMALL_DEVICE = width < 380;

const COLORS = {
  background: '#0e0e0e',
  surface_low: '#131313',
  surface_highest: '#262626',
  primary: '#81ecff',
  primary_dim: '#00d4ec',
  primary_container: '#00e3fd',
  secondary: '#2ff801',
  on_surface: '#ffffff',
  on_surface_variant: '#adaaaa',
  outline_variant: '#494847',
};

export default function CustomerDashboard() {
  const { user, logout, getCustomerBills } = useContext(AuthContext);
  const navigation: any = useNavigation();

  const [dueBills, setDueBills] = useState<Bill[]>([]);
  const [totalDue, setTotalDue] = useState(0);
  const [latestUnits, setLatestUnits] = useState(0);
  const [recentBills, setRecentBills] = useState<Bill[]>([]);
  const [hasNotifiedThisSession, setHasNotifiedThisSession] = useState(false);

  // Animations
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 1, duration: 2000, useNativeDriver: true }),
        Animated.timing(glowAnim, { toValue: 0, duration: 2000, useNativeDriver: true })
      ])
    ).start();

    const fetchBills = async () => {
      if (user) {
        const bills = await getCustomerBills(user.id);
        const unpaid = bills.filter(b => b.status === 'unpaid');
        setDueBills(unpaid);
        setTotalDue(unpaid.reduce((sum, b) => sum + b.totalAmount, 0));
        
        if (bills.length > 0) {
          setLatestUnits(bills[bills.length - 1].unitsConsumed);
        }
        
        // Grab the most recent bills for the History section
        const sortedBills = [...bills].reverse();
        setRecentBills(sortedBills.slice(0, 3)); // show top 3

        if (unpaid.length > 0 && !hasNotifiedThisSession) {
          unpaid.forEach((unpaidBill, index) => {
            setTimeout(() => {
              scheduleLoginBillReminder(unpaidBill.billingMonth || 'Current', unpaidBill.totalAmount);
            }, index * 800); 
          });
          setHasNotifiedThisSession(true);
        }
      }
    };

    const unsubscribe = navigation.addListener('focus', fetchBills);
    return unsubscribe;
  }, [user, navigation]);

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Header Equivalent */}
      <View style={styles.appBar}>
        <View style={styles.appBarLeft}>
          <MaterialIcons name="bolt" size={IS_SMALL_DEVICE ? 20 : 24} color={COLORS.primary} />
          <Text style={styles.appBarTitle}>KINETIC ETHER</Text>
        </View>
        <View style={styles.appBarRight}>
          <TouchableOpacity style={styles.iconBtn} activeOpacity={0.7} onPress={logout}>
            <MaterialIcons name="logout" size={IS_SMALL_DEVICE ? 20 : 24} color={COLORS.primary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Title Section */}
        <View style={styles.titleSection}>
          <Text style={styles.pageTitle}>Power <Text style={{color: COLORS.primary}}>Status</Text></Text>
          <Text style={styles.accountId}>ACCOUNT #{user?.meterNumber || '0000-000-ETH'}</Text>
        </View>

        {/* High-Voltage Bill Card */}
        <View style={styles.billCardWrapper}>
          <Animated.View style={[
            styles.billCardGlow, 
            { opacity: glowAnim.interpolate({ inputRange: [0, 1], outputRange: [0.1, 0.35] }) }
          ]} />
          
          <View style={styles.billCard}>
            <View style={styles.billHeaderRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.labelSmall}>Current Amount Due</Text>
                <View style={styles.amountRow}>
                  <Text style={styles.currency}>₹</Text>
                  <Text style={styles.amountWhole} numberOfLines={1} adjustsFontSizeToFit>{Math.floor(totalDue)}</Text>
                  <Text style={styles.amountDecimal}>.{(totalDue % 1).toFixed(2).substring(2)}</Text>
                </View>
              </View>
              <View style={{alignItems: 'flex-end', justifyContent: 'flex-start', marginLeft: 10 }}>
                <Text style={styles.labelSmall}>Due Date</Text>
                <Text style={styles.dueDateValue}>{dueBills.length > 0 ? dueBills[0].dueDate : 'N/A'}</Text>
              </View>
            </View>

            <View style={styles.statsGrid}>
              <View style={styles.statBox}>
                <Text style={styles.labelTiny}>Consumption</Text>
                <Text style={styles.statHero}>{latestUnits} <Text style={styles.statUnit}>kWh</Text></Text>
              </View>
              <View style={[styles.statBox, { borderLeftWidth: 2, borderLeftColor: COLORS.secondary }]}>
                <Text style={styles.labelTiny}>Status</Text>
                <View style={styles.statusRow}>
                  <Text style={styles.statusActive}>Active</Text>
                  <Animated.View style={[
                    styles.statusDot, 
                    { opacity: glowAnim.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1] }) }
                  ]} />
                </View>
              </View>
            </View>

            {/* Pay Button */}
            {dueBills.length > 0 ? (
              <TouchableOpacity activeOpacity={0.8} onPress={() => navigation.navigate('PayBill', { bills: dueBills })}>
                <LinearGradient
                  colors={[COLORS.primary, COLORS.primary_dim]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.payBtn}
                >
                  <Text style={styles.payBtnText}>PAY CURRENT BILL</Text>
                </LinearGradient>
              </TouchableOpacity>
            ) : (
              <View style={styles.allClearBtn}>
                <Text style={styles.allClearText}>EFFICIENCY MAXIMUM</Text>
              </View>
            )}
          </View>
        </View>

        {/* Quick Actions Bento */}
        <View style={styles.bentoGrid}>
          <TouchableOpacity style={styles.bentoBox} activeOpacity={0.7} onPress={() => navigation.navigate('BillHistory')}>
            <MaterialIcons name="receipt-long" size={IS_SMALL_DEVICE ? 24 : 32} color={COLORS.primary} style={{marginBottom: 8}} />
            <Text style={styles.bentoLabel}>HISTORY</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.bentoBox} activeOpacity={0.7} onPress={() => navigation.navigate('ProfileDetails')}>
            <MaterialIcons name="manage-accounts" size={IS_SMALL_DEVICE ? 24 : 32} color={COLORS.primary} style={{marginBottom: 8}} />
            <Text style={styles.bentoLabel}>PROFILE</Text>
          </TouchableOpacity>
        </View>

        {/* Payment History / Recent Activity */}
        <View style={styles.historySection}>
          <View style={styles.historyHeader}>
            <Text style={styles.historyTitle}>Payment History</Text>
            <TouchableOpacity onPress={() => navigation.navigate('BillHistory')}>
              <Text style={styles.viewAllText}>VIEW ALL</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.historyList}>
            {recentBills.length === 0 ? (
              <Text style={{color: COLORS.on_surface_variant, fontSize: 12}}>No transaction history available.</Text>
            ) : (
              recentBills.map((bill, index) => (
                <View style={styles.historyItem} key={index}>
                  <View style={styles.historyItemLeft}>
                    <View style={[styles.iconBox, { backgroundColor: COLORS.surface_highest }]}>
                      {bill.status === 'paid' ? (
                        <MaterialIcons name="check-circle" size={18} color={COLORS.secondary} />
                      ) : (
                        <MaterialIcons name="pending-actions" size={18} color={COLORS.primary} />
                      )}
                    </View>
                    <View style={{flexShrink: 1}}>
                      <Text style={styles.itemTitle} numberOfLines={1}>
                        {bill.billingMonth || 'Billing Cycle'}
                      </Text>
                      <Text style={styles.itemSub}>Due: {bill.dueDate}</Text>
                    </View>
                  </View>
                  <Text style={bill.status === 'paid' ? styles.itemValueSecondary : styles.itemValuePrimary}>
                    ₹{bill.totalAmount.toFixed(2)}
                  </Text>
                </View>
              ))
            )}
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 40 : 20, // Lowered app bar physically
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
    zIndex: 50,
    backgroundColor: COLORS.background,
  },
  appBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  appBarTitle: {
    color: COLORS.primary,
    fontSize: IS_SMALL_DEVICE ? 14 : 16,
    fontWeight: '900',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginLeft: 8,
  },
  appBarRight: {
    flexDirection: 'row',
  },
  iconBtn: {
    padding: IS_SMALL_DEVICE ? 6 : 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  scrollContent: {
    paddingHorizontal: IS_SMALL_DEVICE ? 16 : 24,
    paddingTop: IS_SMALL_DEVICE ? 24 : 32,
    paddingBottom: 40,
  },
  titleSection: {
    marginBottom: IS_SMALL_DEVICE ? 24 : 32,
  },
  pageTitle: {
    fontSize: IS_SMALL_DEVICE ? 36 : 48,
    fontWeight: '700',
    color: COLORS.on_surface,
    letterSpacing: -1,
    marginBottom: 4,
  },
  accountId: {
    color: COLORS.on_surface_variant,
    fontSize: IS_SMALL_DEVICE ? 10 : 11,
    fontWeight: '700',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  billCardWrapper: {
    position: 'relative',
    marginBottom: IS_SMALL_DEVICE ? 16 : 24,
  },
  billCardGlow: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.primary,
    borderRadius: 24,
    transform: [{ scale: 1.05 }],
    opacity: 0.15, 
  },
  billCard: {
    backgroundColor: COLORS.surface_highest,
    borderRadius: 24,
    padding: IS_SMALL_DEVICE ? 20 : 24,
    borderWidth: 1,
    borderColor: 'rgba(129, 236, 255, 0.1)',
  },
  billHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: IS_SMALL_DEVICE ? 20 : 32,
  },
  labelSmall: {
    color: COLORS.on_surface_variant,
    fontSize: IS_SMALL_DEVICE ? 9 : 10,
    fontWeight: '700',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  currency: {
    color: COLORS.primary,
    fontSize: IS_SMALL_DEVICE ? 20 : 24,
    fontWeight: '700',
    marginRight: 4,
  },
  amountWhole: {
    color: COLORS.primary,
    fontSize: IS_SMALL_DEVICE ? 36 : 48,
    fontWeight: '800',
    letterSpacing: -1,
  },
  amountDecimal: {
    color: COLORS.primary_dim,
    fontSize: IS_SMALL_DEVICE ? 18 : 24,
    fontWeight: '400',
  },
  dueDateValue: {
    color: COLORS.on_surface,
    fontSize: IS_SMALL_DEVICE ? 14 : 16,
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    marginBottom: IS_SMALL_DEVICE ? 20 : 28,
  },
  statBox: {
    flex: 1,
    backgroundColor: COLORS.surface_low,
    padding: IS_SMALL_DEVICE ? 12 : 16,
    borderRadius: 12,
    marginRight: 8,
  },
  labelTiny: {
    color: COLORS.on_surface_variant,
    fontSize: IS_SMALL_DEVICE ? 8 : 9,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  statHero: {
    color: COLORS.on_surface,
    fontSize: IS_SMALL_DEVICE ? 16 : 20,
    fontWeight: '600',
  },
  statUnit: {
    fontSize: IS_SMALL_DEVICE ? 10 : 12,
    color: COLORS.on_surface_variant,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusActive: {
    color: COLORS.secondary,
    fontSize: IS_SMALL_DEVICE ? 16 : 20,
    fontWeight: '700',
  },
  statusDot: {
    width: IS_SMALL_DEVICE ? 6 : 8,
    height: IS_SMALL_DEVICE ? 6 : 8,
    borderRadius: 4,
    backgroundColor: COLORS.secondary,
    marginLeft: 8,
  },
  payBtn: {
    height: IS_SMALL_DEVICE ? 52 : 60,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.primary_container,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
  },
  payBtnText: {
    color: '#004d57', 
    fontSize: IS_SMALL_DEVICE ? 14 : 16,
    fontWeight: '800',
    letterSpacing: 1,
  },
  allClearBtn: {
    height: IS_SMALL_DEVICE ? 52 : 60,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.surface_low,
    borderWidth: 1,
    borderColor: COLORS.secondary,
  },
  allClearText: {
    color: COLORS.secondary,
    fontSize: IS_SMALL_DEVICE ? 12 : 14,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  bentoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: IS_SMALL_DEVICE ? 20 : 32,
  },
  bentoBox: {
    width: IS_SMALL_DEVICE ? (width - 40) / 2 : (width - 56) / 2, 
    backgroundColor: COLORS.surface_low,
    padding: IS_SMALL_DEVICE ? 16 : 20,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  bentoLabel: {
    color: COLORS.on_surface_variant,
    fontSize: IS_SMALL_DEVICE ? 9 : 10,
    fontWeight: '700',
    letterSpacing: 1,
  },
  historySection: {
    backgroundColor: COLORS.surface_low,
    borderRadius: 20,
    padding: IS_SMALL_DEVICE ? 20 : 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: IS_SMALL_DEVICE ? 16 : 24,
  },
  historyTitle: {
    color: COLORS.on_surface,
    fontSize: IS_SMALL_DEVICE ? 16 : 18,
    fontWeight: '700',
  },
  viewAllText: {
    color: COLORS.primary,
    fontSize: IS_SMALL_DEVICE ? 9 : 10,
    fontWeight: '700',
    letterSpacing: 1,
  },
  historyList: {
    rowGap: IS_SMALL_DEVICE ? 16 : 20, 
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  historyItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingRight: 8,
  },
  iconBox: {
    width: IS_SMALL_DEVICE ? 36 : 40,
    height: IS_SMALL_DEVICE ? 36 : 40,
    borderRadius: IS_SMALL_DEVICE ? 18 : 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  itemTitle: {
    color: COLORS.on_surface,
    fontSize: IS_SMALL_DEVICE ? 12 : 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  itemSub: {
    color: COLORS.on_surface_variant,
    fontSize: IS_SMALL_DEVICE ? 9 : 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  itemValuePrimary: {
    color: COLORS.primary, // Unpaid uses Cyan primary
    fontSize: IS_SMALL_DEVICE ? 13 : 14,
    fontWeight: '700',
    flexShrink: 0,
  },
  itemValueSecondary: {
    color: COLORS.secondary, // Paid uses Green secondary
    fontSize: IS_SMALL_DEVICE ? 13 : 14,
    fontWeight: '700',
    flexShrink: 0,
  }
});
