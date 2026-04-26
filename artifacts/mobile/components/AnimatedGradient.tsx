import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect } from "react";
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native";
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

const AnimatedLG = Animated.createAnimatedComponent(LinearGradient);

// Three overlapping gold/yellow/sun layers that drift across each other
const LAYERS: { colors: [string, string, string]; duration: number }[] = [
  { colors: ["#FACC15", "#F59E0B", "#FB923C"], duration: 9000 },
  { colors: ["#FFD166", "#FACC15", "#D4A017"], duration: 12000 },
  { colors: ["#FB923C", "#FCD34D", "#FACC15"], duration: 15000 },
];

type Props = {
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
};

function AnimatedLayer({
  colors,
  duration,
  delay = 0,
}: {
  colors: [string, string, string];
  duration: number;
  delay?: number;
}) {
  const t = useSharedValue(0);

  useEffect(() => {
    t.value = withRepeat(
      withTiming(1, { duration, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, [t, duration]);

  const animatedStyle = useAnimatedStyle(() => {
    const tx = interpolate(t.value, [0, 1], [-60, 60]);
    const ty = interpolate(t.value, [0, 1], [-40, 40]);
    const op = interpolate(t.value, [0, 0.5, 1], [0.6, 0.95, 0.6]);
    return {
      transform: [{ translateX: tx }, { translateY: ty }, { scale: 1.25 }],
      opacity: op,
    };
  });

  return (
    <Animated.View
      style={[StyleSheet.absoluteFill, animatedStyle]}
      pointerEvents="none"
    >
      <LinearGradient
        colors={colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
    </Animated.View>
  );
}

export function AnimatedGradient({ style, children }: Props) {
  return (
    <View style={[{ overflow: "hidden", backgroundColor: "#FACC15" }, style]}>
      {LAYERS.map((l, i) => (
        <AnimatedLayer key={i} colors={l.colors} duration={l.duration} />
      ))}
      {/* Subtle warm overlay to unify */}
      <LinearGradient
        colors={["rgba(251,191,36,0.0)", "rgba(180,120,20,0.25)"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />
      {children}
    </View>
  );
}

// Compact variant used as page background tint
export function GradientBg({ style }: { style?: StyleProp<ViewStyle> }) {
  const t = useSharedValue(0);
  useEffect(() => {
    t.value = withRepeat(
      withTiming(1, { duration: 14000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, [t]);
  const a = useAnimatedStyle(() => ({
    opacity: interpolate(t.value, [0, 0.5, 1], [0.18, 0.32, 0.18]),
    transform: [
      { translateY: interpolate(t.value, [0, 1], [-20, 20]) },
    ],
  }));
  return (
    <AnimatedLG
      colors={["#FACC15", "#F59E0B", "#3A2A0E"] as any}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={[StyleSheet.absoluteFill, a, style]}
      pointerEvents="none"
    />
  );
}
