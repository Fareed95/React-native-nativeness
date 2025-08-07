import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';

type RootStackParamList = {
  Home: undefined;
  Login: undefined;
};

const ProfileScreen = () => {
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  const fetchUser = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        navigation.replace('Login');
        return;
      }

      const response = await fetch('https://ares-lock-system-1.onrender.com/app/user', {
        method: 'GET',
        headers: {
          Authorization: token,
        },
      });

      if (!response.ok) throw new Error('Fetch failed');

      const data = await response.json();
      setUser({
        name: data.username || data.name || 'User',
        email: data.email || 'No Email',
      });
    } catch (error) {
      console.error('Fetch user error:', error);
      Alert.alert('Error', 'Failed to load profile.');
    }
  };

  const handleLogout = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      await AsyncStorage.removeItem('token');

      if (token) {
        await fetch('https://ares-lock-system-1.onrender.com/app/logout/', {
          method: 'POST',
          headers: {
            Authorization: token,
          },
        });
      }

      navigation.replace('Login');
    } catch (error) {
      console.error('Logout error:', error);
      Alert.alert('Error', 'Failed to logout.');
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  if (!user) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00ff99" />
      </View>
    );
  }

  const firstInitial = user.name.charAt(0).toUpperCase();

  return (
    <View style={styles.container}>
      <View style={styles.circle}>
        <Text style={styles.initial}>{firstInitial}</Text>
      </View>
      <Text style={styles.name}>{user.name}</Text>
      <Text style={styles.email}>{user.email}</Text>

      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  circle: {
    width: 100,
    height: 100,
    backgroundColor: '#14A3C7',
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  initial: {
    fontSize: 40,
    color: '#fff',
    fontWeight: 'bold',
  },
  name: {
    fontSize: 22,
    color: '#fff',
    marginTop: 10,
  },
  email: {
    fontSize: 16,
    color: '#ccc',
    marginBottom: 30,
  },
  logoutBtn: {
    backgroundColor: '#E53935',
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 30,
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#111',
  },
});
