import { Feather } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, View } from "react-native";

import type { AppItem } from "@/lib/types";

type Props = {
  app: AppItem;
  size?: number;
  dim?: boolean;
};

export function AppIcon({ app, size = 56, dim = false }: Props) {
  const inner = Math.round(size * 0.5);
  return (
    <View
      style={[
        styles.box,
        {
          width: size,
          height: size,
          borderRadius: Math.round(size * 0.28),
          backgroundColor: app.color,
          opacity: dim ? 0.35 : 1,
        },
      ]}
    >
      <Feather
        name={app.icon as keyof typeof Feather.glyphMap}
        size={inner}
        color="#FFFFFF"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 4,
  },
});
