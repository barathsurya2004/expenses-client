import { Feather as FeatherIcons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React from "react";

const TabsLayout = () => {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "grey",
        tabBarInactiveTintColor: "black",
        tabBarStyle: {
          display: "flex",
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
          minHeight: 70,
        },
        tabBarLabelStyle: {
          fontSize: 14,
          marginBottom: 5,
        },
      }}
    >
      <Tabs.Screen
        name="Index"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ focused, color, size }) => {
            if (!focused) {
              return <FeatherIcons name="home" size={size} color="black" />;
            } else {
              return <FeatherIcons name="home" size={size} color="grey" />;
            }
          },
        }}
      />
      <Tabs.Screen
        name="Settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ focused, color, size }) => {
            if (!focused) {
              return <FeatherIcons name="settings" size={size} color="black" />;
            } else {
              return <FeatherIcons name="settings" size={size} color="grey" />;
            }
          },
        }}
      />
    </Tabs>
  );
};

export default TabsLayout;
