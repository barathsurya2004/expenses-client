import { Feather as FeatherIcons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';

const TabsLayout = () => {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: 'red',
        tabBarInactiveTintColor: 'black',
        tabBarStyle: {
          backgroundColor: 'yellow',
          borderTopWidth: 0,
          elevation: 0,
        },
      }}
    >
      <Tabs.Screen name="Index" options={{ title: 'Dashboard',
        tabBarIcon: ({ focused, color, size }) => <FeatherIcons name="grid" size={size} color="black" />, 
      }} />
      <Tabs.Screen name="Settings" options={{ title: 'Settings',
        tabBarIcon: ({ focused, color, size }) => <FeatherIcons name="settings" size={size} color="black" />, 
      }} />
    </Tabs>
  );
};

export default TabsLayout;