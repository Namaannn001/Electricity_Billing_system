import React, { useContext, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Linking, Platform, Dimensions } from 'react-native';
import { AuthContext, Bill } from '../../context/AuthContext';
import { useRoute, useNavigation } from '@react-navigation/native';
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
  error: '#ff716c',
  error_container: '#9f0519',
  on_surface: '#ffffff',
  on_surface_variant: '#adaaaa',
  outline: '#777575',
};

export default function PayBillScreen() {
  const { payBill } = useContext(AuthContext);
  const route: any = useRoute();
  const navigation = useNavigation();
  const { bills } = route.params;

  const [loading, setLoading] = useState(false);

  const totalAmount = bills.reduce((sum: number, b: Bill) => sum + b.totalAmount, 0);

  const handlePay = async () => {
    const trId = bills.length === 1 ? bills[0].id : `bulk_${new Date().getTime()}`;
    const upiUrl = `upi://pay?pa=currentlink@upi&pn=CurrentLinkElectricity&am=${totalAmount.toFixed(2)}&tr=${trId}&cu=INR`;

    try {
      if (Platform.OS === 'web') {
        window.alert(`[Simulating Native Intent]\n\nYou are being redirected to your UPI App (GPay/PhonePe).\n\nPayee: Kinetic Ether Grid\nAmount: ₹${totalAmount.toFixed(2)}\nTransaction ID: ${trId}`);
        confirmPayment();
      } else {
        const supported = await Linking.canOpenURL(upiUrl);
        if (supported) {
          await Linking.openURL(upiUrl);
          setTimeout(() => confirmPayment(), 2000);
        } else {
          Alert.alert("App Not Found", "No compatible UPI app detected. Please install Google Pay, PhonePe, or Paytm.");
        }
      }
    } catch (e) {
      Platform.OS === 'web' ? window.alert("Unable to trigger UPI Application") : Alert.alert("Error", "Unable to trigger UPI Application");
    }
  };

  const confirmPayment = () => {
    if (Platform.OS === 'web') {
       if(window.confirm("Did you successfully complete the UPI transfer? (Mock Demo)")) {
           executePayLogic();
       }
    } else {
      Alert.alert(
        "Confirm UPI Transfer",
        "Did you successfully complete the payment inside your UPI app?",
        [
          { text: "No, Cancelled", style: "cancel" },
          { text: "Yes, Paid Successfully", onPress: () => executePayLogic() }
        ]
      );
    }
  };

  const executePayLogic = async () => {
    setLoading(true);
    try {
      for (const b of bills) {
        await payBill(b.id);
      }
      Platform.OS === 'web' ? window.alert('UPI Payment Validated and Successful!') : Alert.alert('Success', 'UPI Payment Validated and Successful!');
      navigation.goBack();
    } catch (e: any) {
      Platform.OS === 'web' ? window.alert(`Error: ${e.message}`) : Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.ambientGlow} pointerEvents="none" />

      {/* Top Header */}
      <View style={styles.appBar}>
        <View style={styles.appBarLeft}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ paddingRight: 8 }}>
            <MaterialIcons name="arrow-back" size={24} color={COLORS.primary} />
          </TouchableOpacity>
          <MaterialIcons name="bolt" size={20} color={COLORS.primary} />
          <Text style={styles.appBarTitle}>checkout sequence</Text>
        </View>
        <TouchableOpacity style={styles.iconBtn}>
          <MaterialIcons name="security" size={20} color={COLORS.on_surface_variant} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.heroTextCol}>
            <View style={styles.pendingBadge}>
              <Text style={styles.pendingBadgeText}>ACTION REQUIRED</Text>
            </View>
            <Text style={styles.heroAmount}>₹{totalAmount.toFixed(2)}</Text>
            <Text style={styles.heroSub}>
              {bills.length > 1 ? `Paying ${bills.length} Pending Bills` : `Statement Period: ${bills[0]?.billingMonth || 'Active Cycle'}`}
            </Text>
          </View>
          <TouchableOpacity 
            activeOpacity={loading ? 1 : 0.8}
            onPress={() => !loading && handlePay()}
            style={styles.payBtnWrapper}
          >
            <LinearGradient
              colors={[COLORS.primary, COLORS.primary_dim]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.payBtn}
            >
              <Text style={styles.payBtnText}>{loading ? 'PROCESSING...' : 'INITIATE PAY'}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Dynamic Detailed Report List */}
        <View style={styles.detailsContainer}>
          <Text style={styles.sectionHeaderTitle}>Detailed Report</Text>

          {bills.map((b: Bill, index: number) => (
            <View key={b.id} style={styles.reportCard}>
              <View style={styles.cardHeader}>
                <View style={styles.cardHeaderLeft}>
                  <View style={styles.indexCircle}>
                    <Text style={styles.indexText}>0{index + 1}</Text>
                  </View>
                  <View>
                    <Text style={styles.cycleTitle}>{b.billingMonth || 'Data Stream'}</Text>
                    <Text style={styles.readingDate}>{b.readingDate}</Text>
                  </View>
                </View>
                <View style={styles.amountBox}>
                  <Text style={styles.billAmount}>₹{b.totalAmount.toFixed(2)}</Text>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.metricsGrid}>
                <View style={styles.metricBlock}>
                  <Text style={styles.metricLabel}>PREVIOUS</Text>
                  <Text style={styles.metricValue}>{b.previousReading}</Text>
                </View>
                
                <MaterialIcons name="arrow-forward" size={16} color={COLORS.outline} style={{ alignSelf: 'center', marginHorizontal: 8 }} />
                
                <View style={styles.metricBlock}>
                  <Text style={styles.metricLabel}>CURRENT</Text>
                  <Text style={styles.metricValuePrimary}>{b.currentReading}</Text>
                </View>

                <View style={styles.metricBlockEnd}>
                  <Text style={styles.metricLabelEnd}>CONSUMPTION</Text>
                  <Text style={styles.metricValue}>{b.unitsConsumed} Units</Text>
                </View>
              </View>

              <View style={styles.footerRow}>
                <View style={[styles.statusTag, { backgroundColor: 'rgba(129, 236, 255, 0.1)' }]}>
                  <Text style={[styles.statusTagText, { color: COLORS.primary }]}>DUE: {b.dueDate}</Text>
                </View>
                <Text style={styles.nodeRef}>Node: {b.meterNumber}</Text>
              </View>
            </View>
          ))}
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
  ambientGlow: {
    position: 'absolute',
    top: -height * 0.2,
    left: -width * 0.2,
    width: width * 1.5,
    height: width * 1.5,
    borderRadius: width * 0.75,
    backgroundColor: 'rgba(44, 44, 44, 0.3)',
  },
  appBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 40 : 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
    zIndex: 50,
  },
  appBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  appBarTitle: {
    color: COLORS.primary,
    fontSize: IS_SMALL_DEVICE ? 12 : 14,
    fontWeight: '900',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginLeft: 8,
  },
  iconBtn: {
    padding: IS_SMALL_DEVICE ? 6 : 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  scrollContent: {
    paddingHorizontal: IS_SMALL_DEVICE ? 16 : 24,
    paddingTop: IS_SMALL_DEVICE ? 20 : 32,
    paddingBottom: 60,
  },
  heroSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 40,
    flexWrap: 'wrap',
    gap: 20,
  },
  heroTextCol: {
    flex: 1,
    minWidth: 180,
  },
  pendingBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(0, 227, 253, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 227, 253, 0.3)',
  },
  pendingBadgeText: {
    color: COLORS.primary,
    fontSize: 9,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  heroAmount: {
    fontSize: IS_SMALL_DEVICE ? 42 : 56,
    fontWeight: '800',
    color: COLORS.on_surface,
    letterSpacing: -2,
    marginBottom: 4,
  },
  heroSub: {
    color: COLORS.on_surface_variant,
    fontSize: IS_SMALL_DEVICE ? 12 : 14,
    fontWeight: '500',
  },
  payBtnWrapper: {
    width: IS_SMALL_DEVICE ? '100%' : 'auto',
  },
  payBtn: {
    paddingHorizontal: 36,
    paddingVertical: 18,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 8,
  },
  payBtnText: {
    color: COLORS.primary_container,
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 2,
  },
  detailsContainer: {
    gap: 20,
  },
  sectionHeaderTitle: {
    fontSize: IS_SMALL_DEVICE ? 20 : 24,
    fontWeight: '800',
    color: COLORS.on_surface,
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  reportCard: {
    backgroundColor: COLORS.surface_low,
    borderRadius: 20,
    padding: IS_SMALL_DEVICE ? 20 : 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.03)',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  indexCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.surface_highest,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  indexText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '800',
  },
  cycleTitle: {
    color: COLORS.on_surface,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 2,
  },
  readingDate: {
    color: COLORS.on_surface_variant,
    fontSize: 12,
  },
  amountBox: {
    alignItems: 'flex-end',
  },
  billAmount: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.on_surface,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
    marginBottom: 20,
  },
  metricsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface_highest,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  metricBlock: {
    flex: 1,
  },
  metricBlockEnd: {
    flex: 1,
    alignItems: 'flex-end',
  },
  metricLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: COLORS.on_surface_variant,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  metricLabelEnd: {
    fontSize: 9,
    fontWeight: '700',
    color: COLORS.on_surface_variant,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 4,
    textAlign: 'right',
  },
  metricValue: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.on_surface,
  },
  metricValuePrimary: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.primary,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  statusTagText: {
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  nodeRef: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.outline,
    letterSpacing: 2,
    textTransform: 'uppercase',
  }
});
