import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useState } from "react";
import {
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from "react-native";

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

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  const n = parseInt(h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function lerp(a: number, b: number, t: number) {
  return Math.round(a + (b - a) * t);
}

function lerpColor(c1: string, c2: string, t: number): string {
  const [r1, g1, b1] = hexToRgb(c1);
  const [r2, g2, b2] = hexToRgb(c2);
  return `rgb(${lerp(r1, r2, t)}, ${lerp(g1, g2, t)}, ${lerp(b1, b2, t)})`;
}

// A LinearGradient whose 2 color stops continuously cycle through a 3-color
// palette so the surface always feels alive. Uses setState-driven animation
// (reliable on web) instead of reanimated worklets which are flaky with
// LinearGradient's color prop on web.
export function CyclingGradient({
  colors: palette = GOLD_PALETTE,
  duration = 3500,
  start = { x: 0, y: 0 },
  end = { x: 1, y: 1 },
  style,
  children,
  borderRadius,
}: Props) {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const startedAt = Date.now();
    const id = setInterval(() => {
      const elapsed = (Date.now() - startedAt) % duration;
      setPhase(elapsed / duration);
    }, 80);
    return () => clearInterval(id);
  }, [duration]);

  const total = phase * palette.length;
  const i = Math.floor(total) % palette.length;
  const k = total - Math.floor(total);
  const c1 = lerpColor(
    palette[i % palette.length],
    palette[(i + 1) % palette.length],
    k
  );
  const c2 = lerpColor(
    palette[(i + 1) % palette.length],
    palette[(i + 2) % palette.length],
    k
  );

  return (
    <LinearGradient
      colors={[c1, c2] as unknown as readonly [string, string, ...string[]]}
      start={start}
      end={end}
      style={[
        borderRadius != null ? { borderRadius, overflow: "hidden" } : null,
        style,
      ]}
    >
      <View style={StyleSheet.absoluteFill} pointerEvents="none" />
      {children}
    </LinearGradient>
  );
}

