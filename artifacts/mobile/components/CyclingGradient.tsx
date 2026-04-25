import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect } from "react";
import {
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from "react-native";
import Animated, {
  Easing,
  interpolateColor,
  useAnimatedProps,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

const AnimatedLG = Animated.createAnimatedComponent(LinearGradient);

// 3 cycling color stops — we shift through gold/sun/amber in a continuous loop.
const GOLD_PALETTE = ["#FACC15", "#F59E0B", "#FB923C"];

type Props = {
  colors?: string[];
  duration?: number;
  start?: { x: number; y: number };
  end?: { x: number; y: number };
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
  borderRadius?: number;
};

// A LinearGradient whose 2 color stops continuously cycle through a 3-color
// palette so the surface always feels alive.
export function CyclingGradient({
  colors: palette = GOLD_PALETTE,
  duration = 3500,
  start = { x: 0, y: 0 },
  end = { x: 1, y: 1 },
  style,
  children,
  borderRadius,
}: Props) {
  const t = useSharedValue(0);

  useEffect(() => {
    t.value = withRepeat(
      withTiming(1, { duration, easing: Easing.inOut(Easing.ease) }),
      -1,
      false
    );
  }, [t, duration]);

  const animatedProps = useAnimatedProps(() => {
    const phase = t.value * 3;
    const i = Math.floor(phase) % 3;
    const k = phase - Math.floor(phase);
    const c1 = interpolateColor(
      k,
      [0, 1],
      [palette[i % palette.length], palette[(i + 1) % palette.length]]
    );
    const c2 = interpolateColor(
      k,
      [0, 1],
      [palette[(i + 1) % palette.length], palette[(i + 2) % palette.length]]
    );
    return { colors: [c1, c2] as unknown as string[] };
  });

  return (
    <AnimatedLG
      animatedProps={animatedProps as never}
      colors={palette as unknown as readonly [string, string, ...string[]]}
      start={start}
      end={end}
      style={[
        borderRadius != null ? { borderRadius, overflow: "hidden" } : null,
        style,
      ]}
    >
      <View style={StyleSheet.absoluteFill} pointerEvents="none" />
      {children}
    </AnimatedLG>
  );
}
