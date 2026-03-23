import React, { useContext, useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Dimensions, SafeAreaView, Platform, Animated } from 'react-native';
import { AuthContext, Bill } from '../../context/AuthContext';
import { useRoute, useNavigation, useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');
const IS_SMALL_DEVICE = width < 380;

const COLORS = {
  background: '#0e0e0e',
  surface_low: '#131313',
  surface_highest: '#262626',
  primary: '#81ecff',
  primary_dim: '#00d4ec',
  secondary: '#2ff801',
  error: '#ff716c',
  error_container: '#9f0519',
  on_surface: '#ffffff',
  on_surface_variant: '#adaaaa',
  outline: '#777575',
};

type FilterType = 'All' | 'Paid' | 'Pending';

export default function BillHistoryScreen() {
  const { user, getCustomerBills } = useContext(AuthContext);
  const navigation: any = useNavigation();

  const [bills, setBills] = useState<Bill[]>([]);
  const [filteredBills, setFilteredBills] = useState<Bill[]>([]);
  const [totalSpent, setTotalSpent] = useState(0);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('All');

  useFocusEffect(
    React.useCallback(() => {
      fetchHistory();
    }, [user])
  );

  const fetchHistory = async () => {
    if (user) {
      const allBills = await getCustomerBills(user.id);
      // Sort newest first
      const sorted = allBills.sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime());
      setBills(sorted);
      setFilteredBills(sorted);
      
      const spent = sorted.filter(b => b.status === 'paid').reduce((sum, b) => sum + b.totalAmount, 0);
      setTotalSpent(spent);
    }
  };

  useEffect(() => {
    let result = bills;
    // Filter by Tab
    if (activeFilter === 'Paid') result = result.filter(b => b.status === 'paid');
    if (activeFilter === 'Pending') result = result.filter(b => b.status === 'unpaid');
    
    // Filter by Search Query
    if (searchQuery.trim()) {
      const lowerQ = searchQuery.toLowerCase();
      result = result.filter(b => 
        (b.billingMonth?.toLowerCase() || '').includes(lowerQ) ||
        b.totalAmount.toString().includes(lowerQ) ||
        b.status.includes(lowerQ)
      );
    }
    
    setFilteredBills(result);
  }, [searchQuery, activeFilter, bills]);

  const getStatusConfig = (status: string) => {
    switch(status) {
      case 'paid':
        return {
          color: COLORS.secondary,
          bg: 'rgba(47, 248, 1, 0.1)',
          icon: 'electric-bolt',
          label: 'Paid',
          subLabel: 'Kinetic Credits'
        };
      case 'unpaid':
      default:
        return {
          color: COLORS.primary,
          bg: 'rgba(129, 236, 255, 0.1)',
          icon: 'account-balance',
          label: 'Pending',
          subLabel: 'External Node'
        };
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Background Decor */}
      <View style={styles.ambientTop} pointerEvents="none" />
      <View style={styles.ambientMiddle} pointerEvents="none" />

      {/* Top Header */}
      <View style={styles.appBar}>
        <View style={styles.appBarLeft}>
          <MaterialIcons name="bolt" size={IS_SMALL_DEVICE ? 20 : 24} color={COLORS.primary} />
          <Text style={styles.appBarTitle}>KINETIC ETHER</Text>
        </View>
        <TouchableOpacity style={styles.iconBtn}>
          <MaterialIcons name="account-circle" size={IS_SMALL_DEVICE ? 20 : 24} color={COLORS.on_surface_variant} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} stickyHeaderIndices={[1]}>
        
        {/* Hero Section & Stats */}
        <View style={styles.heroSection}>
          <Text style={styles.heroPreTitle}>HISTORY</Text>
          <View style={styles.heroRow}>
            <Text style={styles.heroTitle}>Activity Log</Text>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.heroTotalLabel}>TOTAL SPENT</Text>
              <Text style={styles.heroTotalValue}>₹{totalSpent.toFixed(2)}</Text>
            </View>
          </View>
        </View>

        {/* Search & Filter Bar (Sticky) */}
        <View style={styles.stickyHeader}>
          {/* Search Input */}
          <View style={styles.searchContainer}>
            <MaterialIcons name="search" size={20} color={COLORS.outline} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search transactions..."
              placeholderTextColor="rgba(255,255,255,0.3)"
              value={searchQuery}
              onChangeText={setSearchQuery}
              selectionColor={COLORS.primary}
            />
          </View>

          {/* Filter Chips */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsContainer}>
            {(['All', 'Paid', 'Pending'] as FilterType[]).map((tab) => {
              const isActive = activeFilter === tab;
              return (
                <TouchableOpacity 
                  key={tab} 
                  activeOpacity={0.8}
                  onPress={() => setActiveFilter(tab)}
                  style={[
                    styles.chipBtn, 
                    isActive ? styles.chipActive : styles.chipInactive
                  ]}
                >
                  <Text style={[
                    styles.chipText, 
                    isActive ? styles.chipTextActive : styles.chipTextInactive
                  ]}>
                    {tab}
                  </Text>
                </TouchableOpacity>
              )
            })}
          </ScrollView>
        </View>

        {/* Transaction List */}
        <View style={styles.listContainer}>
          {filteredBills.length === 0 ? (
            <Text style={styles.emptyText}>No logs match this configuration.</Text>
          ) : (
            filteredBills.map((bill) => {
              const config = getStatusConfig(bill.status);
              return (
                <TouchableOpacity 
                  key={bill.id} 
                  activeOpacity={0.8}
                  onPress={() => {
                    if (bill.status === 'paid') navigation.navigate('Receipt', { bill });
                    else navigation.navigate('PayBill', { bills: [bill] });
                  }}
                  style={[styles.card, { borderLeftColor: config.color }]}
                >
                  <View style={styles.cardLeft}>
                    <View style={[styles.cardIconBox, { backgroundColor: config.bg }]}>
                      <MaterialIcons name={config.icon as any} size={24} color={config.color} />
                    </View>
                    <View style={{ flexShrink: 1, paddingRight: 8 }}>
                      <Text style={styles.cardTitle} numberOfLines={1}>
                        Billing Cycle: {bill.billingMonth || 'Data Stream'}
                      </Text>
                      <Text style={styles.cardSub}>Due: {bill.dueDate} • {bill.unitsConsumed} Units</Text>
                    </View>
                  </View>
                  
                  <View style={{ alignItems: 'flex-end', flexShrink: 0 }}>
                    <View style={styles.cardTagRow}>
                      <View style={[styles.statusTag, { backgroundColor: config.bg }]}>
                        <Text style={[styles.statusTagText, { color: config.color }]}>
                          {config.label}
                        </Text>
                      </View>
                      <Text style={[styles.cardAmount, { color: bill.status === 'paid' ? COLORS.on_surface : config.color }]}>
                        {bill.status === 'paid' ? '-' : '+'}₹{bill.totalAmount.toFixed(2)}
                      </Text>
                    </View>
                    <Text style={[styles.cardContext, { color: bill.status === 'paid' ? COLORS.on_surface_variant : COLORS.on_surface_variant }]}>
                      {config.subLabel}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </View>

        {/* Load More Mockup */}
        {filteredBills.length > 0 && (
          <TouchableOpacity style={styles.loadMoreBtn}>
            <Text style={styles.loadMoreText}>LOAD MORE RECORDS</Text>
            <MaterialIcons name="expand-more" size={16} color={COLORS.on_surface_variant} />
          </TouchableOpacity>
        )}

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
    top: -height * 0.1,
    right: -width * 0.1,
    width: width * 1.2,
    height: width * 1.2,
    borderRadius: width * 0.6,
    backgroundColor: 'rgba(129, 236, 255, 0.05)',
  },
  ambientMiddle: {
    position: 'absolute',
    top: height * 0.4,
    left: -width * 0.2,
    width: width * 0.8,
    height: width * 0.8,
    borderRadius: width * 0.4,
    backgroundColor: 'rgba(47, 248, 1, 0.03)',
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
    backgroundColor: 'transparent',
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
  iconBtn: {
    padding: IS_SMALL_DEVICE ? 6 : 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  scrollContent: {
    paddingHorizontal: IS_SMALL_DEVICE ? 16 : 24,
    paddingTop: IS_SMALL_DEVICE ? 20 : 32,
    paddingBottom: 120, // Leave room for navbar and FAB
  },
  heroSection: {
    marginBottom: IS_SMALL_DEVICE ? 20 : 32,
  },
  heroPreTitle: {
    color: COLORS.on_surface_variant,
    fontSize: IS_SMALL_DEVICE ? 10 : 12,
    fontWeight: '600',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  heroRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  heroTitle: {
    fontSize: IS_SMALL_DEVICE ? 38 : 48,
    fontWeight: '700',
    color: COLORS.on_surface,
    letterSpacing: -1,
  },
  heroTotalLabel: {
    fontSize: IS_SMALL_DEVICE ? 9 : 10,
    fontWeight: '600',
    color: COLORS.on_surface_variant,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  heroTotalValue: {
    fontSize: IS_SMALL_DEVICE ? 20 : 24,
    fontWeight: '700',
    color: COLORS.primary,
  },
  stickyHeader: {
    backgroundColor: 'rgba(14, 14, 14, 0.95)', // background/95
    paddingTop: 16,
    paddingBottom: 16,
    marginBottom: 16,
    marginHorizontal: IS_SMALL_DEVICE ? -16 : -24,
    paddingHorizontal: IS_SMALL_DEVICE ? 16 : 24,
    zIndex: 40,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface_low,
    borderRadius: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(119, 117, 117, 0.2)',
    marginBottom: 20,
    height: 56,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    color: COLORS.on_surface,
    fontSize: 15,
    height: '100%',
  },
  chipsContainer: {
    flexDirection: 'row',
    gap: 12,
    paddingRight: 24,
  },
  chipBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  chipInactive: {
    backgroundColor: COLORS.surface_highest,
    borderColor: 'rgba(119, 117, 117, 0.1)',
  },
  chipText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  chipTextActive: {
    color: '#003840', // on-primary-fixed
  },
  chipTextInactive: {
    color: COLORS.on_surface_variant,
  },
  listContainer: {
    gap: 16,
  },
  emptyText: {
    color: COLORS.on_surface_variant,
    textAlign: 'center',
    marginTop: 40,
    fontSize: 14,
  },
  card: {
    backgroundColor: COLORS.surface_low,
    borderRadius: 12,
    padding: IS_SMALL_DEVICE ? 16 : 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderLeftWidth: 4,
  },
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  cardIconBox: {
    width: IS_SMALL_DEVICE ? 40 : 48,
    height: IS_SMALL_DEVICE ? 40 : 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  cardTitle: {
    color: COLORS.on_surface,
    fontSize: IS_SMALL_DEVICE ? 14 : 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  cardSub: {
    color: COLORS.on_surface_variant,
    fontSize: IS_SMALL_DEVICE ? 10 : 12,
  },
  cardTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginBottom: 8,
  },
  statusTag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginRight: 8,
  },
  statusTagText: {
    fontSize: 8,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  cardAmount: {
    fontSize: IS_SMALL_DEVICE ? 14 : 16,
    fontWeight: '700',
  },
  cardContext: {
    fontSize: IS_SMALL_DEVICE ? 9 : 10,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  loadMoreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: 'rgba(119, 117, 117, 0.2)',
    alignSelf: 'center',
  },
  loadMoreText: {
    color: COLORS.on_surface_variant,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginRight: 8,
  },
  fab: {
    position: 'absolute',
    bottom: 110,
    right: 24,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
    elevation: 10,
  },
  fabGradient: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  }
});
