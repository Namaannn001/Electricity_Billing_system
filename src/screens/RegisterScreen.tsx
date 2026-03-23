// import React, { useState, useContext } from 'react';
// import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Dimensions, KeyboardAvoidingView, Platform } from 'react-native';
// import { AuthContext, Role } from '../context/AuthContext';
// import { useNavigation } from '@react-navigation/native';
// import { isValidEmail, isValidPassword, showError } from '../utils/validators';
// import { LinearGradient } from 'expo-linear-gradient';
// import { BlurView } from 'expo-blur';

// const { width } = Dimensions.get('window');

// export default function RegisterScreen() {
//   const { register } = useContext(AuthContext);
//   const navigation: any = useNavigation();

//   const [role, setRole] = useState<Role>('customer');
//   const [activeInput, setActiveInput] = useState<string | null>(null);
//   const [form, setForm] = useState({
//     name: '',
//     email: '',
//     password: '',
//     meterNumber: ''
//   });

//   const handleChange = (key: string, value: string) => {
//     setForm(prev => ({ ...prev, [key]: value }));
//   };

//   const handleRegister = async () => {
//     if (!form.name || !form.email || !form.password) {
//       showError('Name, Email and Password are required');
//       return;
//     }

//     if (!isValidEmail(form.email)) {
//       showError('Please enter a valid email address');
//       return;
//     }

//     if (!isValidPassword(form.password)) {
//       showError('Password must be at least 6 characters');
//       return;
//     }

//     if (role === 'customer' && (!form.meterNumber || form.meterNumber.trim() === '')) {
//       showError('Meter Number is required for customers');
//       return;
//     }

//     try {
//       await register({
//         name: form.name,
//         email: form.email,
//         password: form.password,
//         role: role,
//         meterNumber: form.meterNumber
//       });
//     } catch (error: any) {
//       showError(error.message);
//     }
//   };

//   return (
//     <KeyboardAvoidingView 
//       behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
//       style={styles.mainContainer}
//     >
//       <View style={[styles.orb, styles.orbTop]} />
//       <View style={[styles.orb, styles.orbBottom]} />

//       <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
//         <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
//           <Text style={styles.backBtnText}>{'<'} RETURN TO GATEWAY</Text>
//         </TouchableOpacity>

//         <Text style={styles.title}>Initialize System</Text>
        
//         <BlurView intensity={20} tint="dark" style={styles.glassCard}>
//           <View style={styles.toggleContainer}>
//             <TouchableOpacity 
//               style={[styles.toggleBtn, role === 'customer' && styles.toggleBtnActive]} 
//               onPress={() => setRole('customer')}
//             >
//               <Text style={[styles.toggleText, role === 'customer' && styles.toggleTextActive]}>Customer</Text>
//             </TouchableOpacity>
//             <TouchableOpacity 
//               style={[styles.toggleBtn, role === 'admin' && styles.toggleBtnActive]} 
//               onPress={() => setRole('admin')}
//             >
//               <Text style={[styles.toggleText, role === 'admin' && styles.toggleTextActive]}>Admin</Text>
//             </TouchableOpacity>
//           </View>

//           <View style={styles.inputGroup}>
//             <Text style={styles.label}>FULL DESIGNATION</Text>
//             <TextInput
//               style={[styles.input, activeInput === 'name' && styles.inputActive]}
//               placeholder="Enter full name"
//               placeholderTextColor="#64748B"
//               value={form.name}
//               onChangeText={val => handleChange('name', val)}
//               onFocus={() => setActiveInput('name')}
//               onBlur={() => setActiveInput(null)}
//             />
//           </View>

//           <View style={styles.inputGroup}>
//             <Text style={styles.label}>COMMUNICATION VECTOR</Text>
//             <TextInput
//                style={[styles.input, activeInput === 'email' && styles.inputActive]}
//               placeholder="Enter email address"
//               placeholderTextColor="#64748B"
//               value={form.email}
//               onChangeText={val => handleChange('email', val)}
//               onFocus={() => setActiveInput('email')}
//               onBlur={() => setActiveInput(null)}
//               autoCapitalize="none"
//               keyboardType="email-address"
//             />
//           </View>

//           <View style={styles.inputGroup}>
//             <Text style={styles.label}>SECURITY KEY</Text>
//             <TextInput
//               style={[styles.input, activeInput === 'password' && styles.inputActive]}
//               placeholder="Create security password"
//               placeholderTextColor="#64748B"
//               value={form.password}
//               onChangeText={val => handleChange('password', val)}
//               onFocus={() => setActiveInput('password')}
//               onBlur={() => setActiveInput(null)}
//               secureTextEntry
//             />
//           </View>

//           {role === 'customer' && (
//             <View style={styles.inputGroup}>
//               <Text style={styles.label}>METER IDENTIFIER</Text>
//               <TextInput
//                 style={[styles.input, activeInput === 'meterNumber' && styles.inputActive]}
//                 placeholder="Enter unique meter number"
//                 placeholderTextColor="#64748B"
//                 value={form.meterNumber}
//                 onChangeText={val => handleChange('meterNumber', val)}
//                 onFocus={() => setActiveInput('meterNumber')}
//                 onBlur={() => setActiveInput(null)}
//               />
//             </View>
//           )}
          
//           <TouchableOpacity onPress={handleRegister} activeOpacity={0.8} style={styles.buttonWrapper}>
//             <LinearGradient
//               colors={['#8B5CF6', '#00E5FF']}
//               start={{ x: 0, y: 0 }}
//               end={{ x: 1, y: 0 }}
//               style={styles.buttonGradient}
//             >
//               <Text style={styles.buttonText}>Establish Connection</Text>
//             </LinearGradient>
//           </TouchableOpacity>
//         </BlurView>
//       </ScrollView>
//     </KeyboardAvoidingView>
//   );
// }

// const styles = StyleSheet.create({
//   mainContainer: {
//     flex: 1,
//     backgroundColor: '#0B0F19',
//   },
//   scrollContent: {
//     flexGrow: 1,
//     padding: 20,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   orb: {
//     position: 'absolute',
//     width: 300,
//     height: 300,
//     borderRadius: 150,
//     opacity: 0.15,
//   },
//   orbTop: {
//     top: -50,
//     right: -100,
//     backgroundColor: '#8B5CF6',
//   },
//   orbBottom: {
//     bottom: -100,
//     left: -100,
//     width: 400,
//     height: 400,
//     borderRadius: 200,
//     backgroundColor: '#00E5FF',
//   },
//   backBtn: {
//     alignSelf: 'flex-start',
//     marginTop: 40,
//     marginBottom: 20,
//   },
//   backBtnText: {
//     color: '#00E5FF',
//     fontSize: 12,
//     fontWeight: '800',
//     letterSpacing: 2,
//   },
//   title: {
//     fontSize: 32,
//     fontWeight: '900',
//     color: '#F8FAFC',
//     marginBottom: 24,
//     letterSpacing: 1,
//     alignSelf: 'flex-start',
//   },
//   glassCard: {
//     width: width * 0.9,
//     maxWidth: 400,
//     padding: 24,
//     borderRadius: 24,
//     borderWidth: 1,
//     borderColor: 'rgba(255, 255, 255, 0.1)',
//     backgroundColor: 'rgba(15, 23, 42, 0.6)',
//     overflow: 'hidden',
//     alignSelf: 'center',
//   },
//   toggleContainer: {
//     flexDirection: 'row',
//     marginBottom: 24,
//     backgroundColor: 'rgba(0, 0, 0, 0.3)',
//     borderRadius: 12,
//     padding: 4,
//     borderWidth: 1,
//     borderColor: 'rgba(255, 255, 255, 0.05)',
//   },
//   toggleBtn: {
//     flex: 1,
//     paddingVertical: 12,
//     alignItems: 'center',
//     borderRadius: 8,
//   },
//   toggleBtnActive: {
//     backgroundColor: 'rgba(255, 255, 255, 0.1)',
//   },
//   toggleText: {
//     color: '#64748B',
//     fontWeight: '600',
//     fontSize: 14,
//   },
//   toggleTextActive: {
//     color: '#00E5FF',
//   },
//   inputGroup: {
//     marginBottom: 20,
//   },
//   label: {
//     fontSize: 11,
//     color: '#94A3B8',
//     marginBottom: 8,
//     fontWeight: '700',
//     letterSpacing: 1,
//   },
//   input: {
//     backgroundColor: 'rgba(0, 0, 0, 0.3)',
//     borderWidth: 1,
//     borderColor: 'rgba(255, 255, 255, 0.05)',
//     borderRadius: 12,
//     padding: 16,
//     fontSize: 16,
//     color: '#F8FAFC',
//   },
//   inputActive: {
//     borderColor: '#8B5CF6',
//     shadowColor: '#8B5CF6',
//     shadowOpacity: 0.2,
//     shadowRadius: 10,
//     shadowOffset: { width: 0, height: 0 },
//   },
//   buttonWrapper: {
//     marginTop: 10,
//   },
//   buttonGradient: {
//     padding: 16,
//     borderRadius: 12,
//     alignItems: 'center',
//     shadowColor: '#8B5CF6',
//     shadowOpacity: 0.4,
//     shadowRadius: 16,
//     shadowOffset: { width: 0, height: 4 },
//   },
//   buttonText: {
//     color: '#FFFFFF',
//     fontSize: 16,
//     fontWeight: '800',
//     letterSpacing: 1,
//     textTransform: 'uppercase',
//   }
// });
