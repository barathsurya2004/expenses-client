import { useAuth } from "@/hooks/AuthContext";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Button, Text, View } from "react-native";

export default function Home() {
  const router = useRouter();
  const [showChoice, setShowChoice] = useState(true);
  const auth = useAuth(); // Assuming you have an Auth context or hook
  useEffect(() => {
    if (auth.user) {
      router.replace("/(tabs)/Index");
    }
  }, [auth]);

  if (showChoice) {
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
          Welcome
        </Text>
        <Button
          title="Sign In"
          onPress={() => {
            setShowChoice(false);
            router.replace("/SignIn");
          }}
        />
        <View style={{ height: 10 }} />
        <Button
          title="Login"
          onPress={() => {
            setShowChoice(false);
            router.replace("/Login");
          }}
        />
      </View>
    );
  }
  return null;
}
