import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Button, Text, TextInput, View } from 'react-native';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();
//   const { token, login } = useAuth();
     const handleLogin = () => {
    // Fake login: set a dummy token
    if (username && password) {
      // Simulate a successful login
      // In a real app, you would call an API to authenticate the user
      // and then set the token in your auth context or state.
      router.replace('/(tabs)/Index');
    }
  };

//   useEffect(() => {
//     if (token) {
//       router.replace('/(tabs)');
//     }
//   }, [token, router]);

//   const handleLogin = () => {
//     login(username, password);
//   };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
      <Text style={{ fontSize: 24, marginBottom: 20,color:"black" }}>Login</Text>
      <TextInput
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
        style={{ width: '100%', borderWidth: 1, marginBottom: 10, padding: 8 }}
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={{ width: '100%', borderWidth: 1, marginBottom: 20, padding: 8 }}
      />
      <Button title="Login" onPress={handleLogin} />
    </View>
  );
}
