import ClickButton from "@/components/Button";
import { Styles } from "@/components/Styles";
import { useAuth } from "@/hooks/AuthContext";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Text, View } from "react-native";

export default function Home() {
  const router = useRouter();
  const [showChoice, setShowChoice] = useState(true);
  const auth = useAuth(); // Assuming you have an Auth context or hook
  useEffect(() => {
    if (auth.user) {
      router.replace("/(tabs)/Index");
    }
  }, [auth]);

  useFocusEffect(
    React.useCallback(() => {
      setShowChoice(true); // Reset the state when the screen comes into focus
    }, [])
  );

  if (showChoice) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          padding: 20,
          backgroundColor: "white", // Changed to white for better visibility
        }}
      >
        <Text
          style={{
            fontSize: 24,
            marginBottom: 20,
            color: "black",
          }}
        >
          Welcome
        </Text>
        <View style={{ height: 10 }} />
        <ClickButton
          title="Sign In"
          onPress={() => {
            setShowChoice(false);
            router.push("/SignIn");
          }}
          style={Styles.buttonBlue}
        >
          <Text style={Styles.BlueBText}>Sign In</Text>
        </ClickButton>
        <ClickButton
          title="Login"
          onPress={() => {
            setShowChoice(false);
            router.push("/Login");
          }}
          style={Styles.buttonWhite}
        >
          <Text style={Styles.WhiteBText}>Login</Text>
        </ClickButton>
      </View>
    );
  }
  return null;
}
