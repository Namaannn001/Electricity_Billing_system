import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Linking, Animated, Dimensions, Platform } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

const { width, height } = Dimensions.get('window');

const COLORS = {
  background: '#0e0e0e',
  surface_low: '#131313',
  surface_highest: '#262626',
  primary: '#81ecff',
  error: '#ff716c',
  error_container: '#9f0519',
  on_surface: '#ffffff',
  on_surface_variant: '#adaaaa',
  outline: '#777575',
};

export default function SOSScreen() {
  const [dialogVisible, setDialogVisible] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Background Ping animation for the giant SOS button
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.25, duration: 1500, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1500, useNativeDriver: true })
      ])
    ).start();
  }, []);

  const showDialog = () => {
    setDialogVisible(true);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true
    }).start();
  };

  const hideDialog = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true
    }).start(() => {
      setDialogVisible(false);
    });
  };

  const executeEmergencyCall = () => {
    hideDialog();
    Linking.openURL('tel:1912').catch(err => {
      Alert.alert('System Error', 'Unable to connect to Emergency Dialer. Please dial 1912 manually.');
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Background Energy Ripples mapped natively */}
      <View style={styles.bgRipplesOverlay} pointerEvents="none">
        <View style={styles.rippleInner} />
        <View style={styles.rippleOuter} />
      </View>

      {/* Top Header */}
      <View style={styles.appBar}>
        <View style={styles.appBarLeft}>
          <MaterialIcons name="bolt" size={24} color={COLORS.primary} />
          <Text style={styles.appBarTitle}>Kinetic Ether</Text>
        </View>
        <TouchableOpacity style={styles.iconBtn}>
          <MaterialIcons name="account-circle" size={24} color={COLORS.on_surface_variant} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* SOS Header */}
        <View style={styles.headerBlock}>
          <Text style={styles.headerTitle}>Emergency Response</Text>
          <Text style={styles.headerSub}>
            Report critical infrastructure failures, live wire exposures, or grid instability immediately. Your location data will be transmitted to emergency dispatch teams.
          </Text>
        </View>

        {/* Central SOS Button Section */}
        <View style={styles.sosCentralWrapper}>
          <Animated.View style={[styles.pingCircle, { transform: [{ scale: pulseAnim }], opacity: pulseAnim.interpolate({ inputRange: [1, 1.25], outputRange: [0.3, 0] }) }]} />
          
          <TouchableOpacity activeOpacity={0.6} onPress={showDialog} style={styles.sosTriggerBox}>
            <LinearGradient
              colors={[COLORS.error_container, COLORS.error]}
              style={styles.sosButtonGradient}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 1}}
            >
              <MaterialIcons name="warning" size={56} color={COLORS.on_surface} />
              <Text style={styles.sosText}>SOS</Text>
              <Text style={styles.sosLabel}>Hold to trigger</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Quick Report Categories */}
        <View style={styles.quickGrid}>
          <TouchableOpacity activeOpacity={0.8} onPress={showDialog} style={styles.quickCard}>
            <MaterialIcons name="electrical-services" size={28} color={COLORS.error} style={{marginBottom: 12}} />
            <Text style={styles.quickTitle}>Arcing/Sparking</Text>
            <Text style={styles.quickSub}>Visible electrical discharge or burning equipment.</Text>
          </TouchableOpacity>

          <TouchableOpacity activeOpacity={0.8} onPress={showDialog} style={styles.quickCard}>
            <MaterialIcons name="water-damage" size={28} color={COLORS.error} style={{marginBottom: 12}} />
            <Text style={styles.quickTitle}>Grid Outage</Text>
            <Text style={styles.quickSub}>Sudden loss of power across local area sector.</Text>
          </TouchableOpacity>

          <TouchableOpacity activeOpacity={0.8} onPress={showDialog} style={styles.quickCard}>
            <MaterialIcons name="dangerous" size={28} color={COLORS.error} style={{marginBottom: 12}} />
            <Text style={styles.quickTitle}>Safety Hazard</Text>
            <Text style={styles.quickSub}>Downed poles or exposed underground cabling.</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>

      {/* Confirmation Dialog Overlay */}
      {dialogVisible && (
        <Animated.View style={[styles.dialogOverlay, { opacity: fadeAnim }]}>
          <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFillObject} />
          
          <View style={styles.dialogBox}>
            <View style={styles.dialogHeader}>
              <View style={styles.dialogIconBox}>
                <MaterialIcons name="report" size={28} color={COLORS.error} />
              </View>
              <Text style={styles.dialogTitle}>Confirm SOS?</Text>
            </View>

            <Text style={styles.dialogDesc}>
              By confirming, you are reporting a life-threatening electrical emergency. Emergency services will be notified of your GPS coordinates.
            </Text>

            <TouchableOpacity activeOpacity={0.8} onPress={executeEmergencyCall}>
              <LinearGradient colors={[COLORS.error, COLORS.error_container]} style={styles.dialogConfirmBtn} start={{x:0, y:0}} end={{x:1, y:0}}>
                <Text style={styles.dialogConfirmText}>CONFIRM EMERGENCY</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity activeOpacity={0.8} onPress={hideDialog} style={styles.dialogCancelBtn}>
              <Text style={styles.dialogCancelText}>CANCEL REPORT</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  bgRipplesOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.2,
  },
  rippleInner: {
    position: 'absolute',
    width: 400,
    height: 400,
    borderRadius: 200,
    borderWidth: 1,
    borderColor: 'rgba(255, 113, 108, 0.2)', // error color trace
    transform: [{ scale: 1.25 }]
  },
  rippleOuter: {
    position: 'absolute',
    width: 500,
    height: 500,
    borderRadius: 250,
    borderWidth: 1,
    borderColor: 'rgba(255, 113, 108, 0.4)',
    transform: [{ scale: 1.5 }]
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
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginLeft: 8,
  },
  iconBtn: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 100,
    alignItems: 'center',
  },
  headerBlock: {
    alignItems: 'center',
    marginBottom: 48,
    maxWidth: 500,
  },
  headerTitle: {
    fontSize: 36,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 16,
    letterSpacing: -1,
  },
  headerSub: {
    fontSize: 14,
    color: COLORS.on_surface_variant,
    textAlign: 'center',
    lineHeight: 22,
  },
  sosCentralWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    width: 250,
    height: 250,
    marginBottom: 60,
  },
  pingCircle: {
    position: 'absolute',
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: COLORS.error_container,
  },
  sosTriggerBox: {
    width: 220,
    height: 220,
    borderRadius: 110,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
    backgroundColor: COLORS.background, // acts as border natively
    shadowColor: COLORS.error_container,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 50,
    elevation: 20,
  },
  sosButtonGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sosText: {
    fontSize: 36,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: -1,
    marginVertical: 4,
  },
  sosLabel: {
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 3,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 4,
  },
  quickGrid: {
    flexDirection: width > 768 ? 'row' : 'column',
    width: '100%',
    gap: 16,
    maxWidth: 800,
  },
  quickCard: {
    backgroundColor: COLORS.surface_low,
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    flex: 1,
  },
  quickTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 8,
  },
  quickSub: {
    fontSize: 12,
    color: COLORS.on_surface_variant,
    lineHeight: 18,
  },
  dialogOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 100,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  dialogBox: {
    backgroundColor: COLORS.surface_highest,
    width: '100%',
    maxWidth: 400,
    padding: 32,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 113, 108, 0.3)',
    shadowColor: COLORS.error_container,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 30,
    elevation: 30,
  },
  dialogHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  dialogIconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(159, 5, 25, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  dialogTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#ffffff',
  },
  dialogDesc: {
    fontSize: 14,
    color: COLORS.on_surface_variant,
    lineHeight: 22,
    marginBottom: 32,
  },
  dialogConfirmBtn: {
    width: '100%',
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  dialogConfirmText: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 14,
  },
  dialogCancelBtn: {
    width: '100%',
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  dialogCancelText: {
    color: COLORS.on_surface_variant,
    fontWeight: '700',
    fontSize: 14,
  }
});
