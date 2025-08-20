import ClickButton from "@/components/Button";
import { Styles } from "@/components/Styles";
import { useAuth } from "@/hooks/AuthContext";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, Text, TextInput, View } from "react-native";

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
        justifyContent: "flex-start",
        alignItems: "center",
        padding: 20,
        backgroundColor: "white",
      }}
    >
      <Text style={{ fontSize: 24, marginBottom: 20, color: "black" }}>
        Sign In
      </Text>
      <TextInput
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
        style={Styles.inputBox}
      />
      <TextInput
        placeholder="First Name"
        value={firstname}
        onChangeText={setFirstname}
        style={Styles.inputBox}
      />
      <TextInput
        placeholder="Last Name"
        value={lastname}
        onChangeText={setLastname}
        style={Styles.inputBox}
      />
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={Styles.inputBox}
        keyboardType="email-address"
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={Styles.inputBox}
      />
      <TextInput
        placeholder="Confirm Password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
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
          title="Sign In"
          onPress={handleSignIn}
          style={Styles.buttonBlue}
        >
          <Text style={Styles.BlueBText}>Sign In</Text>
        </ClickButton>
        <Text
          style={{ marginTop: 20, color: "gray" }}
          onPress={() => router.replace("/Login")}
        >
          Already have an account?
        </Text>
      </View>
    </View>
  );
}
