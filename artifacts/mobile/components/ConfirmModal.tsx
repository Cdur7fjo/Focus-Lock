import { Feather } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Modal,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { PressableScale } from "@/components/PressableScale";
import { useColors } from "@/hooks/useColors";

type Props = {
  visible: boolean;
  title: string;
  description?: string;
  expectedPhrase: string;
  onCancel: () => void;
  onConfirm: () => void;
};

export function ConfirmModal({
  visible,
  title,
  description,
  expectedPhrase,
  onCancel,
  onConfirm,
}: Props) {
  const colors = useColors();
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = () => {
    if (value.trim() !== expectedPhrase.trim()) {
      setError("النص غير مطابق. اكتبه بالحروف الصحيحة.");
      return;
    }
    setError(null);
    setValue("");
    onConfirm();
  };

  const handleCancel = () => {
    setValue("");
    setError(null);
    onCancel();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleCancel}
    >
      <View style={styles.backdrop}>
        <View
          style={[
            styles.card,
            {
              backgroundColor: colors.cardElevated,
              borderColor: colors.border,
            },
          ]}
        >
          <View style={[styles.iconCircle, { backgroundColor: colors.primary }]}>
            <Feather name="shield" size={26} color="#FFFFFF" />
          </View>
          <Text style={[styles.title, { color: colors.foreground }]}>{title}</Text>
          {description ? (
            <Text style={[styles.desc, { color: colors.mutedForeground }]}>
              {description}
            </Text>
          ) : null}

          <View
            style={[
              styles.hint,
              { borderColor: colors.border, backgroundColor: colors.background },
            ]}
          >
            <Text style={[styles.hintLabel, { color: colors.mutedForeground }]}>
              اكتب هذا النص بالضبط:
            </Text>
            <Text style={[styles.hintText, { color: colors.accent }]}>
              {expectedPhrase}
            </Text>
          </View>

          <TextInput
            value={value}
            onChangeText={(t) => {
              setValue(t);
              if (error) setError(null);
            }}
            placeholder="اكتب النص هنا"
            placeholderTextColor={colors.mutedForeground}
            style={[
              styles.input,
              {
                color: colors.foreground,
                backgroundColor: colors.background,
                borderColor: error ? colors.destructive : colors.border,
              },
            ]}
            autoFocus
            textAlign="right"
          />

          {error ? (
            <Text style={[styles.error, { color: colors.destructive }]}>
              {error}
            </Text>
          ) : null}

          <View style={styles.actions}>
            <PressableScale
              onPress={handleCancel}
              style={[
                styles.btn,
                { backgroundColor: colors.secondary, flex: 1 },
              ]}
            >
              <Text style={[styles.btnText, { color: colors.foreground }]}>
                إلغاء
              </Text>
            </PressableScale>
            <PressableScale
              onPress={handleConfirm}
              style={[
                styles.btn,
                { backgroundColor: colors.primary, flex: 1.4 },
              ]}
            >
              <Text style={[styles.btnText, { color: "#FFFFFF" }]}>تأكيد</Text>
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
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    paddingHorizontal: 22,
  },
  card: {
    borderRadius: 24,
    padding: 22,
    borderWidth: 1,
    gap: 14,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "flex-end",
  },
  title: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
    textAlign: "right",
  },
  desc: {
    fontSize: 14,
    lineHeight: 22,
    textAlign: "right",
    fontFamily: "Inter_400Regular",
  },
  hint: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
    gap: 6,
  },
  hintLabel: {
    fontSize: 12,
    textAlign: "right",
    fontFamily: "Inter_500Medium",
  },
  hintText: {
    fontSize: 18,
    textAlign: "right",
    fontFamily: "Inter_700Bold",
    letterSpacing: 0.5,
  },
  input: {
    borderWidth: 1.5,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 16,
    fontFamily: "Inter_500Medium",
  },
  error: {
    fontSize: 13,
    textAlign: "right",
    fontFamily: "Inter_500Medium",
  },
  actions: {
    flexDirection: "row-reverse",
    gap: 10,
    marginTop: 4,
  },
  btn: {
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  btnText: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
});
