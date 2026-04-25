import { Feather } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  FlatList,
  Modal,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { AppIcon } from "@/components/AppIcon";
import { PressableScale } from "@/components/PressableScale";
import { useColors } from "@/hooks/useColors";
import { MOCK_APPS } from "@/lib/mockApps";

type Props = {
  visible: boolean;
  initial: string[];
  onClose: () => void;
  onSave: (ids: string[]) => void;
};

export function AppPickerSheet({ visible, initial, onClose, onSave }: Props) {
  const colors = useColors();
  const [selected, setSelected] = useState<Set<string>>(new Set(initial));

  React.useEffect(() => {
    if (visible) setSelected(new Set(initial));
  }, [visible, initial]);

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
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
              اختر التطبيقات
            </Text>
            <Text style={[styles.sub, { color: colors.mutedForeground }]}>
              التطبيقات المختارة هي التي يُسمح باستخدامها أثناء المهمة
            </Text>
          </View>

          <FlatList
            data={MOCK_APPS}
            keyExtractor={(item) => item.id}
            numColumns={4}
            columnWrapperStyle={{ justifyContent: "space-between", gap: 8 }}
            contentContainerStyle={{ gap: 14, paddingBottom: 12 }}
            renderItem={({ item }) => {
              const isSel = selected.has(item.id);
              return (
                <PressableScale onPress={() => toggle(item.id)} style={styles.appItem}>
                  <View style={{ position: "relative" }}>
                    <AppIcon app={item} size={56} dim={!isSel} />
                    {isSel ? (
                      <View
                        style={[
                          styles.check,
                          { backgroundColor: colors.success },
                        ]}
                      >
                        <Feather name="check" size={12} color="#FFFFFF" />
                      </View>
                    ) : null}
                  </View>
                  <Text
                    numberOfLines={1}
                    style={[
                      styles.appName,
                      { color: isSel ? colors.foreground : colors.mutedForeground },
                    ]}
                  >
                    {item.name}
                  </Text>
                </PressableScale>
              );
            }}
          />

          <View style={styles.actions}>
            <PressableScale
              onPress={onClose}
              style={[styles.btn, { backgroundColor: colors.secondary, flex: 1 }]}
            >
              <Text style={[styles.btnText, { color: colors.foreground }]}>
                إلغاء
              </Text>
            </PressableScale>
            <PressableScale
              onPress={() => onSave(Array.from(selected))}
              style={[styles.btn, { backgroundColor: colors.primary, flex: 1.5 }]}
            >
              <Text style={[styles.btnText, { color: "#FFFFFF" }]}>
                حفظ ({selected.size})
              </Text>
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
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-end",
  },
  sheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 24,
    maxHeight: "85%",
    borderWidth: 1,
  },
  handle: {
    width: 44,
    height: 5,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 4,
    alignSelf: "center",
    marginBottom: 12,
  },
  header: {
    paddingVertical: 8,
    paddingHorizontal: 6,
    gap: 4,
  },
  title: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    textAlign: "right",
  },
  sub: {
    fontSize: 13,
    textAlign: "right",
    fontFamily: "Inter_400Regular",
  },
  appItem: {
    width: "23%",
    alignItems: "center",
    gap: 6,
    paddingVertical: 6,
  },
  appName: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    textAlign: "center",
  },
  check: {
    position: "absolute",
    bottom: -4,
    left: -4,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#0B0F1A",
  },
  actions: {
    flexDirection: "row-reverse",
    gap: 10,
    marginTop: 12,
  },
  btn: {
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
  },
  btnText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
  },
});
