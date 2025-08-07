import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

const PasswordResetScreen = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();

  const showAlert = (message: string) => {
    Alert.alert('Notice', message);
  };

  const handleRequestOTP = async () => {
    setLoading(true);
    try {
      const res = await fetch('https://ares-lock-system-1.onrender.com/app/password-reset-request/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        showAlert('OTP sent to your email');
        setStep(2);
      } else {
        const data = await res.json();
        showAlert(data.message || 'Failed to send OTP');
      }
    } catch {
      showAlert('Network error. Try again.');
    }
    setLoading(false);
  };

  const handleResendOTP = async () => {
    setLoading(true);
    try {
      const res = await fetch('https://ares-lock-system-1.onrender.com/app/resendotp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        showAlert('OTP resent to your email');
      } else {
        const data = await res.json();
        showAlert(data.message || 'Failed to resend OTP');
      }
    } catch {
      showAlert('Network error. Try again.');
    }
    setLoading(false);
  };

  const handlePasswordReset = async () => {
    if (newPassword !== confirmPassword) {
      showAlert("Passwords don't match");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('https://ares-lock-system-1.onrender.com/app/password-reset/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          otp,
          new_password: newPassword,
          confirm_password: confirmPassword,
        }),
      });

      if (res.ok) {
        showAlert('Password reset successful!');
        navigation.navigate('Login'); // <- screen name in navigator
      } else {
        const data = await res.json();
        showAlert(data.message || 'Reset failed');
      }
    } catch {
      showAlert('Network error. Try again.');
    }
    setLoading(false);
  };

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
      <View style={styles.topContainer}>
        <Image
          source={require('../assets/images/forgetpassword.png')} // <- make sure this image exists
          style={styles.image}
          resizeMode='contain'
        />
        <Text style={styles.title}>Reset Password</Text>
      </View>

      <View style={styles.formContainer}>
        {step === 1 ? (
          <>
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TouchableOpacity
              style={styles.button}
              onPress={handleRequestOTP}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Get OTP</Text>
              )}
            </TouchableOpacity>
          </>
        ) : (
          <>
            <TextInput
              style={styles.input}
              placeholder="OTP"
              value={otp}
              onChangeText={setOtp}
              keyboardType="numeric"
            />
            <TextInput
              style={styles.input}
              placeholder="New Password (6 digits or more)"
              secureTextEntry
              value={newPassword}
              onChangeText={setNewPassword}
            />
            <TextInput
              style={styles.input}
              placeholder="Confirm Password"
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
            <TouchableOpacity
              style={styles.button}
              onPress={handlePasswordReset}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Reset</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, { backgroundColor: '#007AFF' }]}
              onPress={handleResendOTP}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Resend OTP</Text>
              )}
            </TouchableOpacity>
          </>
        )}

        <View style={styles.footerLinks}>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.link}>Back to Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

export default PasswordResetScreen;

const styles = StyleSheet.create({
  topContainer: {
    alignItems: 'center',
    marginTop: 40,
  },
  image: {
    width: 300,
    height: 300,
    resizeMode: 'contain',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 10,
  },
  formContainer: {
    backgroundColor: '#f8f8f8',
    margin: 20,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  input: {
    borderBottomWidth: 1,
    borderColor: '#ccc',
    paddingVertical: 10,
    fontSize: 16,
    marginBottom: 18,
  },
  button: {
    backgroundColor: '#000',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  footerLinks: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 18,
  },
  link: {
    color: '#007AFF',
    fontSize: 15,
    textAlign: 'center',
  },
});
