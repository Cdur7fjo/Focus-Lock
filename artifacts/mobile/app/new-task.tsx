import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AppIcon } from "@/components/AppIcon";
import { AppPickerSheet } from "@/components/AppPickerSheet";
import { PressableScale } from "@/components/PressableScale";
import { useColors } from "@/hooks/useColors";
import { getAppById } from "@/lib/mockApps";
import { useStore } from "@/lib/store";
import type { RepeatMode } from "@/lib/types";

const DURATION_PRESETS = [15, 30, 45, 60, 90, 120];

export default function NewTaskScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { addTask } = useStore();

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<"essential" | "optional">("essential");
  const [appIds, setAppIds] = useState<string[]>([]);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [hasTimer, setHasTimer] = useState(false);
  const [duration, setDuration] = useState<number>(30);
  const [customDuration, setCustomDuration] = useState("");
  const [repeatMode, setRepeatMode] = useState<RepeatMode>("none");
  const [days, setDays] = useState("3");
  const [error, setError] = useState<string | null>(null);

  const topPad = Platform.OS === "web" ? 24 : insets.top + 8;
  const bottomPad = Platform.OS === "web" ? 60 : insets.bottom + 24;

  const handleSave = async () => {
    if (title.trim().length < 2) {
      setError("اكتب عنوان المهمة");
      return;
    }
    let dur: number | null = null;
    if (hasTimer) {
      const fromCustom = parseInt(customDuration, 10);
      dur = !isNaN(fromCustom) && fromCustom > 0 ? fromCustom : duration;
    }
    let dayCount = 0;
    if (repeatMode === "days") {
      const d = parseInt(days, 10);
      if (isNaN(d) || d < 1) {
        setError("أدخل عدد أيام صحيح");
        return;
      }
      dayCount = d;
    }
    await addTask({
      title,
      category,
      appIds,
      durationMinutes: dur,
      repeatMode,
      daysCount: dayCount,
    });
    router.back();
  };

  const selectedApps = appIds.map(getAppById).filter(Boolean).slice(0, 6);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Top bar */}
      <View
        style={[
          styles.topBar,
          {
            paddingTop: topPad,
            backgroundColor: colors.background,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <PressableScale
          onPress={() => router.back()}
          style={[styles.iconBtn, { backgroundColor: colors.secondary }]}
        >
          <Feather name="x" size={20} color={colors.foreground} />
        </PressableScale>
        <Text style={[styles.topTitle, { color: colors.foreground }]}>
          مهمة جديدة
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={{
          padding: 18,
          paddingBottom: bottomPad + 80,
          gap: 18,
        }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Title */}
        <View style={{ gap: 8 }}>
          <Text style={[styles.label, { color: colors.mutedForeground }]}>
            عنوان المهمة
          </Text>
          <TextInput
            value={title}
            onChangeText={(t) => {
              setTitle(t);
              if (error) setError(null);
            }}
            placeholder="مثال: مذاكرة الرياضيات"
            placeholderTextColor={colors.mutedForeground}
            style={[
              styles.input,
              {
                backgroundColor: colors.card,
                color: colors.foreground,
                borderColor: error ? colors.destructive : colors.border,
              },
            ]}
            textAlign="right"
          />
        </View>

        {/* Category */}
        <View style={{ gap: 8 }}>
          <Text style={[styles.label, { color: colors.mutedForeground }]}>
            نوع المهمة
          </Text>
          <View style={styles.toggleRow}>
            {(["essential", "optional"] as const).map((c) => {
              const active = category === c;
              return (
                <PressableScale
                  key={c}
                  onPress={() => setCategory(c)}
                  style={[
                    styles.toggleBtn,
                    {
                      backgroundColor: active
                        ? c === "essential"
                          ? colors.primary
                          : colors.accent
                        : colors.card,
                      borderColor: active
                        ? c === "essential"
                          ? colors.primary
                          : colors.accent
                        : colors.border,
                    },
                  ]}
                >
                  <Feather
                    name={c === "essential" ? "alert-circle" : "gift"}
                    size={16}
                    color={
                      active
                        ? c === "essential"
                          ? "#FFFFFF"
                          : colors.accentForeground
                        : colors.mutedForeground
                    }
                  />
                  <Text
                    style={[
                      styles.toggleText,
                      {
                        color: active
                          ? c === "essential"
                            ? "#FFFFFF"
                            : colors.accentForeground
                          : colors.foreground,
                      },
                    ]}
                  >
                    {c === "essential" ? "ضرورية" : "اختيارية"}
                  </Text>
                </PressableScale>
              );
            })}
          </View>
          <Text style={[styles.hint, { color: colors.mutedForeground }]}>
            {category === "essential"
              ? "لازم تنفذها قبل أي شيء آخر — التطبيقات تكون مقفلة حتى تكملها"
              : "مكافأة بعد إنهاء كل المهام الضرورية"}
          </Text>
        </View>

        {/* Apps picker */}
        <View style={{ gap: 8 }}>
          <Text style={[styles.label, { color: colors.mutedForeground }]}>
            التطبيقات المسموح بها أثناء المهمة
          </Text>
          <PressableScale
            onPress={() => setPickerOpen(true)}
            style={[
              styles.pickerBtn,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            {appIds.length === 0 ? (
              <View style={styles.pickerEmpty}>
                <Feather name="grid" size={20} color={colors.mutedForeground} />
                <Text
                  style={[
                    styles.pickerEmptyText,
                    { color: colors.mutedForeground },
                  ]}
                >
                  اختر التطبيقات
                </Text>
              </View>
            ) : (
              <View style={styles.pickerFilled}>
                <Text
                  style={[styles.pickerCount, { color: colors.foreground }]}
                >
                  {appIds.length} مختارة
                </Text>
                <View style={styles.appsPreview}>
                  {appIds.length > 6 ? (
                    <View
                      style={[
                        styles.morePill,
                        { backgroundColor: colors.secondary },
                      ]}
                    >
                      <Text
                        style={[
                          styles.morePillText,
                          { color: colors.foreground },
                        ]}
                      >
                        +{appIds.length - 6}
                      </Text>
                    </View>
                  ) : null}
                  {selectedApps.map((a) => (
                    <AppIcon key={a!.id} app={a!} size={32} />
                  ))}
                </View>
              </View>
            )}
            <Feather
              name="chevron-down"
              size={18}
              color={colors.mutedForeground}
            />
          </PressableScale>
        </View>

        {/* Timer */}
        <View
          style={[
            styles.section,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <View style={styles.sectionHeader}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
                مؤقت زمني
              </Text>
              <Text style={[styles.sectionSub, { color: colors.mutedForeground }]}>
                لو فعلته، لما الوقت يخلص هتقفل التطبيقات تلقائيًا
              </Text>
            </View>
            <PressableScale
              onPress={() => setHasTimer((v) => !v)}
              style={[
                styles.switch,
                {
                  backgroundColor: hasTimer ? colors.success : colors.secondary,
                  borderColor: hasTimer ? colors.success : colors.border,
                },
              ]}
            >
              <View
                style={[
                  styles.switchThumb,
                  {
                    transform: [{ translateX: hasTimer ? -22 : 0 }],
                  },
                ]}
              />
            </PressableScale>
          </View>

          {hasTimer ? (
            <>
              <View style={styles.presetGrid}>
                {DURATION_PRESETS.map((p) => {
                  const active = duration === p && !customDuration;
                  return (
                    <PressableScale
                      key={p}
                      onPress={() => {
                        setDuration(p);
                        setCustomDuration("");
                      }}
                      style={[
                        styles.preset,
                        {
                          backgroundColor: active
                            ? colors.primary
                            : colors.background,
                          borderColor: active ? colors.primary : colors.border,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.presetText,
                          { color: active ? "#FFFFFF" : colors.foreground },
                        ]}
                      >
                        {p} د
                      </Text>
                    </PressableScale>
                  );
                })}
              </View>
              <TextInput
                value={customDuration}
                onChangeText={setCustomDuration}
                placeholder="أو أدخل عدد دقائق مخصص"
                placeholderTextColor={colors.mutedForeground}
                keyboardType="number-pad"
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.background,
                    color: colors.foreground,
                    borderColor: colors.border,
                  },
                ]}
                textAlign="right"
              />
            </>
          ) : null}
        </View>

        {/* Repeat */}
        <View
          style={[
            styles.section,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
            التكرار
          </Text>
          <Text style={[styles.sectionSub, { color: colors.mutedForeground }]}>
            خلي المهمة تتعاد تلقائيًا — النجمة قابلة للإلغاء قبل منتصف الليل، عدد الأيام مفعّل من أول يوم
          </Text>

          <View style={styles.toggleRow}>
            {[
              { key: "none" as RepeatMode, label: "بدون تكرار", icon: "x-circle" },
              { key: "star" as RepeatMode, label: "نجمة", icon: "star" },
              { key: "days" as RepeatMode, label: "عدد أيام", icon: "repeat" },
            ].map((opt) => {
              const active = repeatMode === opt.key;
              return (
                <PressableScale
                  key={opt.key}
                  onPress={() => setRepeatMode(opt.key)}
                  style={[
                    styles.repeatBtn,
                    {
                      backgroundColor: active ? colors.primary : colors.background,
                      borderColor: active ? colors.primary : colors.border,
                    },
                  ]}
                >
                  <Feather
                    name={opt.icon as keyof typeof Feather.glyphMap}
                    size={14}
                    color={active ? "#FFFFFF" : colors.mutedForeground}
                  />
                  <Text
                    style={[
                      styles.repeatText,
                      { color: active ? "#FFFFFF" : colors.foreground },
                    ]}
                  >
                    {opt.label}
                  </Text>
                </PressableScale>
              );
            })}
          </View>

          {repeatMode === "days" ? (
            <View style={{ gap: 6 }}>
              <Text style={[styles.label, { color: colors.mutedForeground }]}>
                عدد الأيام
              </Text>
              <TextInput
                value={days}
                onChangeText={setDays}
                keyboardType="number-pad"
                placeholder="مثلاً: 30"
                placeholderTextColor={colors.mutedForeground}
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.background,
                    color: colors.foreground,
                    borderColor: colors.border,
                  },
                ]}
                textAlign="right"
              />
            </View>
          ) : null}
        </View>

        {error ? (
          <Text
            style={{
              color: colors.destructive,
              textAlign: "right",
              fontFamily: "Inter_500Medium",
            }}
          >
            {error}
          </Text>
        ) : null}

        {/* Warning */}
        <View
          style={[
            styles.warning,
            { borderColor: colors.warning, backgroundColor: colors.warning + "12" },
          ]}
        >
          <Feather name="alert-triangle" size={16} color={colors.warning} />
          <Text style={[styles.warningText, { color: colors.warning }]}>
            بعد ما تبدأ المهمة، لن تستطيع حذفها أو إلغاءها — التزم.
          </Text>
        </View>
      </ScrollView>

      {/* Bottom CTA */}
      <View
        style={[
          styles.footer,
          {
            paddingBottom: bottomPad,
            backgroundColor: colors.background,
            borderTopColor: colors.border,
          },
        ]}
      >
        <PressableScale
          onPress={handleSave}
          style={[styles.saveBtn, { backgroundColor: colors.primary }]}
        >
          <Text style={styles.saveBtnText}>أضف المهمة</Text>
          <Feather name="arrow-left" size={18} color="#FFFFFF" />
        </PressableScale>
      </View>

      <AppPickerSheet
        visible={pickerOpen}
        initial={appIds}
        onClose={() => setPickerOpen(false)}
        onSave={(ids) => {
          setAppIds(ids);
          setPickerOpen(false);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: "row-reverse",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingBottom: 14,
    borderBottomWidth: 1,
    gap: 10,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  topTitle: {
    flex: 1,
    fontSize: 18,
    fontFamily: "Inter_700Bold",
    textAlign: "center",
  },
  label: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    textAlign: "right",
  },
  hint: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    textAlign: "right",
    lineHeight: 18,
  },
  input: {
    borderWidth: 1.5,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 15,
    fontFamily: "Inter_500Medium",
  },
  toggleRow: {
    flexDirection: "row-reverse",
    gap: 8,
  },
  toggleBtn: {
    flex: 1,
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1.5,
  },
  toggleText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
  },
  pickerBtn: {
    flexDirection: "row-reverse",
    alignItems: "center",
    padding: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    gap: 10,
    minHeight: 64,
  },
  pickerEmpty: {
    flex: 1,
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 8,
  },
  pickerEmptyText: {
    fontFamily: "Inter_500Medium",
    fontSize: 14,
  },
  pickerFilled: {
    flex: 1,
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  pickerCount: {
    fontFamily: "Inter_700Bold",
    fontSize: 14,
  },
  appsPreview: {
    flexDirection: "row-reverse",
    gap: 4,
    flex: 1,
    flexWrap: "wrap",
    justifyContent: "flex-start",
  },
  morePill: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  morePillText: {
    fontSize: 11,
    fontFamily: "Inter_700Bold",
  },
  section: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    gap: 12,
  },
  sectionHeader: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontFamily: "Inter_700Bold",
    textAlign: "right",
  },
  sectionSub: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    textAlign: "right",
    marginTop: 4,
    lineHeight: 18,
  },
  switch: {
    width: 50,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    justifyContent: "center",
    paddingHorizontal: 2,
  },
  switchThumb: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#FFFFFF",
    alignSelf: "flex-end",
  },
  presetGrid: {
    flexDirection: "row-reverse",
    flexWrap: "wrap",
    gap: 8,
  },
  preset: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  presetText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
  },
  repeatBtn: {
    flex: 1,
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  repeatText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
  },
  warning: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 8,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  warningText: {
    flex: 1,
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    textAlign: "right",
    lineHeight: 18,
  },
  footer: {
    paddingHorizontal: 18,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  saveBtn: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
    borderRadius: 16,
  },
  saveBtnText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: "Inter_700Bold",
  },
});
