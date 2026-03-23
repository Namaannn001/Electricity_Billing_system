import React, { useContext, useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, Dimensions, Animated } from 'react-native';
import { AuthContext, User, Bill } from '../../context/AuthContext';
import { useRoute, useNavigation } from '@react-navigation/native';
import { showError } from '../../utils/validators';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { scheduleNewBillNotification, sendRemotePushNotification } from '../../utils/notifications';

const { width } = Dimensions.get('window');
const IS_SMALL_DEVICE = width < 380;

const COLORS = {
  background: '#0e0e0e',
  surface_low: '#131313',
  surface_highest: '#262626',
  primary: '#81ecff',
  primary_dim: '#00d4ec',
  secondary: '#2ff801',
  error: '#ff716c',
  error_container: 'rgba(255, 113, 108, 0.2)',
  on_surface: '#ffffff',
  on_surface_variant: '#adaaaa',
  outline: '#777575',
};

export default function UserDetailsScreen() {
  const { getAllUsers, addBill, getCustomerBills } = useContext(AuthContext);
  const route: any = useRoute();
  const navigation: any = useNavigation();
  const { userId } = route.params;

  const [customer, setCustomer] = useState<User | null>(null);
  const [bills, setBills] = useState<Bill[]>([]);
  const [reading, setReading] = useState('');
  const [billingMonth, setBillingMonth] = useState('Jan');
  const [activeInput, setActiveInput] = useState<string | null>(null);

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 1, duration: 2000, useNativeDriver: true }),
        Animated.timing(glowAnim, { toValue: 0, duration: 2000, useNativeDriver: true })
      ])
    ).start();

    const fetchData = async () => {
      const users = await getAllUsers();
      const found = users.find(u => u.id === userId);
      setCustomer(found || null);

      if (found) {
        const customerBills = await getCustomerBills(found.id);
        setBills(customerBills.sort((a,b) => Number(b.id) - Number(a.id))); // latest first
      }
    };
    fetchData();
  }, [userId]);

  const handleGenerateBill = async () => {
    if (!reading || isNaN(Number(reading)) || reading.trim() === '') {
      showError('Please enter a valid numeric meter reading');
      return;
    }
    
    if (!customer) return;

    const currentReading = Number(reading);
    
    if (currentReading < 0) {
      showError('Meter reading cannot be a negative number');
      return;
    }

    const previousReading = bills.length > 0 ? bills[0].currentReading : 0; 
    if (currentReading < previousReading) {
      showError(`Current reading (${currentReading}) cannot be less than previous reading (${previousReading})`);
      return;
    }

    const unitsConsumed = currentReading - previousReading;
    const ratePerUnit = 5.5; 
    const baseEnergyCost = unitsConsumed * ratePerUnit;
    const fixedTaxes = 105; 
    const totalAmount = baseEnergyCost + fixedTaxes;
    
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 15);

    try {
      await addBill({
        customerId: customer.id,
        meterNumber: customer.meterNumber || 'N/A',
        billingMonth,
        readingDate: new Date().toISOString().split('T')[0],
        currentReading,
        previousReading,
        unitsConsumed,
        totalAmount,
        dueDate: dueDate.toISOString().split('T')[0],
        status: 'unpaid'
      });
      
      await scheduleNewBillNotification(totalAmount, customer.meterNumber || 'N/A');

      const allUsers = await getAllUsers();
      const targetUser = allUsers.find(u => u.id === customer.id);
      
      if (targetUser?.pushToken) {
        await sendRemotePushNotification(
          targetUser.pushToken, 
          '⚡ NEW ENERGY BILL', 
          `Your bill for ${billingMonth} (₹${totalAmount.toFixed(2)}) has been generated.`
        );
      }

      window && window.alert ? window.alert('Success: System bill generated.') : Alert.alert('Success', 'System bill generated.');
      setReading('');
      
      const updatedBills = await getCustomerBills(customer.id);
      setBills(updatedBills.sort((a,b) => Number(b.id) - Number(a.id)));
    } catch (e: any) {
      showError(e.message);
    }
  };

  if (!customer) return <SafeAreaView style={styles.mainContainer}><Text style={{color: COLORS.on_surface, textAlign: 'center', marginTop: 50}}>Initializing...</Text></SafeAreaView>;

  return (
    <SafeAreaView style={styles.mainContainer}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={styles.mainContainer}
      >
        {/* Ambient background glows */}
        <View style={styles.ambientGlowTop} />

        <View style={styles.appBar}>
          <TouchableOpacity style={styles.backBtn} activeOpacity={0.7} onPress={() => navigation.goBack()}>
            <MaterialIcons name="arrow-back" size={24} color={COLORS.primary} style={{ marginRight: 8 }} />
            <Text style={styles.backBtnText}>BACK </Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <Text style={styles.pageTitle}>Entity <Text style={{color: COLORS.primary}}>Details</Text></Text>

          <View style={styles.identityCard}>
            <Text style={styles.sectionBadge}>IDENTITY CONFIGURATION</Text>
            <View style={styles.grid}>
              <View style={styles.gridItem}>
                <Text style={styles.dataLabel}>ENTITY NAME</Text>
                <Text style={styles.dataValue}>{customer.name}</Text>
              </View>
              <View style={styles.gridItem}>
                <Text style={styles.dataLabel}>METER VECTOR</Text>
                <Text style={[styles.dataValue, {color: COLORS.primary}]}>{customer.meterNumber}</Text>
              </View>
            </View>
            
            <View style={[styles.grid, {marginTop: 24}]}>
              <View style={styles.gridItem}>
                <Text style={styles.dataLabel}>EMAIL IDENTIFIER</Text>
                <Text style={styles.dataValue} numberOfLines={1} ellipsizeMode="tail">{customer.email}</Text>
              </View>
              <View style={styles.gridItem}>
                <Text style={styles.dataLabel}>PHONE NO</Text>
                <Text style={styles.dataValue}>{customer.phoneNumber || 'N/A'}</Text>
              </View>
            </View>
          </View>

          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>GENERATE TRANSACTION</Text>
            <View style={styles.activeTag}>
              <Animated.View style={[styles.pulseDot, { opacity: glowAnim.interpolate({ inputRange: [0,1], outputRange: [0.3, 1] }) }]} />
              <Text style={styles.tagText}>LIVE</Text>
            </View>
          </View>

          <View style={styles.inputCard}>
            <Text style={styles.inputLabel}>TARGET EXTRACTION CYCLE (MONTH)</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.monthScroll} contentContainerStyle={{ paddingRight: 10 }}>
              {months.map(m => (
                <TouchableOpacity 
                  key={m} 
                  style={[styles.monthChip, billingMonth === m && styles.monthChipActive]}
                  onPress={() => setBillingMonth(m)}
                >
                  <Text style={[styles.monthText, billingMonth === m && styles.monthTextActive]}>{m.toUpperCase()}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.inputLabel}>METER READING (KWH)</Text>
            <TextInput 
              style={[styles.inputField, activeInput === 'read' && styles.inputActive]} 
              keyboardType="numeric" 
              value={reading} 
              onChangeText={setReading} 
              onFocus={() => setActiveInput('read')}
              onBlur={() => setActiveInput(null)}
              placeholder="0000" 
              placeholderTextColor={COLORS.outline}
            />
            
            <TouchableOpacity onPress={handleGenerateBill} activeOpacity={0.8} style={styles.btnWrapper}>
              <LinearGradient
                colors={[COLORS.primary_dim, COLORS.primary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.actionBtn}
              >
                <Text style={styles.actionText}>EXECUTE BILL GENERATION</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          <Text style={styles.sectionTitle}>TRANSACTION LOGS</Text>
          {bills.map((b) => (
            <View key={b.id} style={styles.billCard}>
              <View style={styles.billRow}>
                <Text style={styles.billDate}>{b.billingMonth ? `${b.billingMonth.toUpperCase()} CYCLE` : 'LATEST CYCLE'}</Text>
                <View style={[styles.statusGradient, { backgroundColor: b.status === 'paid' ? 'rgba(47, 248, 1, 0.1)' : COLORS.error_container, borderColor: b.status === 'paid' ? 'rgba(47, 248, 1, 0.3)' : 'rgba(255, 113, 108, 0.3)' }]}>
                  <Text style={[styles.statusText, b.status === 'paid' ? { color: COLORS.secondary } : { color: COLORS.error }]}>
                    {b.status.toUpperCase()}
                  </Text>
                </View>
              </View>
              <View style={styles.billRow}>
                <Text style={styles.billTextLabel}>UNITS EXTRACTED:</Text>
                <Text style={styles.billVal}>{b.unitsConsumed}</Text>
              </View>
              <View style={styles.billRow}>
                <Text style={styles.billTextLabel}>LEVIES:</Text>
                <Text style={styles.amount}>₹{b.totalAmount.toFixed(2)}</Text>
              </View>
            </View>
          ))}
          {bills.length === 0 && <Text style={styles.emptyText}>NO TRANSACTION DATA LOCATED.</Text>}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  mainContainer: { 
    flex: 1, 
    backgroundColor: COLORS.background 
  },
  ambientGlowTop: { 
    position: 'absolute', 
    top: -100, 
    left: -100, 
    width: width * 0.8, 
    height: width * 0.8, 
    borderRadius: width, 
    backgroundColor: 'rgba(129, 236, 255, 0.04)' 
  },
  appBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)'
  },
  backBtn: { 
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  backBtnText: { 
    color: '#ffffff', 
    fontSize: 12, 
    fontWeight: '800', 
    letterSpacing: 2 
  },
  scrollContent: { 
    paddingHorizontal: IS_SMALL_DEVICE ? 16 : 24, 
    paddingTop: 32,
    paddingBottom: 60, 
    flexGrow: 1 
  },
  pageTitle: {
    fontSize: IS_SMALL_DEVICE ? 32 : 40,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: -1,
    marginBottom: 32,
  },
  identityCard: { 
    padding: 24, 
    borderRadius: 16, 
    borderWidth: 1, 
    borderColor: 'rgba(255,255,255,0.05)', 
    backgroundColor: COLORS.surface_highest, 
    marginBottom: 32 
  },
  sectionBadge: { 
    fontSize: 10, 
    fontWeight: '900', 
    color: COLORS.on_surface_variant, 
    marginBottom: 24, 
    letterSpacing: 2 
  },
  grid: { flexDirection: 'row', gap: 16 },
  gridItem: { flex: 1 },
  dataLabel: { 
    fontSize: 9, 
    color: COLORS.outline, 
    fontWeight: '800', 
    letterSpacing: 1,
    marginBottom: 8
  },
  dataValue: { 
    fontSize: 14, 
    color: '#ffffff', 
    fontWeight: '800' 
  },
  sectionHeaderRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 16 
  },
  sectionTitle: { 
    fontSize: 12, 
    fontWeight: '900', 
    color: COLORS.primary, 
    letterSpacing: 2,
    marginTop: 16,
    marginBottom: 16
  },
  activeTag: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: 'rgba(129, 236, 255, 0.1)', 
    paddingHorizontal: 10, 
    paddingVertical: 4, 
    borderRadius: 12, 
    borderWidth: 1, 
    borderColor: 'rgba(129, 236, 255, 0.3)'
  },
  pulseDot: { 
    width: 6, 
    height: 6, 
    borderRadius: 3, 
    backgroundColor: COLORS.primary, 
    marginRight: 6 
  },
  tagText: { 
    color: COLORS.primary, 
    fontSize: 9, 
    fontWeight: '900', 
    letterSpacing: 1 
  },
  inputCard: { 
    padding: 24, 
    borderRadius: 16, 
    borderWidth: 1, 
    borderColor: 'rgba(255,255,255,0.05)', 
    backgroundColor: COLORS.surface_low, 
    marginBottom: 32 
  },
  inputLabel: { 
    fontSize: 10, 
    color: COLORS.on_surface_variant, 
    marginBottom: 12, 
    fontWeight: '800', 
    letterSpacing: 1 
  },
  inputField: { 
    backgroundColor: COLORS.surface_highest, 
    borderWidth: 1, 
    borderColor: 'rgba(255, 255, 255, 0.05)', 
    borderRadius: 12, 
    paddingHorizontal: 16, 
    height: 56,
    fontSize: 16, 
    color: '#ffffff',
    fontWeight: '700',
    marginBottom: 24
  },
  inputActive: { 
    borderColor: COLORS.primary, 
    backgroundColor: 'rgba(129, 236, 255, 0.05)' 
  },
  monthScroll: { 
    marginBottom: 24, 
    height: 44 
  },
  monthChip: { 
    paddingHorizontal: 20, 
    height: 40, 
    borderRadius: 20, 
    backgroundColor: COLORS.surface_highest, 
    marginRight: 12, 
    borderWidth: 1, 
    borderColor: 'transparent', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  monthChipActive: { 
    backgroundColor: 'rgba(129, 236, 255, 0.1)', 
    borderColor: COLORS.primary 
  },
  monthText: { 
    color: COLORS.on_surface_variant, 
    fontWeight: '800', 
    fontSize: 10, 
    letterSpacing: 1 
  },
  monthTextActive: { 
    color: COLORS.primary 
  },
  btnWrapper: { 
    marginTop: 8 
  },
  actionBtn: { 
    height: 56, 
    borderRadius: 12, 
    alignItems: 'center',
    justifyContent: 'center'
  },
  actionText: { 
    color: '#003840', 
    fontSize: 12, 
    fontWeight: '900', 
    letterSpacing: 2 
  },
  emptyText: { 
    color: COLORS.on_surface_variant, 
    textAlign: 'center', 
    marginTop: 40, 
    fontSize: 11, 
    fontWeight: '800', 
    letterSpacing: 2 
  },
  billCard: { 
    padding: 24, 
    borderRadius: 16, 
    marginBottom: 16, 
    borderWidth: 1, 
    borderColor: 'rgba(255,255,255,0.05)', 
    backgroundColor: COLORS.surface_low, 
  },
  billRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 12 
  },
  billDate: { 
    fontSize: 12, 
    fontWeight: '900', 
    color: '#ffffff', 
    letterSpacing: 1 
  },
  statusGradient: { 
    paddingVertical: 6, 
    paddingHorizontal: 12, 
    borderRadius: 12, 
    borderWidth: 1, 
  },
  statusText: { 
    fontSize: 9, 
    fontWeight: '900', 
    letterSpacing: 1 
  },
  billTextLabel: { 
    fontSize: 10, 
    color: COLORS.on_surface_variant, 
    fontWeight: '800', 
    letterSpacing: 1 
  },
  billVal: { 
    fontSize: 14, 
    color: '#ffffff', 
    fontWeight: '800' 
  },
  amount: { 
    fontSize: 18, 
    fontWeight: '900', 
    color: COLORS.primary 
  }
});
