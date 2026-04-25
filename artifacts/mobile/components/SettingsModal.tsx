import { Feather } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { CyclingGradient } from "@/components/CyclingGradient";
import { PermissionsSection } from "@/components/PermissionsSection";
import { PressableScale } from "@/components/PressableScale";
import { useColors } from "@/hooks/useColors";
import { useStore } from "@/lib/store";

type Props = {
  visible: boolean;
  onClose: () => void;
};

export function SettingsModal({ visible, onClose }: Props) {
  const colors = useColors();
  const {
    state,
    setPassphrase,
    changePassphrase,
    canChangePassphrase,
  } = useStore();

  const [oldP, setOldP] = useState("");
  const [newP, setNewP] = useState("");
  const [confirmP, setConfirmP] = useState("");
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(
    null
  );

  const hasPassphrase = !!state.passphrase;
  const allowed = canChangePassphrase();

  const handleSetFirst = async () => {
    if (newP.trim().length < 3) {
      setMsg({ type: "err", text: "كلمة قصيرة" });
      return;
    }
    if (newP.trim() !== confirmP.trim()) {
      setMsg({ type: "err", text: "النصان غير متطابقين" });
      return;
    }
    await setPassphrase(newP);
    setMsg({ type: "ok", text: "تم الحفظ" });
    setNewP("");
    setConfirmP("");
  };

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
            {/* Passphrase */}
            <View
              style={[
                styles.card,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
            >
              <View style={styles.cardHeader}>
                <CyclingGradient duration={3500} style={styles.iconCircle}>
                  <Feather name="key" size={18} color="#1A1306" />
                </CyclingGradient>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.cardTitle, { color: colors.foreground }]}>
                    {hasPassphrase
                      ? "تغيير كلمة التأكيد"
                      : "اضبط كلمة التأكيد"}
                  </Text>
                  <Text
                    style={[styles.cardSub, { color: colors.mutedForeground }]}
                  >
                    {hasPassphrase
                      ? "مرة واحدة شهريًا، يوم 1 الساعة 4:00 صباحًا"
                      : "هتكتبها كل مرة تأكد فيها إنجاز مهمة"}
                  </Text>
                </View>
              </View>

              {hasPassphrase ? (
                <>
                  <View
                    style={[
                      styles.statusBox,
                      {
                        backgroundColor: allowed.ok
                          ? colors.success + "15"
                          : colors.warning + "15",
                        borderColor: allowed.ok
                          ? colors.success
                          : colors.warning,
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
                </>
              ) : null}

              <TextInput
                value={newP}
                onChangeText={setNewP}
                placeholder={hasPassphrase ? "الكلمة الجديدة" : "كلمة التأكيد"}
                placeholderTextColor={colors.mutedForeground}
                editable={!hasPassphrase || allowed.ok}
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.background,
                    color: colors.foreground,
                    borderColor: colors.border,
                    opacity: !hasPassphrase || allowed.ok ? 1 : 0.5,
                  },
                ]}
                textAlign="right"
              />
              <TextInput
                value={confirmP}
                onChangeText={setConfirmP}
                placeholder="أعد كتابتها للتأكيد"
                placeholderTextColor={colors.mutedForeground}
                editable={!hasPassphrase || allowed.ok}
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.background,
                    color: colors.foreground,
                    borderColor: colors.border,
                    opacity: !hasPassphrase || allowed.ok ? 1 : 0.5,
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
                onPress={hasPassphrase ? handleChange : handleSetFirst}
                disabled={hasPassphrase && !allowed.ok}
                style={{ width: "100%" }}
              >
                <CyclingGradient
                  duration={hasPassphrase && !allowed.ok ? 99999 : 2800}
                  style={styles.cta}
                  colors={
                    hasPassphrase && !allowed.ok
                      ? [colors.secondary, colors.secondary, colors.secondary]
                      : undefined
                  }
                >
                  <Text
                    style={[
                      styles.ctaText,
                      {
                        color:
                          hasPassphrase && !allowed.ok
                            ? colors.mutedForeground
                            : "#1A1306",
                      },
                    ]}
                  >
                    حفظ
                  </Text>
                </CyclingGradient>
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
                  مهام اليوم
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

            {/* Permissions */}
            <PermissionsSection />
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
    maxHeight: "92%",
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
});
