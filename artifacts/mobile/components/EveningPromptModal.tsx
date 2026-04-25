import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useMemo } from "react";
import { Modal, StyleSheet, Text, View } from "react-native";

import { CyclingGradient } from "@/components/CyclingGradient";
import { PressableScale } from "@/components/PressableScale";
import { useColors } from "@/hooks/useColors";

const QUOTES = [
  "أحسنت اليوم! 🌟 تضيف مهمة كمان وتشعر بفخر أكتر؟",
  "إنجاز جميل! 💪 خليك بطل النهاردة بمهمة إضافية",
  "ممتاز! ✨ اللي عمل اللي عليه يقدر يكسب أكتر",
  "بطل! 🏆 المساء فرصتك لتلمع أكتر — أضف مهمة جديدة",
  "أنت ملتزم! 🔥 المهام المسائية بتفرق فرق كبير",
];

type Props = {
  visible: boolean;
  onAddMore: () => void;
  onSkip: () => void;
};

export function EveningPromptModal({ visible, onAddMore, onSkip }: Props) {
  const colors = useColors();
  const quote = useMemo(
    () => QUOTES[Math.floor(Math.random() * QUOTES.length)],
    [visible]
  );

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.backdrop}>
        <View
          style={[
            styles.card,
            { backgroundColor: colors.cardElevated, borderColor: colors.primary },
          ]}
        >
          <CyclingGradient
            duration={3000}
            style={styles.iconWrap}
          >
            <Feather name="award" size={32} color="#1A1306" />
          </CyclingGradient>

          <Text style={[styles.title, { color: colors.foreground }]}>
            خلصت كل مهامك ✨
          </Text>
          <Text style={[styles.quote, { color: colors.mutedForeground }]}>
            {quote}
          </Text>

          <View style={styles.actions}>
            <PressableScale
              onPress={onSkip}
              style={[styles.btn, { backgroundColor: colors.secondary, flex: 1 }]}
            >
              <Text style={[styles.btnText, { color: colors.foreground }]}>
                يكفي اليوم
              </Text>
            </PressableScale>
            <PressableScale onPress={onAddMore} style={{ flex: 1.4 }}>
              <CyclingGradient duration={3000} style={styles.btnPrimary}>
                <Feather name="plus-circle" size={16} color="#1A1306" />
                <Text style={[styles.btnText, { color: "#1A1306" }]}>
                  أضف مهمة
                </Text>
              </CyclingGradient>
            </PressableScale>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.75)",
    justifyContent: "center",
    paddingHorizontal: 22,
  },
  card: {
    borderRadius: 24,
    borderWidth: 1.5,
    padding: 24,
    alignItems: "center",
    gap: 12,
  },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  title: { fontSize: 22, fontFamily: "Inter_700Bold", textAlign: "center" },
  quote: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 8,
  },
  actions: {
    flexDirection: "row-reverse",
    gap: 10,
    width: "100%",
    marginTop: 4,
  },
  btn: {
    paddingVertical: 13,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  btnPrimary: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 13,
    borderRadius: 14,
  },
  btnText: { fontFamily: "Inter_700Bold", fontSize: 14 },
});
