import React, { useContext, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Linking, Platform } from 'react-native';
import { AuthContext, Bill } from '../../context/AuthContext';
import { useRoute, useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

export default function PayBillScreen() {
  const { payBill } = useContext(AuthContext);
  const route: any = useRoute();
  const navigation = useNavigation();
  const { bills } = route.params;

  const [loading, setLoading] = useState(false);

  const handlePay = async (bill: Bill) => {
    const upiUrl = `upi://pay?pa=currentlink@upi&pn=CurrentLinkElectricity&am=${bill.totalAmount.toFixed(2)}&tr=${bill.id}&cu=INR`;

    try {
      if (Platform.OS === 'web') {
        window.alert(`[Simulating Native Intent]\n\nYou are being redirected to your UPI App (GPay/PhonePe).\n\nPayee: CurrentLink\nAmount: ₹${bill.totalAmount.toFixed(2)}\nTransaction ID: ${bill.id}`);
        confirmPayment(bill.id);
      } else {
        const supported = await Linking.canOpenURL(upiUrl);
        if (supported) {
          await Linking.openURL(upiUrl);
          // Wait briefly for them to transition, then queue the mock confirmation
          setTimeout(() => confirmPayment(bill.id), 2000);
        } else {
          Alert.alert("App Not Found", "No compatible UPI app detected. Please install Google Pay, PhonePe, or Paytm.");
        }
      }
    } catch (e) {
      Platform.OS === 'web' ? window.alert("Unable to trigger UPI Application") : Alert.alert("Error", "Unable to trigger UPI Application");
    }
  };

  const confirmPayment = (billId: string) => {
    if (Platform.OS === 'web') {
       if(window.confirm("Did you successfully complete the UPI transfer? (Mock Demo)")) {
           executePayLogic(billId);
       }
    } else {
      Alert.alert(
        "Confirm UPI Transfer",
        "Did you successfully complete the payment inside your UPI app?",
        [
          { text: "No, Cancelled", style: "cancel" },
          { text: "Yes, Paid Successfully", onPress: () => executePayLogic(billId) }
        ]
      );
    }
  };

  const executePayLogic = async (billId: string) => {
    setLoading(true);
    try {
      await payBill(billId);
      Platform.OS === 'web' ? window.alert('UPI Payment Validated and Successful!') : Alert.alert('Success', 'UPI Payment Validated and Successful!');
      navigation.goBack();
    } catch (e: any) {
      Platform.OS === 'web' ? window.alert(`Error: ${e.message}`) : Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.mainContainer}>
      <View style={[styles.orb, styles.orbTop]} />
      <View style={[styles.orb, styles.orbBottom]} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.backBtnText}>{'<'} BACK</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Pending Transactions</Text>
        </View>

        {bills.map((b: Bill) => (
          <BlurView key={b.id} intensity={20} tint="dark" style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.date}>{b.billingMonth ? `${b.billingMonth} - ` : ''}{b.readingDate}</Text>
              <Text style={styles.amount}>₹{b.totalAmount.toFixed(2)}</Text>
            </View>
            
            <View style={styles.row}>
              <Text style={styles.textLabel}>DUE DATE</Text>
              <Text style={styles.textValue}>{b.dueDate}</Text>
            </View>
            
            <View style={styles.row}>
              <Text style={styles.textLabel}>UNITS CONSUMED</Text>
              <Text style={styles.textValue}>{b.unitsConsumed}</Text>
            </View>
            
            <TouchableOpacity 
              activeOpacity={loading ? 1 : 0.8}
              onPress={() => !loading && handlePay(b)}
              disabled={loading}
              style={{ marginTop: 24 }}
            >
              <LinearGradient
                colors={loading ? ['#334155', '#1E293B'] : ['#8B5CF6', '#3B82F6']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.payBtn}
              >
                <Text style={[styles.payBtnText, loading && { color: '#94A3B8' }]}>
                  {loading ? 'PROCESSING...' : 'INITIATE UPI TRANSFER'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </BlurView>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: '#0B0F19' },
  orb: { position: 'absolute', width: 300, height: 300, borderRadius: 150, opacity: 0.15 },
  orbTop: { top: -50, right: -50, backgroundColor: '#8B5CF6' },
  orbBottom: { bottom: -100, left: -50, width: 400, height: 400, borderRadius: 200, backgroundColor: '#3B82F6' },
  
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },
  header: { paddingTop: 60, paddingBottom: 20 },
  backBtn: { marginBottom: 15 },
  backBtnText: { color: '#00E5FF', fontSize: 12, fontWeight: '800', letterSpacing: 2 },
  title: { fontSize: 28, fontWeight: '900', color: '#F8FAFC', letterSpacing: 1 },

  card: { padding: 24, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', backgroundColor: 'rgba(15, 23, 42, 0.6)', overflow: 'hidden', marginBottom: 20 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.1)', paddingBottom: 16 },
  date: { fontSize: 16, fontWeight: '800', color: '#F8FAFC', letterSpacing: 1 },
  amount: { fontSize: 24, fontWeight: '900', color: '#EF4444', textShadowColor: 'rgba(239, 68, 68, 0.4)', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 8 },
  
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  textLabel: { fontSize: 11, color: '#94A3B8', fontWeight: '700', letterSpacing: 1 },
  textValue: { fontSize: 14, color: '#F8FAFC', fontWeight: '600' },
  
  payBtn: { padding: 16, borderRadius: 12, alignItems: 'center', shadowColor: '#8B5CF6', shadowOpacity: 0.3, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } },
  payBtnText: { color: '#FFFFFF', fontSize: 13, fontWeight: '800', letterSpacing: 2 }
});
