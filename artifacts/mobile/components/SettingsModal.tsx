import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import {
  Alert,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { PressableScale } from "@/components/PressableScale";
import { useColors } from "@/hooks/useColors";
import { useStore } from "@/lib/store";

type Props = {
  visible: boolean;
  onClose: () => void;
};

export function SettingsModal({ visible, onClose }: Props) {
  const colors = useColors();
  const { state, changePassphrase, canChangePassphrase, resetAll } = useStore();
  const [oldP, setOldP] = useState("");
  const [newP, setNewP] = useState("");
  const [confirmP, setConfirmP] = useState("");
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(
    null
  );

  const allowed = canChangePassphrase();

  const handleChange = async () => {
    if (newP.trim() !== confirmP.trim()) {
      setMsg({ type: "err", text: "النصان غير متطابقين" });
      return;
    }
    const res = await changePassphrase(oldP, newP);
    if (!res.ok) {
      setMsg({ type: "err", text: res.reason || "فشل التغيير" });
      return;
    }
    setMsg({ type: "ok", text: "تم التغيير" });
    setOldP("");
    setNewP("");
    setConfirmP("");
  };

  const handleReset = () => {
    if (Platform.OS === "web") {
      const ok = window.confirm("هل أنت متأكد؟ سيتم حذف كل البيانات.");
      if (ok) {
        resetAll();
        onClose();
      }
    } else {
      Alert.alert("إعادة التعيين", "سيتم حذف كل المهام والبيانات", [
        { text: "إلغاء", style: "cancel" },
        {
          text: "حذف الكل",
          style: "destructive",
          onPress: async () => {
            await resetAll();
            onClose();
          },
        },
      ]);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <View
          style={[
            styles.sheet,
            { backgroundColor: colors.background, borderColor: colors.border },
          ]}
        >
          <View style={styles.handle} />
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.foreground }]}>
              الإعدادات
            </Text>
            <PressableScale
              onPress={onClose}
              style={[styles.closeBtn, { backgroundColor: colors.secondary }]}
            >
              <Feather name="x" size={18} color={colors.foreground} />
            </PressableScale>
          </View>

          <ScrollView
            contentContainerStyle={{ padding: 16, gap: 16, paddingBottom: 30 }}
            keyboardShouldPersistTaps="handled"
          >
            {/* Passphrase change */}
            <View
              style={[
                styles.card,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
            >
              <View style={styles.cardHeader}>
                <LinearGradient
                  colors={[colors.gradientA, colors.gradientB]}
                  style={styles.iconCircle}
                >
                  <Feather name="key" size={18} color={colors.primaryForeground} />
                </LinearGradient>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.cardTitle, { color: colors.foreground }]}>
                    تغيير كلمة التأكيد
                  </Text>
                  <Text
                    style={[styles.cardSub, { color: colors.mutedForeground }]}
                  >
                    مرة واحدة شهريًا، يوم 1 الساعة 4:00 صباحًا
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
                    {
                      color: allowed.ok ? colors.success : colors.warning,
                    },
                  ]}
                >
                  {allowed.ok ? "النافذة مفتوحة الآن" : allowed.reason}
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
                  style={{
                    color:
                      msg.type === "ok" ? colors.success : colors.destructive,
                    textAlign: "right",
                    fontFamily: "Inter_500Medium",
                    fontSize: 13,
                  }}
                >
                  {msg.text}
                </Text>
              ) : null}

              <PressableScale
                onPress={handleChange}
                disabled={!allowed.ok}
                style={{ width: "100%" }}
              >
                <LinearGradient
                  colors={
                    allowed.ok
                      ? [colors.gradientA, colors.gradientB]
                      : [colors.secondary, colors.secondary]
                  }
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.cta}
                >
                  <Text
                    style={[
                      styles.ctaText,
                      {
                        color: allowed.ok
                          ? colors.primaryForeground
                          : colors.mutedForeground,
                      },
                    ]}
                  >
                    حفظ
                  </Text>
                </LinearGradient>
              </PressableScale>
            </View>

            {/* Stats */}
            <View style={styles.statsRow}>
              <View
                style={[
                  styles.stat,
                  { backgroundColor: colors.card, borderColor: colors.border },
                ]}
              >
                <Text style={[styles.statNum, { color: colors.primary }]}>
                  {state.tasks.length}
                </Text>
                <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>
                  مجموع المهام
                </Text>
              </View>
              <View
                style={[
                  styles.stat,
                  { backgroundColor: colors.card, borderColor: colors.border },
                ]}
              >
                <Text style={[styles.statNum, { color: colors.success }]}>
                  {state.tasks.filter((t) => t.completedAt).length}
                </Text>
                <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>
                  مكتملة
                </Text>
              </View>
              <View
                style={[
                  styles.stat,
                  { backgroundColor: colors.card, borderColor: colors.border },
                ]}
              >
                <Text style={[styles.statNum, { color: colors.accent }]}>
                  {state.customApps.length}
                </Text>
                <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>
                  تطبيقاتي
                </Text>
              </View>
            </View>

            {/* Reset */}
            <PressableScale
              onPress={handleReset}
              style={[
                styles.dangerBtn,
                {
                  backgroundColor: colors.destructive + "1A",
                  borderColor: colors.destructive,
                },
              ]}
            >
              <Feather name="trash-2" size={16} color={colors.destructive} />
              <Text style={[styles.dangerText, { color: colors.destructive }]}>
                إعادة تعيين كل البيانات
              </Text>
            </PressableScale>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "flex-end",
  },
  sheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: "90%",
    borderWidth: 1,
  },
  handle: {
    width: 44,
    height: 5,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 4,
    alignSelf: "center",
    marginTop: 8,
  },
  header: {
    flexDirection: "row-reverse",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  title: {
    flex: 1,
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    textAlign: "right",
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  card: { borderRadius: 18, borderWidth: 1, padding: 14, gap: 10 },
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
    fontSize: 15,
    fontFamily: "Inter_700Bold",
    textAlign: "right",
  },
  cardSub: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    textAlign: "right",
    marginTop: 2,
  },
  statusBox: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 8,
    padding: 10,
    borderRadius: 10,
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
  cta: {
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: "center",
  },
  ctaText: { fontSize: 14, fontFamily: "Inter_700Bold" },
  statsRow: { flexDirection: "row-reverse", gap: 8 },
  stat: {
    flex: 1,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    gap: 4,
  },
  statNum: { fontSize: 24, fontFamily: "Inter_700Bold" },
  statLabel: { fontSize: 11, fontFamily: "Inter_500Medium" },
  dangerBtn: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 13,
    borderRadius: 12,
    borderWidth: 1,
  },
  dangerText: { fontFamily: "Inter_700Bold", fontSize: 13 },
});
