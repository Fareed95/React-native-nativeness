import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  SafeAreaView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';

const RegisterScreen = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [isRegistered, setIsRegistered] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const navigation = useNavigation();

  const handleRegister = async () => {
    try {
      const response = await fetch('https://ares-lock-system-1.onrender.com/app/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          password,
          confirm_password: confirmPassword,
        }),
      });

      if (response.ok) {
        Alert.alert('Success', 'Kindly check your email for OTP verification.');
        setIsRegistered(true);
      } else {
        const data = await response.json();
        setErrorMessage(data.message || 'Something went wrong.');
      }
    } catch (error) {
      setErrorMessage('Error in registration, please try again later.');
    }
  };

  const handleVerifyOtp = async () => {
    try {
      const response = await fetch('https://ares-lock-system-1.onrender.com/app/register', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          otp,
        }),
      });

      if (response.ok) {
        const loginResponse = await fetch('https://ares-lock-system-1.onrender.com/app/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email,
            password,
          }),
        });

        const loginData = await loginResponse.json();

        if (loginResponse.ok && loginData.jwt) {
          await AsyncStorage.setItem('token', loginData.jwt);
          Alert.alert('Success', 'Login successful!');
          navigation.replace('Home'); // 👈 Adjust this to your stack screen name
        } else {
          Alert.alert('Login Failed', loginData.detail || 'Invalid credentials.');
        }
      } else {
        const data = await response.json();
        setErrorMessage(data.message?.email || 'Invalid OTP, please try again.');
      }
    } catch (error) {
      setErrorMessage('Error verifying OTP, please try again later.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Icon name="arrow-back" size={24} color="#1976d2" />
      </TouchableOpacity>

      <Text style={styles.title}>Register</Text>

      <TextInput
        placeholder="Name"
        value={name}
        onChangeText={setName}
        style={styles.input}
        placeholderTextColor="#888"
      />
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        placeholderTextColor="#888"
      />
      <TextInput
        placeholder="Password (6 digits or more)"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        style={styles.input}
        placeholderTextColor="#888"
      />
      <TextInput
        placeholder="Confirm password (6 digits or more)"
        secureTextEntry
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        style={styles.input}
        placeholderTextColor="#888"
      />

      {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}

      {isRegistered ? (
        <>
          <TextInput
            placeholder="Enter OTP"
            value={otp}
            onChangeText={setOtp}
            style={styles.input}
            placeholderTextColor="#888"
          />

          <TouchableOpacity onPress={handleVerifyOtp} style={styles.button}>
            <Text style={styles.buttonText}>Verify OTP</Text>
          </TouchableOpacity>
        </>
      ) : (
        <TouchableOpacity onPress={handleRegister} style={styles.button}>
          <Text style={styles.buttonText}>Register</Text>
        </TouchableOpacity>
      )}

      <Text style={styles.terms}>
        Accept <Text style={styles.link}>Service Terms</Text> and{' '}
        <Text style={styles.link}>Privacy Policy</Text>
      </Text>
    </SafeAreaView>
  );
};

export default RegisterScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#fff',
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    zIndex: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 80,
    marginBottom: 24,
    color: 'black',
  },
  input: {
    borderBottomWidth: 1,
    borderColor: '#ccc',
    marginBottom: 16,
    padding: 10,
    fontSize: 16,
    color: '#333',
  },
  terms: {
    marginBottom: 20,
    fontSize: 14,
    color: '#555',
  },
  link: {
    color: '#1976d2',
    fontWeight: '600',
  },
  button: {
    backgroundColor: 'black',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  error: {
    color: 'red',
    marginBottom: 10,
    fontSize: 14,
  },
});
