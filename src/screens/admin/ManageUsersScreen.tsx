import React, { useContext, useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Image, Dimensions, Animated, Platform } from 'react-native';
import { AuthContext, User, Bill } from '../../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');
const IS_SMALL_DEVICE = width < 380;

const COLORS = {
  background: '#0e0e0e',
  surface_low: '#131313',
  surface_highest: '#262626',
  primary: '#81ecff',
  primary_dim: '#00d4ec',
  secondary: '#2ff801',
  secondary_container: 'rgba(47, 248, 1, 0.2)',
  error: '#ff716c',
  error_container: 'rgba(255, 113, 108, 0.2)',
  on_surface: '#ffffff',
  on_surface_variant: '#adaaaa',
  outline: '#777575',
};

export default function ManageUsersScreen() {
  const { getAllUsers, getAllBills } = useContext(AuthContext);
  const navigation: any = useNavigation();

  const [customers, setCustomers] = useState<User[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    const fetchNodes = async () => {
      const users = await getAllUsers();
      const allBills = await getAllBills();
      setCustomers(users.filter(u => u.role === 'customer'));
      setBills(allBills);
    };

    const unsubscribe = navigation.addListener('focus', fetchNodes);
    return unsubscribe;
  }, [navigation]);

  const filteredCustomers = customers.filter(c => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return c.name.toLowerCase().includes(query) || (c.meterNumber && c.meterNumber.toLowerCase().includes(query));
  });

  // Calculate generic simulated Tier & Status
  const getCustomerStatus = (customerId: string) => {
    const userBills = bills.filter(b => b.customerId === customerId);
    const hasUnpaid = userBills.some(b => b.status === 'unpaid');
    return hasUnpaid ? 'Suspended' : 'Active';
  };

  const renderCustomerNode = ({ item, index }: { item: User, index: number }) => {
    const status = getCustomerStatus(item.id);
    const tier = index % 3 === 0 ? 'Ultra-Node' : 'Standard';

    return (
      <View style={styles.cardContainer}>
        <View style={styles.cardContent}>
          {/* Avatar Base */}
          <View style={styles.avatarWrapper}>
            <View style={[styles.avatarMock, status === 'Suspended' && styles.avatarMockGreyscale]}>
              <MaterialIcons name="person" size={32} color={COLORS.on_surface_variant} />
            </View>
            <View style={[styles.statusIndicator, { backgroundColor: status === 'Active' ? COLORS.secondary : COLORS.error }]} />
          </View>

          {/* Identity */}
          <View style={styles.identityCol}>
            <Text style={[styles.nameText, status === 'Suspended' && { color: COLORS.on_surface_variant }]}>{item.name}</Text>
            <Text style={styles.idText}>ID: {item.meterNumber || '0000'}</Text>
          </View>

          {/* Metrics Grid */}
          <View style={styles.metricsGrid}>
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>STATUS</Text>
              <View style={[styles.statusBadge, { backgroundColor: status === 'Active' ? COLORS.secondary_container : COLORS.error_container }]}>
                <Text style={[styles.statusBadgeText, { color: status === 'Active' ? COLORS.secondary : COLORS.error }]}>{status}</Text>
              </View>
            </View>
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>TIER</Text>
              <Text style={[styles.tierText, tier === 'Ultra-Node' && { color: COLORS.primary }]}>{tier}</Text>
            </View>
          </View>

          {/* Action Tools */}
          <View style={styles.actionsCol}>
            <TouchableOpacity 
              style={styles.actionBtn} 
              onPress={() => navigation.navigate('UserDetails', { userId: item.id })}
            >
              <MaterialIcons name="edit" size={20} color={COLORS.primary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn}>
              <MaterialIcons name="delete" size={20} color={COLORS.error} />
            </TouchableOpacity>
          </View>

        </View>
        <LinearGradient 
          colors={[COLORS.primary, 'transparent']} 
          style={styles.cardHighlightEdge}
          start={{ x: 1, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Dynamic Background */}
      <View style={styles.ambientGlow} />

      {/* Top Header Equivalent */}
      <View style={styles.appBar}>
        <View style={styles.appBarLeft}>
          <MaterialIcons name="bolt" size={IS_SMALL_DEVICE ? 20 : 24} color={COLORS.primary} style={{ marginRight: 8 }} />
          <Text style={styles.appBarTitle}>KINETIC ETHER</Text>
        </View>
        <View style={styles.appBarRight}>
          <TouchableOpacity style={styles.iconBtn} activeOpacity={0.7} onPress={() => navigation.navigate('AdminProfile')}>
            <MaterialIcons name="account-circle" size={IS_SMALL_DEVICE ? 20 : 24} color={COLORS.primary} />
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={filteredCustomers}
        keyExtractor={item => item.id}
        renderItem={renderCustomerNode}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <Animated.View style={{ opacity: fadeAnim, marginBottom: 32 }}>
            <Text style={styles.pageTitle}>Manage <Text style={{color: COLORS.primary}}>Customers</Text></Text>
            
            <View style={styles.heroSection}>
              <Text style={styles.heroDesc}>
                Overview and lifecycle management for active kinetic energy subscribers within the Ether grid.
              </Text>
              
              <View style={styles.heroStatsBox}>
                <View>
                  <Text style={styles.heroStatLabel}>TOTAL ACTIVE</Text>
                  <Text style={styles.heroStatValue}>{customers.length}</Text>
                </View>
                <View style={styles.heroStatDivider} />
                <View>
                  <Text style={styles.heroStatLabel}>NEW TODAY</Text>
                  <Text style={[styles.heroStatValue, { color: COLORS.primary }]}>+{(customers.length % 5) || 2}</Text>
                </View>
              </View>
            </View>

            <View style={styles.searchContainer}>
              <MaterialIcons name="search" size={24} color={COLORS.primary} style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search by name or grid sector..."
                placeholderTextColor={COLORS.outline}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              <TouchableOpacity style={styles.filterBtn}>
                <MaterialIcons name="filter-list" size={24} color={COLORS.on_surface_variant} />
              </TouchableOpacity>
            </View>
          </Animated.View>
        }
        ListFooterComponent={
          filteredCustomers.length > 0 ? (
            <TouchableOpacity style={styles.loadMoreBtn}>
              <Text style={styles.loadMoreText}>LOAD MORE NODES</Text>
            </TouchableOpacity>
          ) : null
        }
      />

      <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('AddUser')}>
        <LinearGradient 
          colors={[COLORS.primary, COLORS.primary_dim]} 
          style={styles.fabGradient}
        >
          <MaterialIcons name="add" size={32} color="#003840" />
        </LinearGradient>
      </TouchableOpacity>
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
    top: -50,
    left: -50,
    width: width * 0.8,
    height: width * 0.8,
    borderRadius: width,
    backgroundColor: 'rgba(129, 236, 255, 0.05)',
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
  },
  scrollContent: {
    paddingHorizontal: IS_SMALL_DEVICE ? 16 : 24,
    paddingTop: 32,
    paddingBottom: 120, // Account for Tabs + FAB natively
  },
  pageTitle: {
    fontSize: 40,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: -1,
    marginBottom: 16,
  },
  heroSection: {
    flexDirection: width > 768 ? 'row' : 'column',
    justifyContent: 'space-between',
    gap: 24,
    marginBottom: 40,
  },
  heroDesc: {
    color: COLORS.on_surface_variant,
    fontSize: 14,
    lineHeight: 24,
    flex: 1,
    maxWidth: 400,
  },
  heroStatsBox: {
    backgroundColor: COLORS.surface_low,
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
  },
  heroStatLabel: {
    color: COLORS.on_surface_variant,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 2,
    marginBottom: 4,
  },
  heroStatValue: {
    fontSize: 28,
    fontWeight: '900',
    color: COLORS.secondary,
  },
  heroStatDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(38, 38, 38, 0.5)',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '500',
  },
  filterBtn: {
    padding: 8,
    backgroundColor: COLORS.surface_highest,
    borderRadius: 8,
    marginLeft: 12,
  },
  cardContainer: {
    backgroundColor: COLORS.surface_low,
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  cardContent: {
    flexDirection: width > 768 ? 'row' : 'column',
    alignItems: width > 768 ? 'center' : 'stretch',
    padding: 24,
    gap: 24,
    zIndex: 10,
  },
  avatarWrapper: {
    position: 'relative',
    width: 64,
    height: 64,
    alignSelf: width > 768 ? 'auto' : 'center',
  },
  avatarMock: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.surface_highest,
    borderWidth: 2,
    borderColor: 'rgba(129, 236, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarMockGreyscale: {
    borderColor: 'rgba(255, 255, 255, 0.1)',
    opacity: 0.5,
  },
  statusIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: COLORS.surface_low,
  },
  identityCol: {
    flex: 1,
    alignItems: width > 768 ? 'flex-start' : 'center',
  },
  nameText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: -0.5,
  },
  idText: {
    fontSize: 11,
    color: COLORS.on_surface_variant,
    fontWeight: '700',
    letterSpacing: 1,
    marginTop: 4,
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: 32,
    justifyContent: width > 768 ? 'flex-start' : 'center',
  },
  metricItem: {
    alignItems: width > 768 ? 'flex-end' : 'center',
  },
  metricLabel: {
    fontSize: 10,
    color: COLORS.outline,
    fontWeight: '800',
    letterSpacing: 2,
    marginBottom: 8,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  tierText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#ffffff',
  },
  actionsCol: {
    flexDirection: 'row',
    borderTopWidth: width > 768 ? 0 : 1,
    borderLeftWidth: width > 768 ? 1 : 0,
    borderColor: 'rgba(255,255,255,0.05)',
    paddingTop: width > 768 ? 0 : 20,
    paddingLeft: width > 768 ? 20 : 0,
    justifyContent: 'center',
    gap: 16,
  },
  actionBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.03)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardHighlightEdge: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 4,
    height: '100%',
    opacity: 0.5,
  },
  loadMoreBtn: {
    padding: 16,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: 24,
  },
  loadMoreText: {
    color: COLORS.on_surface_variant,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 2,
  },
  fab: {
    position: 'absolute',
    bottom: Platform.OS === 'android' ? 100 : 120, // Sit just above Navbar
    right: 24,
    width: 64,
    height: 64,
    borderRadius: 32,
    elevation: 8,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    zIndex: 100,
  },
  fabGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  }
});
