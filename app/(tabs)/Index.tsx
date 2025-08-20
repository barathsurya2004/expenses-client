import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  Text,
  View,
} from "react-native";

import ClickButton from "@/components/Button";
import SpendingHeatmap from "@/components/SpendingHeatmap";
import SpendingTypes from "@/components/SpendingTypes";
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
  const [canClick, setCanClick] = useState(false);
  const [CreateButtonSize, setCreateButtonSize] = useState({
    width: 60,
    height: 60,
    borderRadius: 30,
  });
  const scrollOffset = useRef(0);

  const shrinkAnimation = useRef(new Animated.Value(0)).current;
  const shrink = () => {
    Animated.timing(shrinkAnimation, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
    setCanClick(false);
  };

  const expand = () => {
    Animated.timing(shrinkAnimation, {
      toValue: 1,
      duration: 200,
      useNativeDriver: false,
    }).start();
    setCanClick(true);
  };

  useEffect(() => {
    if (!auth.user) {
      router.replace("/");
    }
  }, [auth.user]);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const currentOffset = event.nativeEvent.contentOffset.y * 50;
    let diff = currentOffset - scrollOffset.current;
    if (diff < 0) {
      diff += 2;
    }
    console.log("Scroll Difference:", diff);
    if (diff < 0) {
      expand();
    } else if (diff > 0) {
      shrink();
    }
    console.log(shrinkAnimation);
    scrollOffset.current = currentOffset;
  };

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "white",
        padding: 20,
      }}
    >
      <ScrollView
        style={{ flex: 1 }}
        onScroll={handleScroll}
        scrollEventThrottle={8} // Optimize scroll event handling
      >
        <Text
          style={{
            fontSize: 24,
            color: "black",
          }}
        >
          Spending Overview
        </Text>
        <SpendingHeatmap />
        <SpendingTypes />
      </ScrollView>
      <Animated.View
        style={{
          position: "absolute",
          bottom: 10,
          right: 10,
          height: shrinkAnimation.interpolate({
            inputRange: [0, 1],
            outputRange: [0, CreateButtonSize.height],
          }),
          width: shrinkAnimation.interpolate({
            inputRange: [0, 1],
            outputRange: [0, CreateButtonSize.width],
          }),
          borderRadius: shrinkAnimation.interpolate({
            inputRange: [0, 1],
            outputRange: [0, CreateButtonSize.borderRadius],
          }),
          backgroundColor: "#0d78f2",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ClickButton
          title="new-expense"
          onPress={() => {
            if (!canClick) return;
            router.push("/UploadReceipt");
          }}
          style={{}}
        >
          <Entypo name={"plus"} size={20} color={"white"} />
        </ClickButton>
      </Animated.View>
    </View>
  );
}
