import { Feather } from "@expo/vector-icons";
import React from "react";
import { Linking, Platform, StyleSheet, Text, View } from "react-native";

import { PressableScale } from "@/components/PressableScale";
import { useColors } from "@/hooks/useColors";
import { useStore } from "@/lib/store";
import type { AppPermissionKey } from "@/lib/types";

type Permission = {
  key: AppPermissionKey;
  title: string;
  description: string;
  icon: keyof typeof Feather.glyphMap;
  intent: string; // android settings intent suffix
};

const PERMISSIONS: Permission[] = [
  {
    key: "overlay",
    title: "النافذة فوق التطبيقات",
    description: "علشان شاشة الحظر تظهر فوق أي تطبيق",
    icon: "layers",
    intent: "android.settings.action.MANAGE_OVERLAY_PERMISSION",
  },
  {
    key: "accessibility",
    title: "خدمة إمكانية الوصول",
    description: "علشان نراقب فتح التطبيقات ونحظر اللي مش مسموح",
    icon: "eye",
    intent: "android.settings.ACCESSIBILITY_SETTINGS",
  },
  {
    key: "usageStats",
    title: "إحصائيات الاستخدام",
    description: "علشان نقفل التطبيقات لما يخلص وقتها",
    icon: "bar-chart-2",
    intent: "android.settings.USAGE_ACCESS_SETTINGS",
  },
  {
    key: "deviceAdmin",
    title: "مدير الجهاز",
    description: "علشان مينفعش حد يلغي تثبيت التطبيق",
    icon: "shield",
    intent: "android.app.action.ADD_DEVICE_ADMIN",
  },
  {
    key: "ignoreBattery",
    title: "تجاهل تحسين البطارية",
    description: "علشان التطبيق يفضل شغّال 24/7",
    icon: "battery-charging",
    intent: "android.settings.REQUEST_IGNORE_BATTERY_OPTIMIZATIONS",
  },
  {
    key: "queryPackages",
    title: "قائمة التطبيقات المثبتة",
    description: "علشان يطلع لك تطبيقات تلفونك في القائمة",
    icon: "list",
    intent: "android.settings.MANAGE_ALL_APPLICATIONS_SETTINGS",
  },
  {
    key: "bootCompleted",
    title: "البدء عند تشغيل الجهاز",
    description: "التطبيق يبدأ تلقائيًا لما الموبايل يقفل ويفتح",
    icon: "power",
    intent: "android.settings.SETTINGS",
  },
  {
    key: "notifications",
    title: "الإشعارات",
    description: "تذكيرات اليوم والتحفيز",
    icon: "bell",
    intent: "android.settings.APP_NOTIFICATION_SETTINGS",
  },
];

export function PermissionsSection() {
  const colors = useColors();
  const { state, setPermission } = useStore();
  const granted = state.permissionsGranted || {};

  const handleOpen = async (perm: Permission) => {
    if (Platform.OS === "android") {
      try {
        const IntentLauncher = await import("expo-intent-launcher");
        await IntentLauncher.startActivityAsync(perm.intent);
      } catch {
        try {
          await Linking.openSettings();
        } catch {}
      }
    } else {
      // Web/iOS preview
      try {
        await Linking.openSettings();
      } catch {}
    }
    // Mark as user-initiated grant — actual enforcement happens natively
    await setPermission(perm.key, true);
  };

  const allGranted = PERMISSIONS.every((p) => granted[p.key]);

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.card, borderColor: colors.border },
      ]}
    >
      <View style={styles.header}>
        <View
          style={[
            styles.iconCircle,
            { backgroundColor: colors.primary },
          ]}
        >
          <Feather name="shield" size={18} color={colors.primaryForeground} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.title, { color: colors.foreground }]}>
            صلاحيات الحماية
          </Text>
          <Text style={[styles.sub, { color: colors.mutedForeground }]}>
            {allGranted
              ? "كل الصلاحيات مفعّلة — التطبيق محمي بالكامل"
              : "فعّل كل صلاحية علشان الحماية تشتغل قوي"}
          </Text>
        </View>
      </View>

      <View
        style={[
          styles.notice,
          {
            backgroundColor: colors.warning + "12",
            borderColor: colors.warning,
          },
        ]}
      >
        <Feather name="info" size={14} color={colors.warning} />
        <Text style={[styles.noticeText, { color: colors.warning }]}>
          الصلاحيات بتشتغل بس على Android حقيقي — مش في معاينة الويب أو Expo Go
        </Text>
      </View>

      <View style={{ gap: 8 }}>
        {PERMISSIONS.map((p) => {
          const isGranted = !!granted[p.key];
          return (
            <PressableScale
              key={p.key}
              onPress={() => handleOpen(p)}
              style={[
                styles.row,
                {
                  backgroundColor: isGranted
                    ? colors.success + "10"
                    : colors.background,
                  borderColor: isGranted ? colors.success : colors.border,
                },
              ]}
            >
              <View
                style={[
                  styles.permIcon,
                  {
                    backgroundColor: isGranted
                      ? colors.success
                      : colors.secondary,
                  },
                ]}
              >
                <Feather
                  name={p.icon}
                  size={16}
                  color={isGranted ? "#FFFFFF" : colors.foreground}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.permTitle, { color: colors.foreground }]}>
                  {p.title}
                </Text>
                <Text
                  style={[styles.permDesc, { color: colors.mutedForeground }]}
                >
                  {p.description}
                </Text>
              </View>
              <View
                style={[
                  styles.chip,
                  {
                    backgroundColor: isGranted
                      ? colors.success
                      : colors.muted,
                  },
                ]}
              >
                {isGranted ? (
                  <Feather name="check" size={12} color="#FFFFFF" />
                ) : (
                  <Text
                    style={{
                      color: colors.foreground,
                      fontSize: 11,
                      fontFamily: "Inter_700Bold",
                    }}
                  >
                    فعّل
                  </Text>
                )}
              </View>
            </PressableScale>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 18, borderWidth: 1, padding: 14, gap: 12 },
  header: { flexDirection: "row-reverse", alignItems: "center", gap: 12 },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  title: { fontSize: 15, fontFamily: "Inter_700Bold", textAlign: "right" },
  sub: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    textAlign: "right",
    marginTop: 2,
  },
  notice: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 8,
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  noticeText: {
    flex: 1,
    fontSize: 11,
    fontFamily: "Inter_500Medium",
    textAlign: "right",
    lineHeight: 16,
  },
  row: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 10,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  permIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  permTitle: {
    fontSize: 13,
    fontFamily: "Inter_700Bold",
    textAlign: "right",
  },
  permDesc: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    textAlign: "right",
    marginTop: 2,
  },
  chip: {
    minWidth: 50,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
});
