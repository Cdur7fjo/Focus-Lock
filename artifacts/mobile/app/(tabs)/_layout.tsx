import { Feather } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React from "react";
import { Platform, StyleSheet, View } from "react-native";

import { useColors } from "@/hooks/useColors";

export default function TabLayout() {
  const colors = useColors();
  const isWeb = Platform.OS === "web";

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.mutedForeground,
        headerShown: false,
        tabBarLabelStyle: {
          fontFamily: "Inter_600SemiBold",
          fontSize: 11,
        },
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: isWeb ? 84 : 64,
          paddingTop: 6,
          ...(isWeb ? { paddingBottom: 8 } : {}),
        },
        tabBarBackground: () => (
          <View
            style={[StyleSheet.absoluteFill, { backgroundColor: colors.card }]}
          />
        ),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "اليوم",
          tabBarIcon: ({ color }) => (
            <Feather name="check-square" size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="apps"
        options={{
          title: "التطبيقات",
          tabBarIcon: ({ color }) => (
            <Feather name="grid" size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "الإعدادات",
          tabBarIcon: ({ color }) => (
            <Feather name="settings" size={22} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
