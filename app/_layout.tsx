
import { AuthProvider } from "@/hooks/AuthContext";
import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" options={{ title: "Login" }} />
        <Stack.Screen name="(tabs)" options={{ title: "Home" }} /> 
      </Stack>
    </AuthProvider>
  );
}
