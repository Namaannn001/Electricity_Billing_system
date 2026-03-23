import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Set handler so notifications show up even when the app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function registerForPushNotificationsAsync() {
  let token;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#00E5FF', // Matches our AI neon aesthetic
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      console.warn('Failed to get push token for push notification!');
      return;
    }
    // Required to configure push token mapping on Expo servers.
    try {
        const projectId = 'your-expo-project-id'; // usually configured in app.json via Constants.expoConfig.extra.eas.projectId
        token = (await Notifications.getExpoPushTokenAsync()).data;
    } catch(e) {
        console.log("Could not fetch remote token, local notifications still work");
    }
  } else {
    console.log('Must use physical device for Push Notifications, local simulated for dev.');
  }

  return token;
}

// Function to simulate backend generating a bill and sending a push
export async function scheduleNewBillNotification(amount: number, meterId: string) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: '⚡ SYSTEM ALERT: NEW BILL',
      body: `A new extraction cycle bill (₹${amount.toFixed(2)}) has been generated for hardware ID ${meterId}.`,
      data: { type: 'new_bill', meterId },
      sound: true,
    },
    trigger: null, // Send immediately
  });
}

// Function to notify user about existing unpaid bills when they log in
export async function scheduleLoginBillReminder(month: string, amount: number) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: '⚡ SYSTEM READY: BILL DETECTED',
      body: `Your electricity bill for ${month} (₹${amount.toFixed(2)}) is here for your review.`,
      data: { type: 'login_reminder' },
      sound: true,
    },
    trigger: null, // Send immediately upon login detection
  });
}

// Function to send a REMOTE push notification via Expo's Push API
// This allows an Admin on one phone to notify a Customer on another phone (even if app is closed)
export async function sendRemotePushNotification(expoPushToken: string, title: string, body: string) {
  const message = {
    to: expoPushToken,
    sound: 'default',
    title: title,
    body: body,
    data: { someData: 'goes here' },
  };

  await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Accept-encoding': 'gzip, deflate',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(message),
  });
}

