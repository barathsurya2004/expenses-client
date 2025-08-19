import { useAuth } from "@/hooks/AuthContext";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, Button, Text, TextInput, View } from "react-native";

export default function SignIn() {
  const [username, setUsername] = useState("");
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const router = useRouter();
  const auth = useAuth();
  const handleSignIn = () => {
    if (
      !username ||
      !firstname ||
      !lastname ||
      !email ||
      !password ||
      !confirmPassword
    ) {
      Alert.alert("Error", "Please fill all fields");
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    const user = auth.signup(username, email, password, firstname, lastname);
    if (!user) {
      Alert.alert("Error", "Failed to create account");
      return;
    }

    router.replace("/(tabs)/Index");
  };

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
      }}
    >
      <Text style={{ fontSize: 24, marginBottom: 20, color: "black" }}>
        Sign In
      </Text>
      <TextInput
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
        style={{ width: "100%", borderWidth: 1, marginBottom: 10, padding: 8 }}
      />
      <TextInput
        placeholder="First Name"
        value={firstname}
        onChangeText={setFirstname}
        style={{ width: "100%", borderWidth: 1, marginBottom: 10, padding: 8 }}
      />
      <TextInput
        placeholder="Last Name"
        value={lastname}
        onChangeText={setLastname}
        style={{ width: "100%", borderWidth: 1, marginBottom: 10, padding: 8 }}
      />
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={{ width: "100%", borderWidth: 1, marginBottom: 10, padding: 8 }}
        keyboardType="email-address"
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={{ width: "100%", borderWidth: 1, marginBottom: 10, padding: 8 }}
      />
      <TextInput
        placeholder="Confirm Password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
        style={{ width: "100%", borderWidth: 1, marginBottom: 20, padding: 8 }}
      />
      <Button title="Sign In" onPress={handleSignIn} />
    </View>
  );
}
