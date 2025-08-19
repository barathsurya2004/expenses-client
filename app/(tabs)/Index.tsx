import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Button, Text, View } from "react-native";

import { useAuth } from "@/hooks/AuthContext";

export default function Index() {
  const router = useRouter();
  const auth = useAuth();
  const [image, setImage] = useState<string | null>(null);
  const [aspect, setAspect] = useState<{
    width: number;
    height: number;
  } | null>(null);

  useEffect(() => {
    if (!auth.user) {
      router.replace("/");
    }
  }, [auth.user]);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text style={{ fontSize: 24, marginBottom: 20 }}>Dashboard</Text>
      <Button
        title="Upload the receipt"
        onPress={() => router.push("/UploadReceipt")}
      />
    </View>
  );
}
