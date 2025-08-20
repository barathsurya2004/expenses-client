import { AuthProvider } from "@/hooks/AuthContext";
import { Stack } from "expo-router";
import React from "react";

export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack
        screenOptions={{
          headerShown: true,
          headerTitleAlign: "center", // Align all headers to the center
        }}
      >
        <Stack.Screen
          name="index"
          options={{ title: "Home", headerShown: false }}
        />
        <Stack.Screen
          name="Login"
          options={{
            title: "Login",
          }}
        />
        <Stack.Screen name="(tabs)" options={{ title: "Dashboard" }} />
        <Stack.Screen
          name="UploadReceipt"
          options={{ title: "Add Expenses" }}
        />
        <Stack.Screen
          name="SignIn"
          options={{ title: "Sign In", headerBackTitle: "Back" }}
        />
      </Stack>
    </AuthProvider>
  );
}
