import { Alert, Platform } from 'react-native';

export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidPhone = (phone: string): boolean => {
  // Accepts a 10 digit number with optional Country Code or formatting
  const phoneRegex = /^(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}$/;
  return phoneRegex.test(phone) || phone.length === 10;
};

export const isValidPassword = (password: string): boolean => {
  return password.length >= 6;
};

export const hasEmptyStrings = (fields: { [key: string]: string | undefined }): string | null => {
  for (const [key, value] of Object.entries(fields)) {
    if (!value || value.trim() === '') {
      return key.charAt(0).toUpperCase() + key.slice(1);
    }
  }
  return null;
};

export const showError = (message: string) => {
  if (Platform.OS === 'web') {
    window.alert(`Error: ${message}`);
  } else {
    Alert.alert('Validation Error', message);
  }
};
