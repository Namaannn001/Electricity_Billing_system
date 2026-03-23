import React, { useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, Dimensions } from 'react-native';
import { AuthContext, Bill, User } from '../../context/AuthContext';
import { useRoute, useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Print from 'expo-print';
import { shareAsync } from 'expo-sharing';
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
  secondary: '#2ff801',
  secondary_dim: '#2be800',
  secondary_container: '#106e00',
  on_surface: '#ffffff',
  on_surface_variant: '#adaaaa',
  outline: '#777575',
};

export default function ReceiptScreen() {
  const { user } = useContext(AuthContext);
  const route: any = useRoute();
  const navigation = useNavigation();
  const { bill } = route.params;

  if (!user || !bill) return null;

  // Kinetic Ether Branded HTML Receipt Engine
  const generateHTML = (item: Bill, cUser: User) => `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Kinetic Ether - Official Statement</title>
        <style>
          body { 
            font-family: 'Courier New', Courier, monospace; 
            padding: 40px; 
            color: #d1d5db; 
            background-color: #0e0e0e; 
            line-height: 1.6;
          }
          h1 { text-align: center; margin-bottom: 30px; color: #81ecff; text-transform: uppercase; letter-spacing: 4px; font-weight: 900; }
          .section-title { 
            font-weight: 800; 
            font-size: 14px; 
            text-transform: uppercase;
            margin-top: 50px; 
            margin-bottom: 20px; 
            color: #00d4ec;
            letter-spacing: 2px;
            border-bottom: 2px solid rgba(129, 236, 255, 0.2);
            padding-bottom: 8px;
          }
          .line-item { margin-bottom: 12px; font-size: 14px; display: flex; justify-content: space-between; align-items: flex-end; }
          .bold { font-weight: 700; color: #9ca3af; letter-spacing: 1px; }
          .val { color: #ffffff; font-weight: 600; }
          .total-highlight {
            font-size: 20px;
            font-weight: 900;
            margin-top: 40px;
            border-top: 2px dashed #81ecff;
            padding-top: 20px;
            text-align: right;
            color: #81ecff;
            letter-spacing: 1px;
          }
          .status { font-weight: 900; font-size: 16px; margin-top: 10px; text-transform: uppercase; text-align: center; letter-spacing: 3px; }
          .divider { border-bottom: 1px dashed rgba(255,255,255,0.1); flex: 1; margin: 0 10px; position: relative; top: -6px; }
        </style>
      </head>
      <body>
        <h1>KINETIC ETHER TRANSACTION LOG</h1>
        <div class="status">
          ${item.status === 'paid' ? '<span style="color: #2ff801">VERIFIED (PAID)</span>' : '<span style="color: #ff716c">OUTSTANDING (UNPAID)</span>'}
        </div>

        <div class="section-title">Identity Parameters</div>
        <div class="line-item"><span class="bold">DESIGNATION</span><div class="divider"></div><span class="val">${cUser.name}</span></div>
        <div class="line-item"><span class="bold">ENERGY NODE ID</span><div class="divider"></div><span class="val">${cUser.meterNumber}</span></div>
        <div class="line-item"><span class="bold">SECURE EMAIL</span><div class="divider"></div><span class="val">${cUser.email || 'UNREGISTERED'}</span></div>
        <div class="line-item"><span class="bold">UPLINK PHONE</span><div class="divider"></div><span class="val">${cUser.phoneNumber || 'UNREGISTERED'}</span></div>

        <div class="section-title">Hardware Vector</div>
        <div class="line-item"><span class="bold">INSTALL LOCATION</span><div class="divider"></div><span class="val">${cUser.meterLocation || 'STANDARD MODULE'}</span></div>
        <div class="line-item"><span class="bold">PHASE ALIGNMENT</span><div class="divider"></div><span class="val">${cUser.phaseCode || 'OPTIONAL'}</span></div>

        <div class="section-title">Consumption Stream</div>
        <div class="line-item"><span class="bold">BILLING CYCLE</span><div class="divider"></div><span class="val">${item.billingMonth ? item.billingMonth : 'LATEST RECORD'}</span></div>
        <div class="line-item"><span class="bold">TOTAL UNITS</span><div class="divider"></div><span class="val">${item.unitsConsumed} KWH</span></div>
        <div class="line-item"><span class="bold">ENERGY TARIFF</span><div class="divider"></div><span class="val">₹${(item.totalAmount * 0.9).toFixed(2)}</span></div>

        <div class="section-title">Infrastructure Levies</div>
        <div class="line-item"><span class="bold">GRID MAINTENANCE</span><div class="divider"></div><span class="val">₹${(item.totalAmount * 0.1).toFixed(2)}</span></div>
        
        <div class="total-highlight">
          FINAL DEDUCTION: ₹${item.totalAmount.toFixed(2)}
        </div>
        
        <div style="text-align: center; margin-top: 60px; color: #4b5563; font-size: 12px; letter-spacing: 1px;">
          Generated securely by Kinetic Ether AI Core.<br>
          TRANSACTION REF: ${item.id}
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
    } catch (e) {
      console.warn('PDF Error:', e);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.ambientTop} pointerEvents="none" />
      <View style={styles.ambientBottom} pointerEvents="none" />

      {/* Top Header */}
      <View style={styles.appBar}>
        <View style={styles.appBarLeft}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ paddingRight: 8 }}>
            <MaterialIcons name="arrow-back" size={24} color={COLORS.primary} />
          </TouchableOpacity>
          <MaterialIcons name="bolt" size={20} color={COLORS.primary} />
          <Text style={styles.appBarTitle}>official statement</Text>
        </View>
        <TouchableOpacity style={styles.iconBtn} onPress={downloadReceipt}>
          <MaterialIcons name="picture-as-pdf" size={20} color={COLORS.on_surface_variant} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.heroTextCol}>
            <View style={styles.paidBadge}>
              <MaterialIcons name="verified" size={12} color={COLORS.secondary} style={{ marginRight: 6 }} />
              <Text style={styles.paidBadgeText}>RESOLVED (PAID)</Text>
            </View>
            <Text style={styles.heroAmount}>₹{bill.totalAmount.toFixed(2)}</Text>
            <Text style={styles.heroSub}>Statement Period: {bill.billingMonth || bill.readingDate}</Text>
          </View>
          
          <TouchableOpacity activeOpacity={0.8} onPress={downloadReceipt} style={styles.payBtnWrapper}>
            <LinearGradient
              colors={[COLORS.secondary, COLORS.secondary_dim]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.payBtn}
            >
              <Text style={styles.payBtnText}>DOWNLOAD PDF</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Detailed Report List (Same layout as PayBillScreen) */}
        <View style={styles.detailsContainer}>
          <Text style={styles.sectionHeaderTitle}>Detailed Report</Text>

          <View style={styles.reportCard}>
            <View style={styles.cardHeader}>
              <View style={styles.cardHeaderLeft}>
                <View style={styles.indexCircle}>
                  <MaterialIcons name="fact-check" size={20} color={COLORS.secondary} />
                </View>
                <View>
                  <Text style={styles.cycleTitle}>{bill.billingMonth || 'Data Stream'}</Text>
                  <Text style={styles.readingDate}>{bill.readingDate}</Text>
                </View>
              </View>
              <View style={styles.amountBox}>
                <Text style={styles.billAmount}>₹{bill.totalAmount.toFixed(2)}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.metricsGrid}>
              <View style={styles.metricBlock}>
                <Text style={styles.metricLabel}>PREVIOUS</Text>
                <Text style={styles.metricValue}>{bill.previousReading}</Text>
              </View>
              
              <MaterialIcons name="arrow-forward" size={16} color={COLORS.outline} style={{ alignSelf: 'center', marginHorizontal: 8 }} />
              
              <View style={styles.metricBlock}>
                <Text style={styles.metricLabel}>CURRENT</Text>
                <Text style={styles.metricValuePrimary}>{bill.currentReading}</Text>
              </View>

              <View style={styles.metricBlockEnd}>
                <Text style={styles.metricLabelEnd}>CONSUMPTION</Text>
                <Text style={styles.metricValue}>{bill.unitsConsumed} Units</Text>
              </View>
            </View>

            <View style={styles.footerRow}>
              <View style={[styles.statusTag, { backgroundColor: 'rgba(47, 248, 1, 0.1)' }]}>
                <Text style={[styles.statusTagText, { color: COLORS.secondary }]}>REF: {bill.id.substring(0,8)}</Text>
              </View>
              <Text style={styles.nodeRef}>Node: {bill.meterNumber}</Text>
            </View>
          </View>
          
          {/* Breakdown Section matching PDF logically */}
          <View style={styles.breakdownList}>
            <Text style={styles.breakdownSubtitle}>Internal Invoice Vector</Text>
            
            <View style={styles.breakdownRow}>
              <Text style={styles.bdTitle}>Energy Tariff</Text>
              <Text style={styles.bdAmount}>₹{(bill.totalAmount * 0.9).toFixed(2)}</Text>
            </View>
            <View style={styles.dividerThin} />
            
            <View style={styles.breakdownRow}>
              <Text style={styles.bdTitle}>Infrastructure Maintenance</Text>
              <Text style={styles.bdAmount}>₹{(bill.totalAmount * 0.1).toFixed(2)}</Text>
            </View>
            <View style={styles.dividerThin} />
            
            <View style={styles.breakdownRow}>
              <Text style={styles.bdTitleBold}>Total Verified Sum</Text>
              <Text style={styles.bdAmountBold}>₹{bill.totalAmount.toFixed(2)}</Text>
            </View>
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
  ambientTop: {
    position: 'absolute',
    top: -height * 0.2,
    right: -width * 0.2,
    width: width * 1.5,
    height: width * 1.5,
    borderRadius: width * 0.75,
    backgroundColor: 'rgba(47, 248, 1, 0.05)',
  },
  ambientBottom: {
    position: 'absolute',
    bottom: -height * 0.2,
    left: -width * 0.2,
    width: width * 1.5,
    height: width * 1.5,
    borderRadius: width * 0.75,
    backgroundColor: 'rgba(129, 236, 255, 0.03)',
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
  paidBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(47, 248, 1, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(47, 248, 1, 0.3)',
  },
  paidBadgeText: {
    color: COLORS.secondary,
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
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 8,
  },
  payBtnText: {
    color: '#003a00',
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
    borderColor: 'rgba(47, 248, 1, 0.1)',
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
    backgroundColor: 'rgba(47, 248, 1, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
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
    color: COLORS.secondary,
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
  },
  breakdownList: {
    marginTop: 20,
    backgroundColor: COLORS.surface_low,
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.03)',
  },
  breakdownSubtitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.on_surface,
    marginBottom: 20,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  bdTitle: {
    fontSize: 14,
    color: COLORS.on_surface_variant,
    fontWeight: '500',
  },
  bdAmount: {
    fontSize: 14,
    color: COLORS.on_surface,
    fontWeight: '700',
  },
  bdTitleBold: {
    fontSize: 14,
    color: COLORS.secondary,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  bdAmountBold: {
    fontSize: 16,
    color: COLORS.secondary,
    fontWeight: '900',
  },
  dividerThin: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
    marginVertical: 4,
  }
});
