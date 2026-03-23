import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import CustomerTabs from './CustomerTabs';
import PayBillScreen from '../screens/customer/PayBillScreen';
import ReceiptScreen from '../screens/customer/ReceiptScreen';

const Stack = createNativeStackNavigator();

export default function CustomerNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {/* Tab Navigator handles internal screen state (Dashboard, History, SOS, Profile) */}
      <Stack.Screen name="CustomerTabs" component={CustomerTabs} />
      
      {/* Modals and full-screen flows sit on top of the tab bar */}
      <Stack.Screen name="PayBill" component={PayBillScreen} />
      <Stack.Screen name="Receipt" component={ReceiptScreen} />
    </Stack.Navigator>
  );
}
