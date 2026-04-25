import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { PressableScale } from "@/components/PressableScale";
import { useColors } from "@/hooks/useColors";
import { useStore } from "@/lib/store";

const PERMISSIONS = [
  { key: "BIND_DEVICE_ADMIN", desc: "منع إلغاء التثبيت" },
  { key: "BIND_ACCESSIBILITY_SERVICE", desc: "مراقبة استخدام التطبيقات وحظر الإعدادات" },
  { key: "SYSTEM_ALERT_WINDOW", desc: "عرض شاشة القفل فوق التطبيقات" },
  { key: "PACKAGE_USAGE_STATS", desc: "تتبع وقت كل تطبيق" },
  { key: "RECEIVE_BOOT_COMPLETED", desc: "التشغيل التلقائي بعد إعادة التشغيل" },
  { key: "REQUEST_IGNORE_BATTERY_OPTIMIZATIONS", desc: "العمل على مدار الساعة" },
  { key: "QUERY_ALL_PACKAGES", desc: "قراءة قائمة التطبيقات المثبتة" },
];

export default function SettingsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { state, changePassphrase, canChangePassphrase, resetAll } = useStore();
  const [oldP, setOldP] = useState("");
  const [newP, setNewP] = useState("");
  const [confirmP, setConfirmP] = useState("");
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const allowed = canChangePassphrase();

  const handleChange = async () => {
    if (newP.trim() !== confirmP.trim()) {
      setMsg({ type: "err", text: "النصان الجديدان غير متطابقين" });
      return;
    }
    const res = await changePassphrase(oldP, newP);
    if (!res.ok) {
      setMsg({ type: "err", text: res.reason || "فشل التغيير" });
      return;
    }
    setMsg({ type: "ok", text: "تم تغيير كلمة التأكيد" });
    setOldP("");
    setNewP("");
    setConfirmP("");
  };

  const handleReset = () => {
    if (Platform.OS === "web") {
      const ok = window.confirm("هل أنت متأكد؟ سيتم حذف كل البيانات.");
      if (ok) resetAll();
    } else {
      Alert.alert(
        "إعادة التعيين",
        "سيتم حذف كل المهام وكلمة التأكيد. هل أنت متأكد؟",
        [
          { text: "إلغاء", style: "cancel" },
          {
            text: "حذف الكل",
            style: "destructive",
            onPress: () => resetAll(),
          },
        ]
      );
    }
  };

  const topPad = Platform.OS === "web" ? 67 : insets.top + 12;
  const bottomPad = Platform.OS === "web" ? 110 : 100;

  const taskCount = state.tasks.length;
  const completedAllTime = state.tasks.filter((t) => t.completedAt).length;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: topPad,
          paddingBottom: bottomPad,
          paddingHorizontal: 18,
          gap: 18,
        }}
        keyboardShouldPersistTaps="handled"
      >
        <View>
          <Text style={[styles.label, { color: colors.mutedForeground }]}>
            مركز التحكم
          </Text>
          <Text style={[styles.heading, { color: colors.foreground }]}>
            الإعدادات
          </Text>
        </View>

        <View style={styles.statsRow}>
          <View
            style={[
              styles.statCard,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <Text style={[styles.statNum, { color: colors.primary }]}>
              {taskCount}
            </Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>
              مجموع المهام
            </Text>
          </View>
          <View
            style={[
              styles.statCard,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <Text style={[styles.statNum, { color: colors.success }]}>
              {completedAllTime}
            </Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>
              مكتملة
            </Text>
          </View>
        </View>

        {/* Passphrase change */}
        <View
          style={[
            styles.card,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <View style={styles.cardHeader}>
            <View
              style={[styles.iconCircle, { backgroundColor: colors.primary }]}
            >
              <Feather name="key" size={18} color="#FFFFFF" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.cardTitle, { color: colors.foreground }]}>
                تغيير كلمة التأكيد
              </Text>
              <Text style={[styles.cardSub, { color: colors.mutedForeground }]}>
                مرة واحدة شهريًا، يوم 1 الساعة 4:00 صباحًا فقط
              </Text>
            </View>
          </View>

          <View
            style={[
              styles.statusBox,
              {
                backgroundColor: allowed.ok
                  ? colors.success + "15"
                  : colors.warning + "15",
                borderColor: allowed.ok ? colors.success : colors.warning,
              },
            ]}
          >
            <Feather
              name={allowed.ok ? "check-circle" : "lock"}
              size={14}
              color={allowed.ok ? colors.success : colors.warning}
            />
            <Text
              style={[
                styles.statusText,
                { color: allowed.ok ? colors.success : colors.warning },
              ]}
            >
              {allowed.ok
                ? "النافذة مفتوحة الآن — يمكنك التغيير"
                : allowed.reason}
            </Text>
          </View>

          <TextInput
            value={oldP}
            onChangeText={setOldP}
            placeholder="كلمة التأكيد الحالية"
            placeholderTextColor={colors.mutedForeground}
            editable={allowed.ok}
            style={[
              styles.input,
              {
                backgroundColor: colors.background,
                color: colors.foreground,
                borderColor: colors.border,
                opacity: allowed.ok ? 1 : 0.5,
              },
            ]}
            textAlign="right"
          />
          <TextInput
            value={newP}
            onChangeText={setNewP}
            placeholder="الكلمة الجديدة"
            placeholderTextColor={colors.mutedForeground}
            editable={allowed.ok}
            style={[
              styles.input,
              {
                backgroundColor: colors.background,
                color: colors.foreground,
                borderColor: colors.border,
                opacity: allowed.ok ? 1 : 0.5,
              },
            ]}
            textAlign="right"
          />
          <TextInput
            value={confirmP}
            onChangeText={setConfirmP}
            placeholder="أعد كتابة الكلمة الجديدة"
            placeholderTextColor={colors.mutedForeground}
            editable={allowed.ok}
            style={[
              styles.input,
              {
                backgroundColor: colors.background,
                color: colors.foreground,
                borderColor: colors.border,
                opacity: allowed.ok ? 1 : 0.5,
              },
            ]}
            textAlign="right"
          />

          {msg ? (
            <Text
              style={[
                styles.msg,
                {
                  color: msg.type === "ok" ? colors.success : colors.destructive,
                },
              ]}
            >
              {msg.text}
            </Text>
          ) : null}

          <PressableScale
            onPress={handleChange}
            disabled={!allowed.ok}
            style={[
              styles.cta,
              {
                backgroundColor: allowed.ok ? colors.primary : colors.secondary,
              },
            ]}
          >
            <Text
              style={[
                styles.ctaText,
                {
                  color: allowed.ok ? "#FFFFFF" : colors.mutedForeground,
                },
              ]}
            >
              حفظ الكلمة الجديدة
            </Text>
          </PressableScale>
        </View>

        {/* Permissions card */}
        <LinearGradient
          colors={[colors.gradientA + "33", colors.gradientB + "22"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.card, { borderColor: colors.border }]}
        >
          <View style={styles.cardHeader}>
            <View
              style={[styles.iconCircle, { backgroundColor: colors.accent }]}
            >
              <Feather name="shield" size={18} color={colors.accentForeground} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.cardTitle, { color: colors.foreground }]}>
                صلاحيات الحماية القصوى
              </Text>
              <Text style={[styles.cardSub, { color: colors.mutedForeground }]}>
                الصلاحيات المطلوبة عند تثبيت APK الأصلي على جهازك
              </Text>
            </View>
          </View>

          <View style={{ gap: 10 }}>
            {PERMISSIONS.map((p) => (
              <View
                key={p.key}
                style={[
                  styles.permRow,
                  {
                    backgroundColor: colors.background,
                    borderColor: colors.border,
                  },
                ]}
              >
                <Feather name="check" size={14} color={colors.success} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.permKey, { color: colors.foreground }]}>
                    {p.key}
                  </Text>
                  <Text
                    style={[styles.permDesc, { color: colors.mutedForeground }]}
                  >
                    {p.desc}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </LinearGradient>

        {/* Reset */}
        <PressableScale
          onPress={handleReset}
          style={[
            styles.dangerBtn,
            { backgroundColor: colors.destructive + "1A", borderColor: colors.destructive },
          ]}
        >
          <Feather name="trash-2" size={16} color={colors.destructive} />
          <Text style={[styles.dangerText, { color: colors.destructive }]}>
            إعادة تعيين كل البيانات
          </Text>
        </PressableScale>
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
  statsRow: {
    flexDirection: "row-reverse",
    gap: 10,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: "flex-end",
    gap: 4,
  },
  statNum: {
    fontSize: 32,
    fontFamily: "Inter_700Bold",
  },
  statLabel: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
  },
  card: {
    borderRadius: 22,
    borderWidth: 1,
    padding: 16,
    gap: 12,
  },
  cardHeader: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 12,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  cardTitle: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    textAlign: "right",
  },
  cardSub: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    textAlign: "right",
    marginTop: 2,
  },
  statusBox: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 8,
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  statusText: {
    flex: 1,
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    textAlign: "right",
  },
  input: {
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    fontFamily: "Inter_500Medium",
  },
  msg: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    textAlign: "right",
  },
  cta: {
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
  },
  ctaText: {
    fontSize: 15,
    fontFamily: "Inter_700Bold",
  },
  permRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 10,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  permKey: {
    fontSize: 12,
    fontFamily: "Inter_700Bold",
    textAlign: "right",
  },
  permDesc: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    textAlign: "right",
    marginTop: 2,
  },
  dangerBtn: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  dangerText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
  },
});
