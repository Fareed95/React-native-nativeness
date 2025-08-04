// App.tsx
import React from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  Button,
  View,
  Alert,
} from 'react-native';

import NativeBleManager from './specs/NativeBleManager';
import { PermissionsAndroid, Platform } from 'react-native';

const requestBlePermissions = async () => {
  if (Platform.OS === 'android') {
    try {
      const granted = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
      ]);

      const allGranted = Object.values(granted).every(
        (status) => status === PermissionsAndroid.RESULTS.GRANTED
      );

      if (!allGranted) {
        throw new Error('Required BLE permissions not granted');
      }
    } catch (err) {
      console.warn('Permission request error:', err);
      throw err;
    }
  }
};


function App(): React.JSX.Element {
  const handleUnlock = async () => {
    try {
      await requestBlePermissions();
      // Optional: Start scanning first
      NativeBleManager.startScan();

      // Wait a bit if needed (optional)
      await new Promise((resolve) => setTimeout(resolve, 3000));

      // Call openLock with your data
      const result = await NativeBleManager.openLock(
        'd8714d0ce90f',
        'vdsWrarnt3xyDMf8',
        '20BD58D4',
        900,
        29
      );

      Alert.alert('Lock Result', result);
    } catch (error) {
      console.error('Unlock failed:', error);
      Alert.alert('Error', 'Failed to unlock the lock.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>BLE Lock Controller</Text>

      <View style={styles.buttonContainer}>
        <Button title="Scan & Unlock Lock" onPress={handleUnlock} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 22,
    textAlign: 'center',
    marginBottom: 40,
  },
  buttonContainer: {
    marginHorizontal: 40,
  },
});

export default App;
