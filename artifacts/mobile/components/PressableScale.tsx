import * as Haptics from "expo-haptics";
import React, { useRef } from "react";
import { Animated, Pressable, PressableProps, Platform } from "react-native";

type Props = PressableProps & {
  haptic?: boolean;
  scaleTo?: number;
  children: React.ReactNode;
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function PressableScale({
  haptic = true,
  scaleTo = 0.96,
  onPressIn,
  onPressOut,
  onPress,
  style,
  children,
  ...rest
}: Props) {
  const scale = useRef(new Animated.Value(1)).current;

  const animateTo = (to: number) => {
    Animated.spring(scale, {
      toValue: to,
      useNativeDriver: Platform.OS !== "web",
      damping: 15,
      stiffness: 200,
    }).start();
  };

  return (
    <AnimatedPressable
      {...rest}
      onPressIn={(e) => {
        animateTo(scaleTo);
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        animateTo(1);
        onPressOut?.(e);
      }}
      onPress={(e) => {
        if (haptic && Platform.OS !== "web") {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
        }
        onPress?.(e);
      }}
      style={[{ transform: [{ scale }] }, style as object]}
    >
      {children}
    </AnimatedPressable>
  );
}
