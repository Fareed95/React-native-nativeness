import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  SafeAreaView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';

type RootStackParamList = {
  Home: undefined;
  Register: undefined;
  PasswordReset: undefined;
};

const { width } = Dimensions.get('window');

const LoginScreen = () => {
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  const handleLogin = async () => {
    if (!emailOrPhone || !password) {
      Alert.alert('Validation Error', 'Please enter email/phone and password.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('https://ares-lock-system-1.onrender.com/app/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: emailOrPhone,
          password: password,
        }),
      });

      const data = await response.json();

      if (response.ok && data.jwt) {
        await AsyncStorage.setItem('token', data.jwt);
        Alert.alert('Success', 'Login successful!');
        // ✅ Navigate to Home and remove Login screen from stack
        navigation.replace('Home');
      } else {
        Alert.alert('Login Failed', data.detail || 'Invalid credentials.');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Image
          source={require('../assets/images/doorbg_fixed.png')}
          style={styles.headerImage}
          resizeMode="contain"
        />
      </View>

      <View style={styles.loginBox}>
        <TextInput
          style={styles.input}
          placeholder="Phone/Email"
          value={emailOrPhone}
          onChangeText={setEmailOrPhone}
          placeholderTextColor="#888"
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <View style={styles.passwordRow}>
          <TextInput
            style={[styles.input, { flex: 1 }]}
            placeholder="Password (6 digits or more)"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            placeholderTextColor="#888"
            autoCapitalize="none"
          />
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={styles.eyeIcon}
          >
            <Ionicons
              name={showPassword ? 'eye-off' : 'eye'}
              size={22}
              color="#555"
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.loginButton} onPress={handleLogin} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#000" />
          ) : (
            <Text style={styles.loginButtonText}>Log in</Text>
          )}
        </TouchableOpacity>

        <View style={styles.bottomLinks}>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={styles.linkText}>Register</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('PasswordReset')}>
            <Text style={styles.linkText}>Forget / Set password</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e5ecf2',
  },
  header: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 10,
    flex: 0,
  },
  headerImage: {
    height: 200,
    width: '100%',
    top: 20,
  },
  loginBox: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    flex: 1,
  },
  input: {
    height: 50,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    marginBottom: 16,
    paddingHorizontal: 8,
    fontSize: 16,
  },
  passwordRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  eyeIcon: {
    marginLeft: 8,
  },
  loginButton: {
    backgroundColor: '#ccc',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#444',
  },
  bottomLinks: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
  },
  linkText: {
    color: '#1976d2',
    fontSize: 15,
  },
});
