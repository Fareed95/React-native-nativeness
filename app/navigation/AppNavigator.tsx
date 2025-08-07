// app/navigation/AppNavigator.tsx
import React, { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/ RegisterScreen';
import PasswordResetScreen from '../screens/PasswordResetScreen';
import SplashScreen from '../components/SplashScreen';
import BottomTabs from './BottomTabs'; // 👈 yeh zaroor import karna


const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const [initialRoute, setInitialRoute] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        setInitialRoute('Home');
      } else {
        setInitialRoute('Login');
      }
    };
    checkAuth();
  }, []);

  if (!initialRoute) {
    return <SplashScreen />; // can be loading spinner
  }

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={initialRoute}>
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Register" component={RegisterScreen} options={{ headerShown: false }} />
        <Stack.Screen name="PasswordReset" component={PasswordResetScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Home" component={BottomTabs} options={{ headerShown: false }}/>

      </Stack.Navigator>
    </NavigationContainer>
  );
}
