import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useState } from "react";
import { StyleProp, ViewStyle } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  Easing,
} from "react-native-reanimated";

const AnimatedLG = Animated.createAnimatedComponent(LinearGradient);

const PALETTES: [string, string, string][] = [
  ["#7C5CFF", "#22D3EE", "#F472B6"],
  ["#F472B6", "#7C5CFF", "#22D3EE"],
  ["#22D3EE", "#F472B6", "#7C5CFF"],
  ["#FB7185", "#A78BFA", "#22D3EE"],
];

type Props = {
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
  intervalMs?: number;
};

export function AnimatedGradient({ style, children, intervalMs = 7000 }: Props) {
  const [palette, setPalette] = useState(0);
  const opacity = useSharedValue(1);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(0.85, { duration: 2400, easing: Easing.inOut(Easing.quad) }),
      -1,
      true
    );
    const id = setInterval(() => {
      setPalette((p) => (p + 1) % PALETTES.length);
    }, intervalMs);
    return () => clearInterval(id);
  }, [opacity, intervalMs]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <AnimatedLG
      colors={PALETTES[palette]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[style, animatedStyle]}
    >
      {children}
    </AnimatedLG>
  );
}
