import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AppIcon } from "@/components/AppIcon";
import { useColors } from "@/hooks/useColors";
import { MOCK_APPS } from "@/lib/mockApps";
import { useStore } from "@/lib/store";

export default function AppsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { isAppUnlocked, allEssentialsDone, essentialsRemaining, state } = useStore();

  const topPad = Platform.OS === "web" ? 67 : insets.top + 12;
  const bottomPad = Platform.OS === "web" ? 110 : 100;

  const allDone = allEssentialsDone();
  const remainingCount = essentialsRemaining().length;
  const totalCount = state.tasks.filter((t) => t.category === "essential").length;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: topPad,
          paddingBottom: bottomPad,
          paddingHorizontal: 18,
          gap: 18,
        }}
      >
        <View>
          <Text style={[styles.label, { color: colors.mutedForeground }]}>
            حالة الجهاز
          </Text>
          <Text style={[styles.heading, { color: colors.foreground }]}>
            التطبيقات
          </Text>
        </View>

        <LinearGradient
          colors={
            allDone && totalCount > 0
              ? [colors.success, colors.accent]
              : [colors.gradientA, colors.gradientC]
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.statusCard}
        >
          <View style={styles.statusIcon}>
            <Feather
              name={allDone && totalCount > 0 ? "unlock" : "lock"}
              size={28}
              color="#FFFFFF"
            />
          </View>
          <View style={{ flex: 1, alignItems: "flex-end" }}>
            <Text style={styles.statusTitle}>
              {totalCount === 0
                ? "لم تضف مهام بعد"
                : allDone
                ? "كل التطبيقات مفتوحة"
                : "وضع التركيز"}
            </Text>
            <Text style={styles.statusSub}>
              {totalCount === 0
                ? "أضف مهمة لتفعيل النظام"
                : allDone
                ? "أحسنت! استمتع بوقتك"
                : `أنجز ${remainingCount} مهام ضرورية لفتح كل شيء`}
            </Text>
          </View>
        </LinearGradient>

        <View style={styles.gridSection}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
            كل التطبيقات
          </Text>
          <View style={styles.grid}>
            {MOCK_APPS.map((app) => {
              const unlocked = isAppUnlocked(app.id);
              return (
                <View key={app.id} style={styles.appCell}>
                  <View>
                    <AppIcon app={app} size={64} dim={!unlocked} />
                    {!unlocked ? (
                      <View
                        style={[
                          styles.lockBadge,
                          { backgroundColor: colors.background },
                        ]}
                      >
                        <Feather name="lock" size={11} color={colors.foreground} />
                      </View>
                    ) : null}
                  </View>
                  <Text
                    numberOfLines={1}
                    style={[
                      styles.appName,
                      {
                        color: unlocked ? colors.foreground : colors.mutedForeground,
                      },
                    ]}
                  >
                    {app.name}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    textAlign: "right",
  },
  heading: {
    fontSize: 30,
    fontFamily: "Inter_700Bold",
    textAlign: "right",
  },
  statusCard: {
    borderRadius: 22,
    padding: 18,
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 14,
  },
  statusIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  statusTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontFamily: "Inter_700Bold",
    textAlign: "right",
  },
  statusSub: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    textAlign: "right",
    marginTop: 4,
  },
  gridSection: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    textAlign: "right",
    paddingHorizontal: 4,
  },
  grid: {
    flexDirection: "row-reverse",
    flexWrap: "wrap",
    gap: 12,
    justifyContent: "flex-start",
  },
  appCell: {
    width: "22%",
    alignItems: "center",
    gap: 8,
    paddingVertical: 8,
  },
  appName: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    textAlign: "center",
  },
  lockBadge: {
    position: "absolute",
    bottom: -4,
    left: -4,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "#222B45",
  },
});
