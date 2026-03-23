import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';

import AdminDashboard from '../screens/admin/AdminDashboard';
import ManageUsersScreen from '../screens/admin/ManageUsersScreen';
import AddUserScreen from '../screens/admin/AddUserScreen';
import ProfileDetailsScreen from '../screens/customer/ProfileDetailsScreen';

const Tab = createBottomTabNavigator();

const COLORS = {
  background: '#0e0e0e',
  surface_highest: '#262626',
  primary: '#81ecff',
  primary_dim: '#00d4ec',
  on_surface_variant: '#adaaaa',
};

export default function AdminTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: styles.tabBar,
        tabBarBackground: () => (
          Platform.OS === 'ios' ? (
            <BlurView tint="dark" intensity={80} style={StyleSheet.absoluteFillObject} />
          ) : (
            <View style={[StyleSheet.absoluteFillObject, { backgroundColor: 'rgba(26,26,26,0.98)' }]} />
          )
        ),
      }}
    >
      <Tab.Screen
        name="AdminHome"
        component={AdminDashboard}
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={[styles.tabIconContainer, focused && styles.tabIconContainerActive]}>
              <MaterialIcons name="grid-view" size={24} color={focused ? COLORS.primary : COLORS.on_surface_variant} />
              <Text style={[styles.tabLabel, { color: focused ? COLORS.primary_dim : COLORS.on_surface_variant }]}>HOME</Text>
            </View>
          ),
        }}
      />
      
      <Tab.Screen
        name="ManageUsers"
        component={ManageUsersScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={[styles.tabIconContainer, focused && styles.tabIconContainerActive]}>
              <MaterialIcons name="manage-accounts" size={24} color={focused ? COLORS.primary : COLORS.on_surface_variant} />
              <Text style={[styles.tabLabel, { color: focused ? COLORS.primary_dim : COLORS.on_surface_variant }]}>NETWORK</Text>
            </View>
          ),
        }}
      />
      
      <Tab.Screen
        name="AddUser"
        component={AddUserScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={[styles.tabIconContainer, focused && styles.tabIconContainerActive]}>
              <MaterialIcons name="person-add-alt-1" size={24} color={focused ? COLORS.primary : COLORS.on_surface_variant} />
              <Text style={[styles.tabLabel, { color: focused ? COLORS.primary_dim : COLORS.on_surface_variant }]}>PROVISION</Text>
            </View>
          ),
        }}
      />

      <Tab.Screen
        name="AdminProfile"
        component={ProfileDetailsScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={[styles.tabIconContainer, focused && styles.tabIconContainerActive]}>
              <MaterialIcons name="person" size={24} color={focused ? COLORS.primary : COLORS.on_surface_variant} />
              <Text style={[styles.tabLabel, { color: focused ? COLORS.primary_dim : COLORS.on_surface_variant }]}>PROFILE</Text>
            </View>
          ),
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    borderTopWidth: 0,
    elevation: 0,
    height: 70,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    backgroundColor: Platform.OS === 'android' ? '#1a1a1a' : 'transparent',
  },
  tabIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 24,
  },
  tabIconContainerActive: {
    backgroundColor: 'rgba(0, 227, 253, 0.1)', 
  },
  tabLabel: {
    fontSize: 9,
    fontWeight: '700',
    marginTop: 2,
    letterSpacing: 0.5,
  }
});
