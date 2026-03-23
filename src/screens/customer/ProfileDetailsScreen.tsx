import React, { useContext, useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Platform, KeyboardAvoidingView, SafeAreaView, Dimensions, Animated, Easing, Image } from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { isValidEmail, isValidPhone, showError } from '../../utils/validators';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

const { width, height } = Dimensions.get('window');
const IS_SMALL_DEVICE = width < 380;

const COLORS = {
  background: '#0e0e0e',
  surface_low: '#131313',
  surface_highest: '#262626',
  primary: '#81ecff',
  primary_dim: '#00d4ec',
  primary_container: '#00e3fd',
  secondary: '#2ff801',
  secondary_container: '#106e00',
  on_surface: '#ffffff',
  on_surface_variant: '#adaaaa',
  outline_variant: '#494847',
};

export default function ProfileDetailsScreen() {
  const { user, updateUser } = useContext(AuthContext);
  const navigation = useNavigation();

  const [activeInput, setActiveInput] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const successAnim = useRef(new Animated.Value(0)).current;

  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phoneNumber: user?.phoneNumber || '',
    address: user?.address || '',
    profileImage: user?.profileImage || '',
  });

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      handleChange('profileImage', result.assets[0].uri);
    }
  };

  const handleChange = (key: string, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const handleUpdate = async () => {
    if (!form.email) {
      showError('Email cannot be empty');
      return;
    }
    
    if (!isValidEmail(form.email)) {
      showError('Please enter a valid email format');
      return;
    }

    if (form.phoneNumber && !isValidPhone(form.phoneNumber)) {
      showError('Please enter a valid 10-digit phone number');
      return;
    }
    
    try {
      if (user) {
        await updateUser(user.id, {
          name: form.name,
          email: form.email,
          phoneNumber: form.phoneNumber,
          address: form.address,
          profileImage: form.profileImage,
        });
        
        // Show success overlay animation
        setIsSuccess(true);
        Animated.sequence([
          Animated.timing(successAnim, { toValue: 1, duration: 400, useNativeDriver: true, easing: Easing.out(Easing.back(1.5)) }),
          Animated.delay(2000),
          Animated.timing(successAnim, { toValue: 0, duration: 300, useNativeDriver: true })
        ]).start(() => setIsSuccess(false));
      }
    } catch (error: any) {
      showError(error.message);
    }
  };

  const discardChanges = () => {
    setForm({
      name: user?.name || '',
      email: user?.email || '',
      phoneNumber: user?.phoneNumber || '',
      address: user?.address || '',
      profileImage: user?.profileImage || '',
    });
    navigation.goBack();
  };

  if (!user) return null;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.appBar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={24} color={COLORS.primary} />
        </TouchableOpacity>
        <View style={styles.appBarTitleContainer}>
          <MaterialIcons name="bolt" size={20} color={COLORS.primary} />
          <Text style={styles.appBarTitle}>KINETIC ETHER</Text>
        </View>
        <View style={{ width: 24 }} />
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          {/* Hero Title Section */}
          <View style={styles.heroSection}>
            <Text style={styles.heroTitle}>Profile</Text>
            <Text style={styles.heroSub}>Manage your energy identity and grid access credentials through the secure Kinetic Ether uplink.</Text>
          </View>

          {/* Avatar & Quick Info */}
          <View style={styles.avatarCard}>
            <TouchableOpacity style={styles.avatarWrapperContainer} onPress={pickImage} activeOpacity={0.8}>
              <View style={styles.avatarWrapper}>
                {form.profileImage ? (
                  <Image source={{ uri: form.profileImage }} style={{ width: 100, height: 100, borderRadius: 50 }} />
                ) : (
                  <MaterialIcons name="person" size={48} color={COLORS.on_surface_variant} />
                )}
              </View>
              <View style={styles.editBadge}>
                <MaterialIcons name="edit" size={14} color="#005762" />
              </View>
            </TouchableOpacity>
            
            <View style={styles.nameHeader}>
              <Text style={styles.userName}>{form.name || user.name}</Text>
              <View style={styles.activePill}>
                <Text style={styles.activePillText}>ACTIVE NODE</Text>
              </View>
            </View>

            <View style={styles.statusList}>
              <View style={styles.statusRow}>
                <Text style={styles.statusLabel}>Grid Status</Text>
                <Text style={styles.statusValueOptimal}>Optimal</Text>
              </View>
              <View style={styles.statusRow}>
                <Text style={styles.statusLabel}>Access Tier</Text>
                <Text style={styles.statusValueAdmin}>{user.role.toUpperCase()}</Text>
              </View>
            </View>
          </View>

          {/* Identity Badge */}
          <View style={styles.identityBadge}>
            <Text style={styles.badgeLabel}>ENERGY NODE ID</Text>
            <Text style={styles.badgeValue}>{user.meterNumber || 'KE-0000-XPR'}</Text>
          </View>

          {/* Form */}
          <View style={styles.formCard}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Full Name</Text>
              <TextInput
                style={[styles.input, activeInput === 'name' && styles.inputActive]}
                value={form.name}
                onChangeText={(val) => handleChange('name', val)}
                onFocus={() => setActiveInput('name')}
                onBlur={() => setActiveInput(null)}
                selectionColor={COLORS.primary}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email Address</Text>
              <TextInput
                style={[styles.input, activeInput === 'email' && styles.inputActive]}
                value={form.email}
                onChangeText={(val) => handleChange('email', val)}
                onFocus={() => setActiveInput('email')}
                onBlur={() => setActiveInput(null)}
                keyboardType="email-address"
                autoCapitalize="none"
                selectionColor={COLORS.primary}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Phone Uplink</Text>
              <TextInput
                style={[styles.input, activeInput === 'phone' && styles.inputActive]}
                value={form.phoneNumber}
                onChangeText={(val) => handleChange('phoneNumber', val)}
                onFocus={() => setActiveInput('phone')}
                onBlur={() => setActiveInput(null)}
                keyboardType="phone-pad"
                selectionColor={COLORS.primary}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Account Role</Text>
              <View style={styles.readOnlyField}>
                <MaterialIcons name="verified" size={16} color={COLORS.primary_dim} />
                <Text style={styles.readOnlyText}>
                  {user.role === 'admin' ? 'Systems Administrator' : 'Grid Customer'}
                </Text>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Grid Coordinates (Address)</Text>
              <TextInput
                style={[styles.inputArea, activeInput === 'address' && styles.inputActive]}
                value={form.address}
                onChangeText={(val) => handleChange('address', val)}
                onFocus={() => setActiveInput('address')}
                onBlur={() => setActiveInput(null)}
                multiline
                numberOfLines={3}
                selectionColor={COLORS.primary}
              />
            </View>

            {/* Actions */}
            <View style={styles.actionContainer}>
              <View style={styles.encryptionRow}>
                <MaterialIcons name="check-circle" size={12} color={COLORS.secondary} />
                <Text style={styles.encryptionText}>ALL CHANGES ENCRYPTED</Text>
              </View>
              
              <View style={styles.buttonRow}>
                <TouchableOpacity style={styles.discardBtn} onPress={discardChanges}>
                  <Text style={styles.discardText}>DISCARD</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleUpdate} activeOpacity={0.8} style={styles.saveBtnTouch}>
                  <LinearGradient
                    colors={[COLORS.primary, COLORS.primary_dim]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.saveBtn}
                  >
                    <Text style={styles.saveBtnText}>SAVE CHANGES</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>

      {/* Success Overlay mockup rendered absolutely */}
      {isSuccess && (
        <Animated.View style={[
          styles.successOverlay,
          { 
            opacity: successAnim,
            transform: [{
              translateY: successAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [50, 0]
              })
            }]
          }
        ]}>
          <View style={styles.successIconBox}>
            <MaterialIcons name="cloud-done" size={20} color="#0b5800" />
          </View>
          <View>
            <Text style={styles.successTitle}>Configuration Synchronized</Text>
            <Text style={styles.successSub}>Your profile was updated securely.</Text>
          </View>
        </Animated.View>
      )}

      {/* Ambient background glow applied to body */}
      <View style={styles.ambientGlow} pointerEvents="none" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
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
    backgroundColor: COLORS.background,
  },
  backBtn: {
    padding: 8,
    marginLeft: -8,
  },
  appBarTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  appBarTitle: {
    color: COLORS.primary,
    fontSize: IS_SMALL_DEVICE ? 14 : 16,
    fontWeight: '900',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginLeft: 6,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 32,
    paddingBottom: 60,
  },
  heroSection: {
    marginBottom: 32,
  },
  heroTitle: {
    fontSize: IS_SMALL_DEVICE ? 38 : 48,
    fontWeight: '700',
    color: COLORS.on_surface,
    letterSpacing: -1,
    marginBottom: 8,
  },
  heroSub: {
    color: COLORS.on_surface_variant,
    fontSize: IS_SMALL_DEVICE ? 12 : 14,
    lineHeight: 22,
  },
  avatarCard: {
    backgroundColor: COLORS.surface_low,
    borderRadius: 20,
    padding: IS_SMALL_DEVICE ? 24 : 32,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  avatarWrapperContainer: {
    position: 'relative',
    marginBottom: 20,
  },
  avatarWrapper: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.surface_highest,
    borderWidth: 2,
    borderColor: 'rgba(129, 236, 255, 0.2)',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: COLORS.primary,
    padding: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 5,
  },
  nameHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  userName: {
    color: COLORS.on_surface,
    fontSize: IS_SMALL_DEVICE ? 18 : 20,
    fontWeight: '700',
  },
  activePill: {
    backgroundColor: COLORS.secondary_container,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
  },
  activePillText: {
    color: COLORS.secondary,
    fontSize: 9,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  statusList: {
    width: '100%',
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
    paddingVertical: 10,
  },
  statusLabel: {
    color: COLORS.on_surface_variant,
    fontSize: 12,
  },
  statusValueOptimal: {
    color: COLORS.secondary,
    fontSize: 12,
    fontWeight: '600',
  },
  statusValueAdmin: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  identityBadge: {
    backgroundColor: COLORS.surface_highest,
    borderRadius: 16,
    padding: 20,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
    marginBottom: 32,
  },
  badgeLabel: {
    color: COLORS.primary,
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 8,
  },
  badgeValue: {
    color: COLORS.on_surface,
    fontSize: IS_SMALL_DEVICE ? 16 : 18,
    fontWeight: '700',
    letterSpacing: 3,
  },
  formCard: {
    backgroundColor: COLORS.surface_low,
    borderRadius: 20,
    padding: IS_SMALL_DEVICE ? 20 : 32,
  },
  inputGroup: {
    marginBottom: 24,
  },
  inputLabel: {
    color: COLORS.on_surface_variant,
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    fontWeight: '600',
    marginBottom: 8,
    marginLeft: 4,
  },
  input: {
    height: 48,
    color: COLORS.on_surface,
    fontSize: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.outline_variant,
  },
  inputArea: {
    color: COLORS.on_surface,
    fontSize: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.outline_variant,
    paddingTop: 12,
    paddingBottom: 12,
    textAlignVertical: 'top',
  },
  inputActive: {
    borderBottomColor: COLORS.primary,
  },
  readOnlyField: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  readOnlyText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 16,
    marginLeft: 8,
  },
  actionContainer: {
    marginTop: 16,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
  },
  encryptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(47, 248, 1, 0.1)',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 24,
  },
  encryptionText: {
    color: COLORS.secondary,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1,
    marginLeft: 6,
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  discardBtn: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
  },
  discardText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 2,
  },
  saveBtnTouch: {
    flex: 1.5,
  },
  saveBtn: {
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.primary_container,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
  },
  saveBtnText: {
    color: '#004d57',
    fontSize: IS_SMALL_DEVICE ? 12 : 14,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  successOverlay: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(47, 248, 1, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(47, 248, 1, 0.3)',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  successIconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  successTitle: {
    color: COLORS.on_surface,
    fontSize: 14,
    fontWeight: '700',
  },
  successSub: {
    color: COLORS.on_surface_variant,
    fontSize: 11,
  },
  ambientGlow: {
    position: 'absolute',
    top: -100,
    left: -100,
    width: width,
    height: width,
    borderRadius: width / 2,
    backgroundColor: 'rgba(129, 236, 255, 0.03)',
  }
});
