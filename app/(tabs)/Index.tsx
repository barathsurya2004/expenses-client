import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Text, View } from "react-native";

import ClickButton from "@/components/Button";
import { Styles } from "@/components/Styles";
import { useAuth } from "@/hooks/AuthContext";
import { Entypo } from "@expo/vector-icons";

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
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "white",
      }}
    >
      <Text style={{ fontSize: 24, marginBottom: 20 }}>Dashboard</Text>
      <ClickButton
        title="new-expense"
        onPress={() => {
          router.push("/UploadReceipt");
        }}
        style={Styles.newExpense}
      >
        <Entypo name={"plus"} size={40} color={"white"} />
      </ClickButton>
    </View>
  );
}
