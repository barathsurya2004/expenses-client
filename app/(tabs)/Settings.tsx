import { useAuth } from "@/hooks/AuthContext";
import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import { Button, Text, View } from "react-native";

const Settings = () => {
  const { logout, user, token } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.replace("/");
    }
  }, [user]);

  const handleLogout = () => {
    logout();
  };

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "white", // Changed to white for better visibility
        padding: 20,
        borderRadius: 10,
        shadowColor: "#000",
      }}
    >
      <Text>Settings</Text>
      <Button title="Logout" onPress={handleLogout} />
    </View>
  );
};

export default Settings;
