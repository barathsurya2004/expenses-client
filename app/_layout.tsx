import { AuthProvider } from "@/hooks/AuthContext";
import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack screenOptions={{ headerShown: true }}>
        <Stack.Screen name="Login" options={{ title: "Login" }} />
        <Stack.Screen name="(tabs)" options={{ title: "Home" }} />
        <Stack.Screen
          name="UploadReceipt"
          options={{ title: "Upload Receipt" }}
        />
      </Stack>
    </AuthProvider>
  );
}
