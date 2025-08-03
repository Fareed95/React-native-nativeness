// App.tsx
import React from 'react';
import { SafeAreaView, StyleSheet, Text } from 'react-native';

import NativeHello from './specs/NativeHello';

function App(): React.JSX.Element {
  const [message, setMessage] = React.useState<string>('');

  React.useEffect(() => {
    try {
      const result = NativeHello.getHello();
      setMessage(result);
    } catch (err) {
      console.error('Error calling native module:', err);
    }
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.text}>Native says: {message}</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  text: {
    fontSize: 20,
  },
});

export default App;
