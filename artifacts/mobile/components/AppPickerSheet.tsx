import { Feather } from "@expo/vector-icons";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { AppIcon } from "@/components/AppIcon";
import { CyclingGradient } from "@/components/CyclingGradient";
import { PressableScale } from "@/components/PressableScale";
import { useColors } from "@/hooks/useColors";
import { loadInstalledApps } from "@/lib/installedApps";
import { APP_COLORS, APP_ICONS, SUGGESTED_APPS } from "@/lib/mockApps";
import { useStore } from "@/lib/store";
import type { AppItem } from "@/lib/types";

type Props = {
  visible: boolean;
  initial: string[];
  onClose: () => void;
  onSave: (ids: string[]) => void;
};

export function AppPickerSheet({ visible, initial, onClose, onSave }: Props) {
  const colors = useColors();
  const { allApps, addCustomApp } = useStore();
  const [selected, setSelected] = useState<Set<string>>(new Set(initial));
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [colorIdx, setColorIdx] = useState(0);
  const [iconIdx, setIconIdx] = useState(0);
  const [installed, setInstalled] = useState<AppItem[] | null>(null);
  const [loadingInstalled, setLoadingInstalled] = useState(false);

  useEffect(() => {
    if (visible) {
      setSelected(new Set(initial));
      setAdding(false);
      setNewName("");
      // try to load real installed apps if we're in a native build
      if (installed === null && !loadingInstalled) {
        setLoadingInstalled(true);
        loadInstalledApps()
          .then((apps) => setInstalled(apps))
          .finally(() => setLoadingInstalled(false));
      }
    }
  }, [visible, initial]);

  const apps = useMemo(() => {
    // Prefer real installed apps if available + always include user customs
    if (installed && installed.length > 0) {
      const customs = allApps().filter((a) => a.custom);
      return [...customs, ...installed];
    }
    return allApps();
  }, [allApps, installed, visible]);

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleAddCustom = async () => {
    if (newName.trim().length < 1) return;
    const created: AppItem = await addCustomApp(
      newName,
      APP_COLORS[colorIdx],
      APP_ICONS[iconIdx]
    );
    setSelected((prev) => new Set(prev).add(created.id));
    setNewName("");
    setAdding(false);
    setColorIdx((colorIdx + 1) % APP_COLORS.length);
    setIconIdx((iconIdx + 1) % APP_ICONS.length);
  };

  const showNativeNotice =
    Platform.OS !== "android" || (installed === null && !loadingInstalled) ||
    (installed !== null && installed.length === 0);

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
              تطبيقاتي
            </Text>
            <Text style={[styles.sub, { color: colors.mutedForeground }]}>
              {installed && installed.length > 0
                ? `${installed.length} تطبيق من تلفونك — اختر اللي هتحتاجه`
                : "اختر التطبيقات اللي هتحتاجها أو أضف من تلفونك"}
            </Text>
          </View>

          {loadingInstalled ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator color={colors.primary} />
              <Text style={[styles.sub, { color: colors.mutedForeground }]}>
                جاري قراءة تطبيقات تلفونك...
              </Text>
            </View>
          ) : null}

          {showNativeNotice && !loadingInstalled ? (
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
                {Platform.OS === "android"
                  ? "علشان نطلع لك تطبيقات تلفونك الفعلية، التطبيق محتاج يتبني كـ APK كامل وتفعّل صلاحية قائمة التطبيقات"
                  : "في الويب: استخدم زر الإضافة بالأسفل لإدخال أسماء تطبيقاتك يدويًا. على Android حقيقي هتظهر تطبيقات تلفونك تلقائيًا."}
              </Text>
            </View>
          ) : null}

          <FlatList
            data={apps}
            keyExtractor={(item) => item.id}
            numColumns={4}
            ListHeaderComponent={
              <PressableScale
                onPress={() => setAdding(true)}
                style={[
                  styles.addCard,
                  {
                    backgroundColor: colors.primary + "1A",
                    borderColor: colors.primary,
                  },
                ]}
              >
                <Feather name="plus" size={20} color={colors.primary} />
                <Text style={[styles.addText, { color: colors.primary }]}>
                  أضف تطبيق يدويًا
                </Text>
              </PressableScale>
            }
            columnWrapperStyle={{ justifyContent: "space-between", gap: 8 }}
            contentContainerStyle={{ gap: 14, paddingBottom: 12 }}
            renderItem={({ item }) => {
              const isSel = selected.has(item.id);
              return (
                <PressableScale
                  onPress={() => toggle(item.id)}
                  style={styles.appItem}
                >
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
                      {
                        color: isSel
                          ? colors.foreground
                          : colors.mutedForeground,
                      },
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
              style={[
                styles.btn,
                { backgroundColor: colors.secondary, flex: 1 },
              ]}
            >
              <Text style={[styles.btnText, { color: colors.foreground }]}>
                إلغاء
              </Text>
            </PressableScale>
            <PressableScale onPress={() => onSave(Array.from(selected))} style={{ flex: 1.5 }}>
              <CyclingGradient duration={2800} style={styles.btn}>
                <Text style={[styles.btnText, { color: "#1A1306" }]}>
                  حفظ ({selected.size})
                </Text>
              </CyclingGradient>
            </PressableScale>
          </View>
        </View>
      </View>

      {/* Add custom app modal */}
      <Modal
        visible={adding}
        transparent
        animationType="fade"
        onRequestClose={() => setAdding(false)}
      >
        <View style={styles.addBackdrop}>
          <View
            style={[
              styles.addSheet,
              {
                backgroundColor: colors.cardElevated,
                borderColor: colors.border,
              },
            ]}
          >
            <Text style={[styles.title, { color: colors.foreground }]}>
              إضافة تطبيق
            </Text>
            <Text style={[styles.sub, { color: colors.mutedForeground }]}>
              اكتب اسم التطبيق زي ما هو في تلفونك
            </Text>

            <TextInput
              value={newName}
              onChangeText={setNewName}
              placeholder="مثال: ساعتي، يوتيوب، تيك توك..."
              placeholderTextColor={colors.mutedForeground}
              style={[
                styles.input,
                {
                  color: colors.foreground,
                  backgroundColor: colors.background,
                  borderColor: colors.border,
                },
              ]}
              textAlign="right"
              autoFocus
            />

            <View style={styles.previewWrap}>
              <Text style={[styles.label, { color: colors.mutedForeground }]}>
                المعاينة
              </Text>
              <View style={styles.previewRow}>
                <AppIcon
                  app={{
                    id: "_preview",
                    name: newName || "؟",
                    icon: APP_ICONS[iconIdx],
                    color: APP_COLORS[colorIdx],
                  }}
                  size={56}
                />
                <View style={styles.swatchRow}>
                  {APP_COLORS.slice(0, 6).map((c, i) => (
                    <PressableScale
                      key={c}
                      onPress={() => setColorIdx(i)}
                      style={[
                        styles.swatch,
                        {
                          backgroundColor: c,
                          borderColor:
                            colorIdx === i ? colors.foreground : "transparent",
                        },
                      ]}
                    />
                  ))}
                </View>
              </View>
              <View style={styles.iconRow}>
                {APP_ICONS.slice(0, 8).map((icn, i) => (
                  <PressableScale
                    key={icn}
                    onPress={() => setIconIdx(i)}
                    style={[
                      styles.iconBtn,
                      {
                        backgroundColor:
                          iconIdx === i ? colors.primary : colors.secondary,
                      },
                    ]}
                  >
                    <Feather
                      name={icn as keyof typeof Feather.glyphMap}
                      size={16}
                      color={
                        iconIdx === i
                          ? colors.primaryForeground
                          : colors.foreground
                      }
                    />
                  </PressableScale>
                ))}
              </View>
            </View>

            <View style={styles.actions}>
              <PressableScale
                onPress={() => setAdding(false)}
                style={[
                  styles.btn,
                  { backgroundColor: colors.secondary, flex: 1 },
                ]}
              >
                <Text style={[styles.btnText, { color: colors.foreground }]}>
                  إلغاء
                </Text>
              </PressableScale>
              <PressableScale onPress={handleAddCustom} style={{ flex: 1.5 }}>
                <CyclingGradient duration={2800} style={styles.btn}>
                  <Text style={[styles.btnText, { color: "#1A1306" }]}>
                    أضف
                  </Text>
                </CyclingGradient>
              </PressableScale>
            </View>
          </View>
        </View>
      </Modal>
    </Modal>
  );
}

// re-export to keep tree-shaking simple
const _ensure = SUGGESTED_APPS;
void _ensure;

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
  header: { paddingVertical: 8, paddingHorizontal: 6, gap: 4 },
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
  loadingBox: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 10,
    padding: 12,
  },
  notice: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 8,
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
    marginHorizontal: 4,
  },
  noticeText: {
    flex: 1,
    fontSize: 11,
    fontFamily: "Inter_500Medium",
    textAlign: "right",
    lineHeight: 16,
  },
  addCard: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderStyle: "dashed",
    marginBottom: 10,
  },
  addText: { fontFamily: "Inter_700Bold", fontSize: 14 },
  appItem: { width: "23%", alignItems: "center", gap: 6, paddingVertical: 6 },
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
    borderColor: "#0D0904",
  },
  actions: { flexDirection: "row-reverse", gap: 10, marginTop: 12 },
  btn: {
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  btnText: { fontFamily: "Inter_700Bold", fontSize: 15 },

  addBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    paddingHorizontal: 22,
  },
  addSheet: {
    borderRadius: 24,
    padding: 22,
    borderWidth: 1,
    gap: 14,
  },
  input: {
    borderWidth: 1.5,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 16,
    fontFamily: "Inter_500Medium",
  },
  previewWrap: { gap: 8 },
  label: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    textAlign: "right",
  },
  previewRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 14,
    justifyContent: "space-between",
  },
  swatchRow: { flexDirection: "row-reverse", gap: 6, flex: 1 },
  swatch: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
  },
  iconRow: { flexDirection: "row-reverse", gap: 6, flexWrap: "wrap" },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
});
