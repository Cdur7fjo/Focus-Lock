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
import { SUGGESTED_APPS } from "@/lib/mockApps";
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
  const { allApps } = useStore();
  const [selected, setSelected] = useState<Set<string>>(new Set(initial));
  const [installed, setInstalled] = useState<AppItem[] | null>(null);
  const [loadingInstalled, setLoadingInstalled] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (visible) {
      setSelected(new Set(initial));
      setSearch("");
      if (installed === null && !loadingInstalled) {
        setLoadingInstalled(true);
        loadInstalledApps()
          .then((apps) => setInstalled(apps))
          .finally(() => setLoadingInstalled(false));
      }
    }
  }, [visible, initial]);

  const fromDevice = installed && installed.length > 0;

  const apps = useMemo(() => {
    const list = fromDevice ? installed! : allApps();
    if (!search.trim()) return list;
    const q = search.trim().toLowerCase();
    return list.filter((a) => a.name.toLowerCase().includes(q));
  }, [allApps, installed, fromDevice, search, visible]);

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
              تطبيقاتي
            </Text>
            <Text style={[styles.sub, { color: colors.mutedForeground }]}>
              {fromDevice
                ? `${installed!.length} تطبيق من تلفونك — اختر اللي هتحتاجه`
                : "اختر التطبيقات اللي هتحتاجها — كل اللي عندك في موبايلك"}
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

          {!fromDevice && !loadingInstalled ? (
            <View
              style={[
                styles.notice,
                {
                  backgroundColor: colors.warning + "18",
                  borderColor: colors.warning,
                },
              ]}
            >
              <Feather name="info" size={14} color={colors.warning} />
              <Text style={[styles.noticeText, { color: colors.warning }]}>
                {Platform.OS === "android"
                  ? "علشان نعرض تطبيقات موبايلك الفعلية، التطبيق محتاج يتبني كـ APK كامل وتفعّل صلاحية قائمة التطبيقات. دلوقتي بتختار من قائمة جاهزة."
                  : "في الويب: بتختار من قائمة تطبيقات شائعة. على Android (APK حقيقي) هتظهر تطبيقات موبايلك تلقائيًا — من غير ما تكتب أي اسم."}
              </Text>
            </View>
          ) : null}

          <View
            style={[
              styles.searchBox,
              {
                backgroundColor: colors.cardElevated,
                borderColor: colors.border,
              },
            ]}
          >
            <Feather name="search" size={16} color={colors.mutedForeground} />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="ابحث عن تطبيق..."
              placeholderTextColor={colors.mutedForeground}
              style={[styles.searchInput, { color: colors.foreground }]}
              textAlign="right"
            />
          </View>

          <FlatList
            data={apps}
            keyExtractor={(item) => item.id}
            numColumns={4}
            columnWrapperStyle={{ justifyContent: "flex-start", gap: 8 }}
            contentContainerStyle={{ gap: 14, paddingBottom: 12 }}
            ListEmptyComponent={
              <View style={styles.emptyBox}>
                <Feather name="search" size={28} color={colors.mutedForeground} />
                <Text style={[styles.sub, { color: colors.mutedForeground }]}>
                  مفيش تطبيق بالاسم ده
                </Text>
              </View>
            }
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
    </Modal>
  );
}

// keep tree-shaking happy
const _ensure = SUGGESTED_APPS;
void _ensure;

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(26,12,2,0.68)",
    justifyContent: "flex-end",
  },
  sheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 24,
    maxHeight: "88%",
    borderWidth: 1,
  },
  handle: {
    width: 44,
    height: 5,
    backgroundColor: "rgba(255,221,150,0.35)",
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
    alignItems: "flex-start",
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
  searchBox: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 10,
    marginHorizontal: 4,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    paddingVertical: 0,
  },
  emptyBox: {
    alignItems: "center",
    gap: 10,
    paddingVertical: 40,
  },
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
    borderColor: "#3A2A0E",
  },
  actions: { flexDirection: "row-reverse", gap: 10, marginTop: 12 },
  btn: {
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  btnText: { fontFamily: "Inter_700Bold", fontSize: 15 },
});
