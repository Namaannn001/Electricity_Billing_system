import React, { useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Platform } from 'react-native';
import { AuthContext, Bill, User } from '../../context/AuthContext';
import { useRoute, useNavigation } from '@react-navigation/native';
import * as Print from 'expo-print';
import { shareAsync } from 'expo-sharing';

export default function ReceiptScreen() {
  const { user } = useContext(AuthContext);
  const route: any = useRoute();
  const navigation = useNavigation();
  const { bill } = route.params;

  if (!user || !bill) return null;

  const generateHTML = (item: Bill, cUser: User) => `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Electricity Bill Receipt</title>
        <style>
          body { 
            font-family: 'Arial', sans-serif; 
            padding: 40px; 
            color: #000; 
            background-color: #FFF;
          }
          h1 { text-align: center; margin-bottom: 40px; }
          .section-title { 
            font-weight: bold; 
            font-size: 18px; 
            text-transform: uppercase;
            margin-top: 30px; 
            margin-bottom: 15px; 
            text-decoration: underline;
          }
          .line-item { margin-bottom: 10px; font-size: 16px; }
          .bold { font-weight: bold; }
          .total-highlight {
            font-size: 20px;
            font-weight: bold;
            margin-top: 20px;
            border-top: 2px dashed #000;
            padding-top: 20px;
          }
          .status { font-weight: bold; font-size: 20px; margin-top: 20px; text-transform: uppercase; }
        </style>
      </head>
      <body>
        <h1>OFFICIAL ELECTRICITY RECEIPT</h1>
        <div class="status">Status: ${item.status === 'paid' ? '<span style="color: green">PAID</span>' : '<span style="color: red">NOT PAID</span>'}</div>

        <div class="section-title">Customer Details</div>
        <div class="line-item"><span class="bold">Customer Name:</span> ${cUser.name}</div>
        <div class="line-item"><span class="bold">Meter Number:</span> ${cUser.meterNumber}</div>
        <div class="line-item"><span class="bold">Address:</span> ${cUser.address || 'N/A'}</div>
        <div class="line-item"><span class="bold">City:</span> ${cUser.city || 'N/A'}</div>
        <div class="line-item"><span class="bold">State:</span> ${cUser.state || 'N/A'}</div>
        <div class="line-item"><span class="bold">Email:</span> ${cUser.email || 'N/A'}</div>
        <div class="line-item"><span class="bold">Phone Number:</span> ${cUser.phoneNumber || 'N/A'}</div>

        <div class="section-title">Meter Information</div>
        <div class="line-item"><span class="bold">Meter Location:</span> ${cUser.meterLocation || 'N/A'}</div>
        <div class="line-item"><span class="bold">Meter Type:</span> ${cUser.meterType || 'N/A'}</div>
        <div class="line-item"><span class="bold">Phase Code:</span> ${cUser.phaseCode || 'N/A'}</div>
        <div class="line-item"><span class="bold">Bill Type:</span> ${cUser.billType || 'N/A'}</div>
        <div class="line-item"><span class="bold">Billing Days:</span> ${cUser.billingDays || '30'}</div>

        <div class="section-title">Fixed Charges Breakdown</div>
        <div class="line-item"><span class="bold">Cost Per Unit:</span> ₹5.50</div>
        <div class="line-item"><span class="bold">Meter Rent:</span> ₹50.00</div>
        <div class="line-item"><span class="bold">Service Charge:</span> ₹30.00</div>
        <div class="line-item"><span class="bold">Service Tax:</span> ₹15.00</div>
        <div class="line-item"><span class="bold">Fixed Tax:</span> ₹10.00</div>

        <div class="section-title">Billing Summary</div>
        <div class="line-item"><span class="bold">Current Month:</span> ${item.billingMonth ? item.billingMonth : 'Latest Month'}</div>
        <div class="line-item"><span class="bold">Unit Consumed:</span> ${item.unitsConsumed} Units</div>
        <div class="line-item"><span class="bold">Total Charges (Base Energy):</span> ₹${(item.totalAmount - 105).toFixed(2)}</div>
        
        <div class="total-highlight">
          Total Payable Charge: ₹${item.totalAmount.toFixed(2)}
        </div>
      </body>
    </html>
  `;

  const downloadReceipt = async () => {
    const html = generateHTML(bill, user);
    try {
      if (Platform.OS === 'web') {
        await Print.printAsync({ html });
      } else {
        const { uri } = await Print.printToFileAsync({ html });
        await shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
      }
    } catch (error: any) {
      Platform.OS === 'web' 
        ? window.alert(`Error: ${error.message}`) 
        : Alert.alert('Error', 'Unable to generate receipt');
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 50 }}>
      {/* Back Button */}
      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
        <Text style={styles.backBtnText}>{'<'} Back to History</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Detailed Bill Receipt</Text>
      
      <View style={styles.card}>
        <Text style={styles.sectionHeader}>Customer Details</Text>
        <Text style={styles.item}><Text style={styles.bold}>Name:</Text> {user.name}</Text>
        <Text style={styles.item}><Text style={styles.bold}>Meter Number:</Text> {user.meterNumber}</Text>
        <Text style={styles.item}><Text style={styles.bold}>Address:</Text> {user.address || 'N/A'}</Text>
        <Text style={styles.item}><Text style={styles.bold}>City:</Text> {user.city || 'N/A'}</Text>
        <Text style={styles.item}><Text style={styles.bold}>State:</Text> {user.state || 'N/A'}</Text>
        <Text style={styles.item}><Text style={styles.bold}>Email:</Text> {user.email || 'N/A'}</Text>
        <Text style={styles.item}><Text style={styles.bold}>Phone Number:</Text> {user.phoneNumber || 'N/A'}</Text>

        <View style={styles.divider} />
        
        <Text style={styles.sectionHeader}>Meter Information</Text>
        <Text style={styles.item}><Text style={styles.bold}>Meter Location:</Text> {user.meterLocation || 'N/A'}</Text>
        <Text style={styles.item}><Text style={styles.bold}>Meter Type:</Text> {user.meterType || 'N/A'}</Text>
        <Text style={styles.item}><Text style={styles.bold}>Phase Code:</Text> {user.phaseCode || 'N/A'}</Text>
        <Text style={styles.item}><Text style={styles.bold}>Bill Type:</Text> {user.billType || 'N/A'}</Text>
        <Text style={styles.item}><Text style={styles.bold}>Billing Days:</Text> {user.billingDays || '30'}</Text>

        <View style={styles.divider} />

        <Text style={styles.sectionHeader}>Billing Breakdown ({bill.billingMonth || 'Latest'})</Text>
        <Text style={styles.item}><Text style={styles.bold}>Status:</Text> <Text style={{color: bill.status === 'paid' ? '#10B981' : '#EF4444', fontWeight: 'bold'}}>{bill.status.toUpperCase()}</Text></Text>
        <Text style={styles.item}><Text style={styles.bold}>Cost Per Unit:</Text> ₹5.50</Text>
        <Text style={styles.item}><Text style={styles.bold}>Units Consumed:</Text> {bill.unitsConsumed} Units</Text>
        <Text style={styles.item}><Text style={styles.bold}>Total Base Charges:</Text> ₹${(bill.totalAmount - 105).toFixed(2)}</Text>
        
        <Text style={[styles.item, {marginTop: 10}]}><Text style={styles.bold}>Meter Rent:</Text> ₹50.00</Text>
        <Text style={styles.item}><Text style={styles.bold}>Service Charge:</Text> ₹30.00</Text>
        <Text style={styles.item}><Text style={styles.bold}>Service Tax:</Text> ₹15.00</Text>
        <Text style={styles.item}><Text style={styles.bold}>Fixed Tax:</Text> ₹10.00</Text>

        <View style={styles.totalBox}>
          <Text style={styles.totalText}>Total Payable Charge: ₹{bill.totalAmount.toFixed(2)}</Text>
        </View>

        <TouchableOpacity style={styles.downloadBtn} onPress={downloadReceipt}>
          <Text style={styles.downloadBtnText}>Download PDF Receipt</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6', padding: 20 },
  backBtn: { marginTop: 40, marginBottom: 10 },
  backBtnText: { color: '#2563EB', fontSize: 16, fontWeight: 'bold' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#1F2937', marginBottom: 20 },
  card: { backgroundColor: '#FFF', padding: 20, borderRadius: 10, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5, elevation: 2 },
  sectionHeader: { fontSize: 18, fontWeight: 'bold', color: '#374151', marginBottom: 10, marginTop: 10 },
  item: { fontSize: 15, color: '#4B5563', marginBottom: 8 },
  bold: { fontWeight: 'bold', color: '#1F2937' },
  divider: { height: 1, backgroundColor: '#E5E7EB', marginVertical: 15 },
  totalBox: { padding: 15, backgroundColor: '#F9FAFB', borderTopWidth: 2, borderTopColor: '#10B981', marginTop: 20, marginBottom: 20, alignItems: 'flex-end' },
  totalText: { fontSize: 18, color: '#10B981', fontWeight: 'bold' },
  downloadBtn: { backgroundColor: '#2563EB', padding: 15, borderRadius: 8, alignItems: 'center' },
  downloadBtnText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' }
});
