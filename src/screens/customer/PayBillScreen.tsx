import React, { useContext, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Linking, Platform } from 'react-native';
import { AuthContext, Bill } from '../../context/AuthContext';
import { useRoute, useNavigation } from '@react-navigation/native';

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
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Pending Bills</Text>
      
      {bills.map((b: Bill) => (
        <View key={b.id} style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.date}>{b.billingMonth ? `${b.billingMonth} - ` : ''}{b.readingDate}</Text>
            <Text style={styles.amount}>₹{b.totalAmount.toFixed(2)}</Text>
          </View>
          <Text style={styles.text}>Due Date: {b.dueDate}</Text>
          <Text style={styles.text}>Units Consumed: {b.unitsConsumed}</Text>
          
          <TouchableOpacity 
            style={[styles.payBtn, loading && { opacity: 0.7 }]} 
            onPress={() => handlePay(b)}
            disabled={loading}
          >
            <Text style={styles.payBtnText}>{loading ? 'Processing...' : 'Pay entirely via UPI'}</Text>
          </TouchableOpacity>
        </View>
      ))}
      
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6', padding: 20 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#1F2937', marginBottom: 20, marginTop: 40 },
  card: { backgroundColor: '#FFF', padding: 20, borderRadius: 10, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5, elevation: 2, marginBottom: 20 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  date: { fontSize: 16, fontWeight: 'bold', color: '#374151' },
  amount: { fontSize: 20, fontWeight: 'bold', color: '#EF4444' },
  text: { fontSize: 14, color: '#6B7280', marginBottom: 5 },
  payBtn: { backgroundColor: '#10B981', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 15 },
  payBtnText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' }
});
