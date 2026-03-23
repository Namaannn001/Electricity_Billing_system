import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Role = 'admin' | 'customer';

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: Role;
  meterNumber?: string;
  address?: string;
  city?: string;
  state?: string;
  phoneNumber?: string;
  meterLocation?: string;
  meterType?: string;
  phaseCode?: string;
  billType?: string;
  billingDays?: string;
  pushToken?: string;
  profileImage?: string;
}

export interface Bill {
  id: string;
  customerId: string;
  meterNumber: string;
  billingMonth?: string;
  readingDate: string;
  currentReading: number;
  previousReading: number;
  unitsConsumed: number;
  totalAmount: number;
  dueDate: string;
  status: 'unpaid' | 'paid';
}

interface AuthContextData {
  user: User | null;
  login: (email: string, password: string, role: Role) => Promise<void>;
  register: (userData: Omit<User, 'id'>) => Promise<void>;
  logout: () => void;
  getAllUsers: () => Promise<User[]>;
  addUser: (userData: Omit<User, 'id'>) => Promise<void>;
  updateUser: (userId: string, updatedData: Partial<User>) => Promise<void>;
  updatePushToken: (userId: string, token: string) => Promise<void>;
  getAllBills: () => Promise<Bill[]>;
  getCustomerBills: (customerId: string) => Promise<Bill[]>;
  addBill: (billData: Omit<Bill, 'id'>) => Promise<void>;
  payBill: (billId: string) => Promise<void>;
}

export const AuthContext = createContext<AuthContextData>({} as AuthContextData);

const USERS_KEY = '@users';
const BILLS_KEY = '@bills';

export const AuthProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    seedData();
    loadUser();
  }, []);

  const seedData = async () => {
    const existingUsersStr = await AsyncStorage.getItem(USERS_KEY);
    const users = existingUsersStr ? JSON.parse(existingUsersStr) : [];
    
    // Seed admin if no users exist at all
    if (users.length === 0) {
      const defaultAdmin: User = {
        id: 'admin_1',
        name: 'Super Admin',
        email: 'admin@system.com',
        password: 'password123',
        role: 'admin',
      };
      await AsyncStorage.setItem(USERS_KEY, JSON.stringify([defaultAdmin]));
      console.log("SYSTEM SEED: DEFAULT ADMIN INITIALIZED.");
    }
  };

  const loadUser = async () => {
    const storedUser = await AsyncStorage.getItem('@currentUser');
    if (storedUser) setUser(JSON.parse(storedUser));
  };

  const login = async (email: string, password: string, role: Role) => {
    const usersStr = await AsyncStorage.getItem(USERS_KEY);
    const users: User[] = usersStr ? JSON.parse(usersStr) : [];
    
    // Safety trim for accidental whitespace
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    const foundUser = users.find(
      u => u.email.toLowerCase() === cleanEmail && 
           u.password === cleanPassword &&
           u.role === role
    );

    if (foundUser) {
      setUser(foundUser);
      await AsyncStorage.setItem('@currentUser', JSON.stringify(foundUser));
    } else {
      throw new Error('Invalid email, password, or role selected.');
    }
  };

  const register = async (userData: Omit<User, 'id'>) => {
    const users = await getAllUsers();
    if (users.find(u => u.email.toLowerCase() === userData.email.toLowerCase())) {
      throw new Error('Email already exists');
    }
    
    const newUser: User = { ...userData, id: Date.now().toString() };
    await AsyncStorage.setItem(USERS_KEY, JSON.stringify([...users, newUser]));
    // Auto login after register
    setUser(newUser);
    await AsyncStorage.setItem('@currentUser', JSON.stringify(newUser));
  };

  const logout = async () => {
    setUser(null);
    await AsyncStorage.removeItem('@currentUser');
  };

  const getAllUsers = async (): Promise<User[]> => {
    const data = await AsyncStorage.getItem(USERS_KEY);
    return data ? JSON.parse(data) : [];
  };

  // Used by admin
  const addUser = async (userData: Omit<User, 'id'>) => {
    const users = await getAllUsers();
    if (users.find(u => u.email.toLowerCase() === userData.email.toLowerCase())) {
      throw new Error('Email already exists');
    }
    
    const newUser: User = { 
      ...userData, 
      id: Date.now().toString(),
      password: userData.password || '123456' 
    };
    await AsyncStorage.setItem(USERS_KEY, JSON.stringify([...users, newUser]));
  };

  const updateUser = async (userId: string, updatedData: Partial<User>) => {
    const users = await getAllUsers();
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex === -1) throw new Error('User not found');
    
    const updatedUser = { ...users[userIndex], ...updatedData };
    users[userIndex] = updatedUser;
    
    await AsyncStorage.setItem(USERS_KEY, JSON.stringify(users));
    
    // Also fetch currently logged in user directly from storage to prevent closure staleness
    const currentStorageStr = await AsyncStorage.getItem('@currentUser');
    if (currentStorageStr) {
      const storedUser = JSON.parse(currentStorageStr);
      if (storedUser.id === userId) {
        setUser(updatedUser);
        await AsyncStorage.setItem('@currentUser', JSON.stringify(updatedUser));
      }
    }
  };
  
  const updatePushToken = async (userId: string, token: string) => {
    const users = await getAllUsers();
    const updatedUsers = users.map(u => u.id === userId ? { ...u, pushToken: token } : u);
    await AsyncStorage.setItem(USERS_KEY, JSON.stringify(updatedUsers));
    
    if (user && user.id === userId) {
      const updatedUser = { ...user, pushToken: token };
      setUser(updatedUser);
      await AsyncStorage.setItem('@currentUser', JSON.stringify(updatedUser));
    }
  };

  const getAllBills = async (): Promise<Bill[]> => {
    const data = await AsyncStorage.getItem(BILLS_KEY);
    return data ? JSON.parse(data) : [];
  };

  const getCustomerBills = async (customerId: string): Promise<Bill[]> => {
    const bills = await getAllBills();
    return bills.filter(b => b.customerId === customerId);
  };

  const addBill = async (billData: Omit<Bill, 'id'>) => {
    const bills = await getAllBills();
    const newBill: Bill = { ...billData, id: Date.now().toString() };
    await AsyncStorage.setItem(BILLS_KEY, JSON.stringify([...bills, newBill]));
  };

  const payBill = async (billId: string) => {
    const bills = await getAllBills();
    const updatedBills = bills.map(b => b.id === billId ? { ...b, status: 'paid' as const } : b);
    await AsyncStorage.setItem(BILLS_KEY, JSON.stringify(updatedBills));
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, getAllUsers, addUser, updateUser, updatePushToken, getAllBills, getCustomerBills, addBill, payBill }}>
      {children}
    </AuthContext.Provider>
  );
};
