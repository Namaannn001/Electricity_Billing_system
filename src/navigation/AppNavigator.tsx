import React, { useContext, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthContext } from '../context/AuthContext';
import LoginScreen from '../screens/LoginScreen';
import AdminNavigator from './AdminNavigator';
import CustomerNavigator from './CustomerNavigator';
import AnimatedSplashScreen from '../screens/AnimatedSplashScreen';

const Stack = createNativeStackNavigator();

import { registerForPushNotificationsAsync } from '../utils/notifications';

export default function AppNavigator() {
  const { user, updatePushToken } = useContext(AuthContext);
  const [isBooted, setIsBooted] = useState(false);

  React.useEffect(() => {
    if (user) {
      (async () => {
        const token = await registerForPushNotificationsAsync();
        if (token && user.pushToken !== token) {
          await updatePushToken(user.id, token);
        }
      })();
    }
  }, [user]);

  // Still booting the splash sequence? Show our custom AI bootloader instead.
  if (!isBooted) {
    return <AnimatedSplashScreen onFinish={() => setIsBooted(true)} />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          <Stack.Screen name="Login" component={LoginScreen} />
        ) : user.role === 'admin' ? (
          <Stack.Screen name="AdminRoot" component={AdminNavigator} />
        ) : (
          <Stack.Screen name="CustomerRoot" component={CustomerNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
