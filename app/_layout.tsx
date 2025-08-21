import { AuthProvider } from "@/hooks/AuthContext";
import { DataFetchingProvider } from "@/hooks/DataFetching";
import { Stack } from "expo-router";
import React from "react";

export default function RootLayout() {
  return (
    <AuthProvider>
      <DataFetchingProvider>
        <Stack
          screenOptions={{
            headerShown: true,
            headerTitleAlign: "center", // Align all headers to the center
            headerBlurEffect: "prominent",
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
      </DataFetchingProvider>
    </AuthProvider>
  );
}
