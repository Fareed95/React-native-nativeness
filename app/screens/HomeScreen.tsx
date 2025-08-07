import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ImageBackground,
  Alert,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Geolocation from 'react-native-geolocation-service';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

const { width } = Dimensions.get('window');

type RootStackParamList = {
  Login: undefined;
};

const HomeScreen: React.FC = () => {
  const [username, setUsername] = useState<string | null>(null);
  const [roomAssigned, setRoomAssigned] = useState<any>(null);
  const [isSpecialUser, setIsSpecialUser] = useState<boolean>(false);

  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

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

      if (response.status === 401) {
        Alert.alert('Token Expired!', 'Please log in again.');
        navigation.replace('Login');
        return;
      }

      if (!response.ok) throw new Error('Failed to fetch user');

      const data = await response.json();

      setUsername(data.username || data.name || 'User');
      setIsSpecialUser(data.is_special_user || false);

      if (data.roomassigned && data.roomassigned.length > 0) {
        setRoomAssigned(data.roomassigned[0]);
      } else {
        setRoomAssigned(null);
      }
    } catch (error) {
      console.error('Fetch user error:', error);
      Alert.alert('Error', 'Unable to fetch user');
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const requestLocationPermission = async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Location Permission',
          message: 'Location is required to unlock the room',
          buttonPositive: 'OK',
        }
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
    return true;
  };

  const handleUnlock = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        navigation.replace('Login');
        return;
      }

      let locationPayload = {};

      if (!isSpecialUser) {
        const hasPermission = await requestLocationPermission();
        if (!hasPermission) {
          Alert.alert('Permission Denied', 'Location is required to unlock the room');
          return;
        }

        await new Promise<void>((resolve, reject) => {
          Geolocation.getCurrentPosition(
            (position) => {
              locationPayload = {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
              };
              resolve();
            },
            (error) => {
              reject(error);
            },
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
          );
        });
      }

      const response = await fetch('https://ares-lock-system-1.onrender.com/app/user-unlock/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token,
        },
        body: JSON.stringify({
          roomId: roomAssigned?.roomId,
          ...locationPayload,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert('Success', data.rsn);
      } else {
        throw new Error('Unlock failed');
      }
    } catch (error) {
      console.error('Unlock error:', error);
      Alert.alert('Error', 'Failed to unlock the room');
    }
  };

  return (
    <ImageBackground
      source={require('../assets/images/homebacground_fixed.png')}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <View style={styles.topBar}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={styles.dropdown}>Welcome, {username ?? '...'}</Text>
            <TouchableOpacity onPress={fetchUser} style={{ marginLeft: 8 }}>
              <Ionicons name="refresh" size={20} color="white" />
            </TouchableOpacity>
          </View>
          <View style={styles.topIcons}>
            <Ionicons name="scan" size={24} color="white" style={styles.icon} />
            <Ionicons name="add" size={24} color="white" style={styles.icon} />
          </View>
        </View>

        <View style={styles.centerButtonContainer}>
          {roomAssigned ? (
            <>
              <TouchableOpacity style={styles.unlockCircle} onPress={handleUnlock}>
                <Ionicons name="lock-open-outline" size={48} color="#00ff99" />
              </TouchableOpacity>
              <Text style={styles.unlockText}>Click to unlock</Text>
            </>
          ) : (
            <>
              <TouchableOpacity style={styles.transparentCircle}>
                <Ionicons name="add" size={48} color="#00ff99" />
              </TouchableOpacity>
              <Text style={styles.unlockText}>No rooms assigned</Text>
            </>
          )}
        </View>
      </View>
    </ImageBackground>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    flex: 1,
    paddingTop: 40,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdown: {
    fontSize: 18,
    color: '#fff',
  },
  topIcons: {
    flexDirection: 'row',
  },
  icon: {
    marginLeft: 16,
  },
  centerButtonContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unlockCircle: {
    height: width / 2,
    width: width / 2,
    borderRadius: width / 2,
    backgroundColor: '#14A3C7',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  unlockText: {
    color: '#fff',
    fontSize: 16,
    marginTop: 12,
  },
  scanButton: {
    position: 'absolute',
    bottom: 40,
    right: 20,
    backgroundColor: '#14A3C7',
    borderRadius: 30,
    padding: 12,
    elevation: 6,
  },
});
