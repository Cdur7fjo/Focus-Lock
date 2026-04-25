import { Feather } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";

import { CyclingGradient } from "@/components/CyclingGradient";
import { useStore } from "@/lib/store";

const REQUIRED_KEYS = [
  "overlay",
  "accessibility",
  "usageStats",
  "deviceAdmin",
  "ignoreBattery",
  "queryPackages",
  "bootCompleted",
  "notifications",
] as const;

export function GuardStatusCard() {
  const { state } = useStore();
  const [, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const granted = state.permissionsGranted || {};
  const grantedCount = REQUIRED_KEYS.filter((k) => granted[k]).length;
  const total = REQUIRED_KEYS.length;
  const fullyGuarded = grantedCount === total;

  const pulse = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 1200,
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  const dotStyle = {
    opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1] }),
    transform: [
      {
        scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.85, 1.15] }),
      },
    ],
  };

  const now = new Date();
  const time = now.toLocaleTimeString("ar-EG", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  return (
    <CyclingGradient duration={5000} style={styles.card}>
      <View style={styles.row}>
        <View style={styles.shieldWrap}>
          <Feather name="shield" size={28} color="#1A1306" />
          <Animated.View
            style={[
              styles.statusDot,
              {
                backgroundColor: fullyGuarded ? "#16A34A" : "#F59E0B",
              },
              dotStyle,
            ]}
          />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>
            {fullyGuarded ? "النظام يقظ ومحمي" : "الحماية ناقصة"}
          </Text>
          <Text style={styles.sub}>
            {fullyGuarded
              ? "كل الصلاحيات مفعّلة — مينفعش حد يلغيها"
              : `${grantedCount} من ${total} صلاحيات مفعّلة`}
          </Text>
        </View>
      </View>

      <View style={styles.statRow}>
        <View style={styles.stat}>
          <Feather name="zap" size={13} color="#1A1306" />
          <Text style={styles.statText}>صاحي 24/7</Text>
        </View>
        <View style={styles.stat}>
          <Feather name="lock" size={13} color="#1A1306" />
          <Text style={styles.statText}>ضد الإلغاء</Text>
        </View>
        <View style={styles.stat}>
          <Feather name="clock" size={13} color="#1A1306" />
          <Text style={styles.statText}>{time}</Text>
        </View>
      </View>

      {!fullyGuarded ? (
        <View style={styles.warnBox}>
          <Feather name="alert-triangle" size={13} color="#1A1306" />
          <Text style={styles.warnText}>
            فعّل الصلاحيات الناقصة في الأسفل علشان النظام يقفل ضد أي محاولة
            إلغاء
          </Text>
        </View>
      ) : null}
    </CyclingGradient>
  );
}

const styles = StyleSheet.create({
  card: { padding: 16, borderRadius: 18, gap: 12, overflow: "hidden" },
  row: { flexDirection: "row-reverse", alignItems: "center", gap: 12 },
  shieldWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.45)",
    alignItems: "center",
    justifyContent: "center",
  },
  statusDot: {
    position: "absolute",
    top: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#FFE9B0",
  },
  title: {
    color: "#1A1306",
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    textAlign: "right",
  },
  sub: {
    color: "rgba(26,19,6,0.85)",
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    textAlign: "right",
    marginTop: 2,
  },
  statRow: { flexDirection: "row-reverse", gap: 8 },
  stat: {
    flex: 1,
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    backgroundColor: "rgba(255,255,255,0.4)",
    paddingVertical: 8,
    borderRadius: 10,
  },
  statText: {
    color: "#1A1306",
    fontFamily: "Inter_700Bold",
    fontSize: 11,
  },
  warnBox: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(255,255,255,0.5)",
    padding: 10,
    borderRadius: 10,
  },
  warnText: {
    flex: 1,
    color: "#1A1306",
    fontFamily: "Inter_500Medium",
    fontSize: 11,
    textAlign: "right",
    lineHeight: 16,
  },
});
