import React, { useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Platform } from 'react-native';
import { AuthContext, Bill, User } from '../../context/AuthContext';
import { useRoute, useNavigation } from '@react-navigation/native';
import * as Print from 'expo-print';
import { shareAsync } from 'expo-sharing';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

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
        <title>VoltAI - System Receipt</title>
        <style>
          body { 
            font-family: 'Courier New', Courier, monospace; 
            padding: 40px; 
            color: #E2E8F0; 
            background-color: #0B0F19;
          }
          h1 { text-align: center; margin-bottom: 40px; color: #00E5FF; text-transform: uppercase; letter-spacing: 2px; }
          .section-title { 
            font-weight: bold; 
            font-size: 14px; 
            text-transform: uppercase;
            margin-top: 40px; 
            margin-bottom: 20px; 
            color: #8B5CF6;
            letter-spacing: 2px;
            border-bottom: 1px solid rgba(255,255,255,0.1);
            padding-bottom: 5px;
          }
          .line-item { margin-bottom: 12px; font-size: 14px; display: flex; justify-content: space-between; }
          .bold { font-weight: bold; color: #94A3B8; }
          .val { color: #F8FAFC; }
          .total-highlight {
            font-size: 18px;
            font-weight: bold;
            margin-top: 30px;
            border-top: 1px solid #00E5FF;
            padding-top: 20px;
            text-align: right;
            color: #00E5FF;
          }
          .status { font-weight: bold; font-size: 16px; margin-top: 20px; text-transform: uppercase; text-align: center; }
        </style>
      </head>
      <body>
        <h1>VOLTAI TRANSACTION LOG</h1>
        <div class="status">SYSTEM STATUS: ${item.status === 'paid' ? '<span style="color: #10B981">RESOLVED (PAID)</span>' : '<span style="color: #EF4444">OUTSTANDING (UNPAID)</span>'}</div>

        <div class="section-title">Identity Parameters</div>
        <div class="line-item"><span class="bold">DESIGNATION:</span> <span class="val">${cUser.name}</span></div>
        <div class="line-item"><span class="bold">METER ID:</span> <span class="val">${cUser.meterNumber}</span></div>
        <div class="line-item"><span class="bold">VECTOR (EMAIL):</span> <span class="val">${cUser.email || 'N/A'}</span></div>
        <div class="line-item"><span class="bold">VECTOR (PHONE):</span> <span class="val">${cUser.phoneNumber || 'N/A'}</span></div>

        <div class="section-title">Hardware Configuration</div>
        <div class="line-item"><span class="bold">LOCATION:</span> <span class="val">${cUser.meterLocation || 'N/A'}</span></div>
        <div class="line-item"><span class="bold">METER TYPE:</span> <span class="val">${cUser.meterType || 'N/A'}</span></div>
        <div class="line-item"><span class="bold">PHASE CODE:</span> <span class="val">${cUser.phaseCode || 'N/A'}</span></div>
        <div class="line-item"><span class="bold">BILL CYCLE:</span> <span class="val">${cUser.billingDays || '30'} DAYS</span></div>

        <div class="section-title">Consumption Metrics</div>
        <div class="line-item"><span class="bold">TARGET MONTH:</span> <span class="val">${item.billingMonth ? item.billingMonth : 'LATEST'}</span></div>
        <div class="line-item"><span class="bold">UNITS CONSUMED:</span> <span class="val">${item.unitsConsumed} KWH</span></div>
        <div class="line-item"><span class="bold">ENERGY CHARGE:</span> <span class="val">₹${(item.totalAmount - 105).toFixed(2)}</span></div>

        <div class="section-title">Fixed Overheads</div>
        <div class="line-item"><span class="bold">HARDWARE RENT:</span> <span class="val">₹50.00</span></div>
        <div class="line-item"><span class="bold">SYSTEM UPKEEP:</span> <span class="val">₹30.00</span></div>
        <div class="line-item"><span class="bold">TAX (SERVICE):</span> <span class="val">₹15.00</span></div>
        <div class="line-item"><span class="bold">TAX (FIXED):</span> <span class="val">₹10.00</span></div>
        
        <div class="total-highlight">
          FINAL DEDUCTION: ₹${item.totalAmount.toFixed(2)}
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
    <View style={styles.mainContainer}>
      <View style={[styles.orb, styles.orbTop]} />
      <View style={[styles.orb, styles.orbBottom]} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.backBtnText}>{'<'} BACK TO LOGS</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Detailed Report</Text>
        </View>

        <BlurView intensity={20} tint="dark" style={styles.card}>
          <Text style={styles.sectionHeader}>IDENTITY SUMMARY</Text>
          <View style={styles.row}><Text style={styles.label}>DESIGNATION:</Text><Text style={styles.val}>{user.name}</Text></View>
          <View style={styles.row}><Text style={styles.label}>METER ID:</Text><Text style={styles.val}>{user.meterNumber}</Text></View>
          <View style={styles.row}><Text style={styles.label}>CONTACT:</Text><Text style={styles.val}>{user.phoneNumber || 'N/A'}</Text></View>
          
          <View style={styles.divider} />

          <Text style={styles.sectionHeader}>HARDWARE INFO</Text>
          <View style={styles.row}><Text style={styles.label}>LOCATION:</Text><Text style={styles.val}>{user.meterLocation || 'N/A'}</Text></View>
          <View style={styles.row}><Text style={styles.label}>TYPE:</Text><Text style={styles.val}>{user.meterType || 'N/A'}</Text></View>
          <View style={styles.row}><Text style={styles.label}>PHASE:</Text><Text style={styles.val}>{user.phaseCode || 'N/A'}</Text></View>

          <View style={styles.divider} />

          <Text style={styles.sectionHeader}>CONSUMPTION {bill.billingMonth ? `(${bill.billingMonth})` : ''}</Text>
          <View style={styles.row}>
            <Text style={styles.label}>STATUS:</Text>
            <Text style={[styles.val, { color: bill.status === 'paid' ? '#10B981' : '#EF4444', fontWeight: '800' }]}>
              {bill.status.toUpperCase()}
            </Text>
          </View>
          <View style={styles.row}><Text style={styles.label}>UNITS EXTRACTED:</Text><Text style={styles.val}>{bill.unitsConsumed}</Text></View>
          <View style={styles.row}><Text style={styles.label}>ENERGY COST:</Text><Text style={styles.val}>₹{(bill.totalAmount - 105).toFixed(2)}</Text></View>
          <View style={styles.row}><Text style={styles.label}>HARDWARE RENT:</Text><Text style={styles.val}>₹50.00</Text></View>
          <View style={styles.row}><Text style={styles.label}>TAXES & UPKEEP:</Text><Text style={styles.val}>₹55.00</Text></View>

          <View style={styles.totalBox}>
            <Text style={styles.totalLabel}>TOTAL LEVY</Text>
            <Text style={styles.totalText}>₹{bill.totalAmount.toFixed(2)}</Text>
          </View>

          <TouchableOpacity activeOpacity={0.8} onPress={downloadReceipt}>
            <LinearGradient
              colors={['#8B5CF6', '#00E5FF']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.downloadBtn}
            >
              <Text style={styles.downloadBtnText}>EXPORT DIGITAL RECEIPT (PDF)</Text>
            </LinearGradient>
          </TouchableOpacity>
        </BlurView>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: '#0B0F19' },
  orb: { position: 'absolute', width: 300, height: 300, borderRadius: 150, opacity: 0.15 },
  orbTop: { top: -50, right: -50, backgroundColor: '#00E5FF' },
  orbBottom: { bottom: -100, left: -50, width: 400, height: 400, borderRadius: 200, backgroundColor: '#8B5CF6' },
  
  scrollContent: { paddingHorizontal: 20, paddingBottom: 60 },
  header: { paddingTop: 60, paddingBottom: 20 },
  backBtn: { marginBottom: 15 },
  backBtnText: { color: '#00E5FF', fontSize: 12, fontWeight: '800', letterSpacing: 2 },
  title: { fontSize: 24, fontWeight: '900', color: '#F8FAFC', letterSpacing: 1 },

  card: { padding: 24, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', backgroundColor: 'rgba(15, 23, 42, 0.6)', overflow: 'hidden' },
  sectionHeader: { fontSize: 13, fontWeight: '900', color: '#8B5CF6', marginBottom: 16, marginTop: 10, letterSpacing: 2 },
  
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  label: { fontSize: 11, color: '#94A3B8', fontWeight: '700', letterSpacing: 1 },
  val: { fontSize: 13, color: '#F8FAFC', fontWeight: '600' },
  
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.1)', marginVertical: 20 },
  
  totalBox: { padding: 20, backgroundColor: 'rgba(0, 229, 255, 0.05)', borderRadius: 12, borderWidth: 1, borderColor: 'rgba(0, 229, 255, 0.2)', marginTop: 24, marginBottom: 24, alignItems: 'flex-end' },
  totalLabel: { fontSize: 11, color: '#00E5FF', fontWeight: '800', letterSpacing: 2, marginBottom: 4 },
  totalText: { fontSize: 28, color: '#F8FAFC', fontWeight: '900', textShadowColor: 'rgba(0, 229, 255, 0.2)', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 8 },
  
  downloadBtn: { padding: 16, borderRadius: 12, alignItems: 'center', shadowColor: '#8B5CF6', shadowOpacity: 0.3, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } },
  downloadBtnText: { color: '#FFFFFF', fontSize: 12, fontWeight: '900', letterSpacing: 2 }
});
