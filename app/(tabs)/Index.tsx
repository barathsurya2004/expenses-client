import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  Text,
} from "react-native";

import ClickButton from "@/components/Button";
import SpendingHeatmap from "@/components/SpendingHeatmap";
import SpendingTypes from "@/components/SpendingTypes";
import { useAuth } from "@/hooks/AuthContext";
import { Entypo } from "@expo/vector-icons";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

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

  const shrinkAnimation = useRef(new Animated.Value(1)).current;
  const shrink = () => {
    if (!canClick) return; // Prevent animation if not clickable
    Animated.timing(shrinkAnimation, {
      toValue: 0,
      duration: 200, // Increase duration for smoother animation
      useNativeDriver: true, // Ensure native driver is used
    }).start(() => setCanClick(false)); // Ensure state update happens after animation
  };

  const expand = () => {
    if (canClick) return; // Prevent animation if not clickable
    Animated.timing(shrinkAnimation, {
      toValue: 1,
      duration: 200, // Increase duration for smoother animation
      useNativeDriver: true, // Ensure native driver is used
    }).start(() => setCanClick(true)); // Ensure state update happens after animation
  };

  useEffect(() => {
    if (!auth.user) {
      router.replace("/");
    }
  }, [auth.user]);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const currentOffset = event.nativeEvent.contentOffset.y;

    if (currentOffset < 0) {
      scrollOffset.current = 0;
      return;
    }
    const diff = currentOffset - scrollOffset.current;
    if (Math.abs(diff) < 0.2) return; // Ignore small scrolls to prevent flickering

    if (diff > 0) {
      shrink();
    } else if (diff < 0) {
      expand();
    }

    scrollOffset.current = currentOffset;
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView
        style={{
          flex: 1,
          padding: 20,
          backgroundColor: "white",
        }}
        edges={["top"]}
      >
        <ScrollView
          style={{ flex: 1 }}
          onScroll={handleScroll}
          scrollEventThrottle={4}
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
            height: CreateButtonSize.height,
            width: CreateButtonSize.width,
            transform: [
              {
                scale: shrinkAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 1],
                }),
              },
            ],
            borderRadius: CreateButtonSize.borderRadius,
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
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
