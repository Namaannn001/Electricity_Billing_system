import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import CustomerDashboard from '../screens/customer/CustomerDashboard';
import BillHistoryScreen from '../screens/customer/BillHistoryScreen';
import PayBillScreen from '../screens/customer/PayBillScreen';
import ProfileDetailsScreen from '../screens/customer/ProfileDetailsScreen';
import ReceiptScreen from '../screens/customer/ReceiptScreen';

const Stack = createNativeStackNavigator();

export default function CustomerNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Dashboard" component={CustomerDashboard} />
      <Stack.Screen name="BillHistory" component={BillHistoryScreen} />
      <Stack.Screen name="PayBill" component={PayBillScreen} />
      <Stack.Screen name="ProfileDetails" component={ProfileDetailsScreen} />
      <Stack.Screen name="Receipt" component={ReceiptScreen} />
    </Stack.Navigator>
  );
}
