import ClickButton from "@/components/Button";
import { Styles } from "@/components/Styles";
import { useAuth } from "@/hooks/AuthContext";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Alert, Text, TextInput, View } from "react-native";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const auth = useAuth(); // Assuming you have an Auth context or hook

  useEffect(() => {
    if (auth.user) {
      router.dismissAll();
      router.replace("/(tabs)/Index");
    }
  }, [auth.user]);

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert("Error", "Please enter both username and password");
      return;
    }
    const user = await auth.login(username, password);
    if (!user) {
      Alert.alert("Error", "Invalid username or password");
      return;
    }
    console.log("Logged in user:", user);

    // Simulate successful login
    router.dismissAll();
    router.replace("/(tabs)/Index");
  };

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "flex-start",
        alignItems: "center",
        padding: 20,
      }}
    >
      <Text style={{ fontSize: 24, marginBottom: 20, color: "black" }}>
        Login
      </Text>
      <TextInput
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
        style={Styles.inputBox}
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={Styles.inputBox}
      />
      <View style={{ flex: 1 }} />
      <View
        style={{
          width: "100%",
          margin: 20,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ClickButton
          title="Login"
          onPress={handleLogin}
          style={Styles.buttonBlue}
        >
          <Text style={Styles.BlueBText}>Login</Text>
        </ClickButton>
        <Text
          style={{ marginTop: 20, color: "gray" }}
          onPress={() => router.replace("/SignIn")}
        >
          Don't have an account?
        </Text>
      </View>
    </View>
  );
}
