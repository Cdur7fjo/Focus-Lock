import { Feather } from "@expo/vector-icons";
import React from "react";
import { Modal, ScrollView, StyleSheet, Text, View } from "react-native";

import { AddTaskForm } from "@/components/AddTaskForm";
import { CyclingGradient } from "@/components/CyclingGradient";
import { useColors } from "@/hooks/useColors";
import { useStore } from "@/lib/store";

type Props = {
  visible: boolean;
  onClose: () => void;
};

// Mandatory nightly-plan modal that shows after 9 PM (21:00) the first time
// the user opens the app each evening. They MUST add at least one essential
// task for tomorrow before they can dismiss it. On native APK with
// SYSTEM_ALERT_WINDOW, this surface would also be projected over other apps
// via the accessibility service.
export function DailyPlanModal({ visible, onClose }: Props) {
  const colors = useColors();
  const { state, markDailyPlanShown } = useStore();

  const todaysEssentials = state.tasks.filter(
    (t) => t.category === "essential" && !t.completedAt
  );
  const todaysOptional = state.tasks.filter(
    (t) => t.category === "optional" && !t.completedAt
  );
  const canClose = todaysEssentials.length > 0;

  const handleDismiss = async () => {
    if (!canClose) return;
    await markDailyPlanShown();
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <CyclingGradient
          duration={4000}
          style={styles.banner}
        >
          <View style={styles.bannerInner}>
            <Feather name="moon" size={32} color="#1A1306" />
            <View style={{ flex: 1 }}>
              <Text style={styles.bannerTitle}>مساء الخير 🌙</Text>
              <Text style={styles.bannerSub}>
                خطّط مهامك لبكرة قبل ما تنام
              </Text>
            </View>
          </View>
        </CyclingGradient>

        <ScrollView
          contentContainerStyle={{ padding: 18, gap: 14, paddingBottom: 40 }}
          keyboardShouldPersistTaps="handled"
        >
          <View
            style={[
              styles.statusCard,
              {
                backgroundColor: canClose
                  ? colors.success + "15"
                  : colors.warning + "15",
                borderColor: canClose ? colors.success : colors.warning,
              },
            ]}
          >
            <Feather
              name={canClose ? "check-circle" : "alert-circle"}
              size={20}
              color={canClose ? colors.success : colors.warning}
            />
            <View style={{ flex: 1 }}>
              <Text
                style={[
                  styles.statusTitle,
                  { color: canClose ? colors.success : colors.warning },
                ]}
              >
                {canClose
                  ? `جاهز لبكرة! عندك ${todaysEssentials.length} ضرورية ${
                      todaysOptional.length
                        ? `و ${todaysOptional.length} اختيارية`
                        : ""
                    }`
                  : "أضف على الأقل مهمة ضرورية واحدة لبكرة"}
              </Text>
              <Text
                style={[
                  styles.statusSub,
                  {
                    color: canClose
                      ? colors.success
                      : colors.warning,
                    opacity: 0.8,
                  },
                ]}
              >
                {canClose
                  ? "تقدر تقفل النافذة وترتاح"
                  : "اختياري كمان لو حاب"}
              </Text>
            </View>
          </View>

          <AddTaskForm
            onCancel={() => {
              /* no cancel from daily plan */
            }}
            hideCancel
            onSaved={() => {
              /* keep open; user can add more or dismiss */
            }}
          />

          <View style={{ flexDirection: "row-reverse", gap: 10 }}>
            <CyclingGradient
              duration={3000}
              style={[
                styles.btn,
                { flex: 1, opacity: canClose ? 1 : 0.4 },
              ]}
            >
              <Text
                onPress={handleDismiss}
                style={{
                  color: "#1A1306",
                  fontFamily: "Inter_700Bold",
                  fontSize: 15,
                  textAlign: "center",
                  paddingVertical: 14,
                  paddingHorizontal: 16,
                }}
              >
                {canClose ? "تمام، تصبح على خير" : "أضف ضرورية لبكرة أولًا"}
              </Text>
            </CyclingGradient>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  banner: { paddingTop: 60, paddingBottom: 22, paddingHorizontal: 20 },
  bannerInner: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 14,
  },
  bannerTitle: {
    color: "#1A1306",
    fontFamily: "Inter_700Bold",
    fontSize: 22,
    textAlign: "right",
  },
  bannerSub: {
    color: "rgba(26,19,6,0.85)",
    fontFamily: "Inter_500Medium",
    fontSize: 13,
    textAlign: "right",
    marginTop: 2,
  },
  statusCard: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
  },
  statusTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 14,
    textAlign: "right",
  },
  statusSub: {
    fontFamily: "Inter_500Medium",
    fontSize: 12,
    textAlign: "right",
    marginTop: 2,
  },
  btn: { borderRadius: 16, overflow: "hidden" },
});
