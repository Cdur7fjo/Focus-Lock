import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { AppIcon } from "@/components/AppIcon";
import { AppPickerSheet } from "@/components/AppPickerSheet";
import { PressableScale } from "@/components/PressableScale";
import { useColors } from "@/hooks/useColors";
import { useStore } from "@/lib/store";
import type { RepeatMode } from "@/lib/types";

const DURATION_PRESETS = [15, 30, 45, 60, 90, 120];

type Props = {
  onCancel: () => void;
  onSaved: () => void;
};

export function AddTaskForm({ onCancel, onSaved }: Props) {
  const colors = useColors();
  const { addTask, getApp } = useStore();

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

  const selectedApps = appIds.map(getApp).filter(Boolean).slice(0, 6);

  const handleSave = async () => {
    if (title.trim().length < 2) {
      setError("اكتب اسم المهمة");
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
    onSaved();
  };

  return (
    <LinearGradient
      colors={["rgba(250,204,21,0.10)", "rgba(245,158,11,0.04)"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[
        styles.card,
        { borderColor: colors.primary },
      ]}
    >
      {/* Step 1: Category */}
      <View style={styles.stepHeader}>
        <View style={[styles.stepNum, { backgroundColor: colors.primary }]}>
          <Text style={[styles.stepNumText, { color: colors.primaryForeground }]}>
            1
          </Text>
        </View>
        <Text style={[styles.stepLabel, { color: colors.foreground }]}>
          نوع المهمة
        </Text>
      </View>
      <View style={styles.toggleRow}>
        {(["essential", "optional"] as const).map((c) => {
          const active = category === c;
          return (
            <PressableScale
              key={c}
              onPress={() => setCategory(c)}
              style={{ flex: 1 }}
            >
              {active ? (
                <LinearGradient
                  colors={[colors.gradientA, colors.gradientB]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.toggleBtnActive}
                >
                  <Feather
                    name={c === "essential" ? "alert-circle" : "gift"}
                    size={16}
                    color={colors.primaryForeground}
                  />
                  <Text
                    style={[
                      styles.toggleText,
                      { color: colors.primaryForeground },
                    ]}
                  >
                    {c === "essential" ? "ضرورية" : "غير ضرورية"}
                  </Text>
                </LinearGradient>
              ) : (
                <View
                  style={[
                    styles.toggleBtn,
                    {
                      backgroundColor: colors.card,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <Feather
                    name={c === "essential" ? "alert-circle" : "gift"}
                    size={16}
                    color={colors.mutedForeground}
                  />
                  <Text
                    style={[styles.toggleText, { color: colors.foreground }]}
                  >
                    {c === "essential" ? "ضرورية" : "غير ضرورية"}
                  </Text>
                </View>
              )}
            </PressableScale>
          );
        })}
      </View>

      {/* Step 2: Title */}
      <View style={styles.stepHeader}>
        <View style={[styles.stepNum, { backgroundColor: colors.primary }]}>
          <Text style={[styles.stepNumText, { color: colors.primaryForeground }]}>
            2
          </Text>
        </View>
        <Text style={[styles.stepLabel, { color: colors.foreground }]}>
          اسم المهمة
        </Text>
      </View>
      <TextInput
        value={title}
        onChangeText={(t) => {
          setTitle(t);
          if (error) setError(null);
        }}
        placeholder="إيه اللي هتعمله؟"
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

      {/* Step 3: Apps */}
      <View style={styles.stepHeader}>
        <View style={[styles.stepNum, { backgroundColor: colors.primary }]}>
          <Text style={[styles.stepNumText, { color: colors.primaryForeground }]}>
            3
          </Text>
        </View>
        <Text style={[styles.stepLabel, { color: colors.foreground }]}>
          التطبيقات اللي هتحتاجها
        </Text>
      </View>
      <PressableScale
        onPress={() => setPickerOpen(true)}
        style={[
          styles.pickerBtn,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
      >
        {appIds.length === 0 ? (
          <View style={styles.pickerEmpty}>
            <Feather name="grid" size={18} color={colors.mutedForeground} />
            <Text
              style={[
                styles.pickerEmptyText,
                { color: colors.mutedForeground },
              ]}
            >
              اختر من تطبيقاتك
            </Text>
          </View>
        ) : (
          <View style={styles.pickerFilled}>
            <Text style={[styles.pickerCount, { color: colors.primary }]}>
              {appIds.length}
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
                    style={[styles.morePillText, { color: colors.foreground }]}
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

      {/* Step 4: Time */}
      <View style={styles.stepHeader}>
        <View style={[styles.stepNum, { backgroundColor: colors.primary }]}>
          <Text style={[styles.stepNumText, { color: colors.primaryForeground }]}>
            4
          </Text>
        </View>
        <Text style={[styles.stepLabel, { color: colors.foreground }]}>
          الوقت
        </Text>
        <View style={{ flex: 1 }} />
        <PressableScale
          onPress={() => setHasTimer((v) => !v)}
          style={[
            styles.switch,
            {
              backgroundColor: hasTimer ? colors.primary : colors.secondary,
              borderColor: hasTimer ? colors.primary : colors.border,
            },
          ]}
        >
          <View
            style={[
              styles.switchThumb,
              {
                transform: [{ translateX: hasTimer ? -22 : 0 }],
                backgroundColor: hasTimer ? "#1A1306" : "#FFFFFF",
              },
            ]}
          />
        </PressableScale>
      </View>
      {hasTimer ? (
        <View style={{ gap: 10 }}>
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
                      backgroundColor: active ? colors.primary : colors.card,
                      borderColor: active ? colors.primary : colors.border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.presetText,
                      {
                        color: active
                          ? colors.primaryForeground
                          : colors.foreground,
                      },
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
            placeholder="أو اكتب عدد الدقائق"
            placeholderTextColor={colors.mutedForeground}
            keyboardType="number-pad"
            style={[
              styles.input,
              {
                backgroundColor: colors.card,
                color: colors.foreground,
                borderColor: colors.border,
              },
            ]}
            textAlign="right"
          />
        </View>
      ) : null}

      {/* Step 5: Star + Repeat together */}
      <View style={styles.stepHeader}>
        <View style={[styles.stepNum, { backgroundColor: colors.primary }]}>
          <Text style={[styles.stepNumText, { color: colors.primaryForeground }]}>
            5
          </Text>
        </View>
        <Text style={[styles.stepLabel, { color: colors.foreground }]}>
          النجمة والتكرار
        </Text>
      </View>
      <View style={styles.toggleRow}>
        {[
          { key: "none" as RepeatMode, label: "بدون", icon: "minus-circle" },
          { key: "star" as RepeatMode, label: "نجمة", icon: "star" },
          { key: "days" as RepeatMode, label: "أيام", icon: "repeat" },
        ].map((opt) => {
          const active = repeatMode === opt.key;
          return (
            <PressableScale
              key={opt.key}
              onPress={() => setRepeatMode(opt.key)}
              style={{ flex: 1 }}
            >
              {active ? (
                <LinearGradient
                  colors={[colors.gradientA, colors.gradientB]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.repeatBtnActive}
                >
                  <Feather
                    name={opt.icon as keyof typeof Feather.glyphMap}
                    size={14}
                    color={colors.primaryForeground}
                  />
                  <Text
                    style={[
                      styles.repeatText,
                      { color: colors.primaryForeground },
                    ]}
                  >
                    {opt.label}
                  </Text>
                </LinearGradient>
              ) : (
                <View
                  style={[
                    styles.repeatBtn,
                    {
                      backgroundColor: colors.card,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <Feather
                    name={opt.icon as keyof typeof Feather.glyphMap}
                    size={14}
                    color={colors.mutedForeground}
                  />
                  <Text
                    style={[styles.repeatText, { color: colors.foreground }]}
                  >
                    {opt.label}
                  </Text>
                </View>
              )}
            </PressableScale>
          );
        })}
      </View>
      {repeatMode === "days" ? (
        <TextInput
          value={days}
          onChangeText={setDays}
          keyboardType="number-pad"
          placeholder="عدد الأيام (مثلاً 30)"
          placeholderTextColor={colors.mutedForeground}
          style={[
            styles.input,
            {
              backgroundColor: colors.card,
              color: colors.foreground,
              borderColor: colors.border,
            },
          ]}
          textAlign="right"
        />
      ) : null}
      {repeatMode === "star" ? (
        <Text style={[styles.helpText, { color: colors.mutedForeground }]}>
          النجمة هتفضل قابلة للإلغاء قبل منتصف الليل، وبعد كده هتتقفل لباقي اليوم.
        </Text>
      ) : null}

      {error ? (
        <Text style={{ color: colors.destructive, textAlign: "right" }}>
          {error}
        </Text>
      ) : null}

      {/* Warning */}
      <View
        style={[
          styles.warning,
          {
            borderColor: colors.warning,
            backgroundColor: colors.warning + "10",
          },
        ]}
      >
        <Feather name="alert-triangle" size={14} color={colors.warning} />
        <Text style={[styles.warningText, { color: colors.warning }]}>
          بعد ما تبدأ المهمة، مينفعش تحذفها — التزم.
        </Text>
      </View>

      <View style={styles.actions}>
        <PressableScale
          onPress={onCancel}
          style={[styles.btn, { backgroundColor: colors.secondary, flex: 1 }]}
        >
          <Text style={[styles.btnText, { color: colors.foreground }]}>
            إلغاء
          </Text>
        </PressableScale>
        <PressableScale onPress={handleSave} style={{ flex: 1.5 }}>
          <LinearGradient
            colors={[colors.gradientA, colors.gradientB]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.btn}
          >
            <Text
              style={[styles.btnText, { color: colors.primaryForeground }]}
            >
              أضف المهمة
            </Text>
          </LinearGradient>
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
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 22,
    borderWidth: 1.5,
    padding: 16,
    gap: 10,
  },
  stepHeader: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 8,
    marginTop: 4,
  },
  stepNum: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  stepNumText: {
    fontSize: 11,
    fontFamily: "Inter_700Bold",
  },
  stepLabel: {
    fontSize: 13,
    fontFamily: "Inter_700Bold",
  },
  toggleRow: { flexDirection: "row-reverse", gap: 8 },
  toggleBtn: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 13,
    borderRadius: 14,
    borderWidth: 1.5,
  },
  toggleBtnActive: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 13,
    borderRadius: 14,
  },
  toggleText: { fontFamily: "Inter_700Bold", fontSize: 14 },
  input: {
    borderWidth: 1.5,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 15,
    fontFamily: "Inter_500Medium",
  },
  pickerBtn: {
    flexDirection: "row-reverse",
    alignItems: "center",
    padding: 12,
    borderRadius: 14,
    borderWidth: 1.5,
    gap: 10,
    minHeight: 56,
  },
  pickerEmpty: {
    flex: 1,
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 8,
  },
  pickerEmptyText: { fontFamily: "Inter_500Medium", fontSize: 14 },
  pickerFilled: {
    flex: 1,
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 10,
  },
  pickerCount: { fontFamily: "Inter_700Bold", fontSize: 16 },
  appsPreview: {
    flexDirection: "row-reverse",
    gap: 4,
    flex: 1,
    flexWrap: "wrap",
  },
  morePill: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  morePillText: { fontSize: 11, fontFamily: "Inter_700Bold" },
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
    alignSelf: "flex-end",
  },
  presetGrid: { flexDirection: "row-reverse", flexWrap: "wrap", gap: 8 },
  preset: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  presetText: { fontFamily: "Inter_700Bold", fontSize: 13 },
  repeatBtn: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 11,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  repeatBtnActive: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 11,
    borderRadius: 12,
  },
  repeatText: { fontFamily: "Inter_700Bold", fontSize: 13 },
  helpText: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    textAlign: "right",
    lineHeight: 16,
  },
  warning: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 8,
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  warningText: {
    flex: 1,
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    textAlign: "right",
  },
  actions: { flexDirection: "row-reverse", gap: 10, marginTop: 4 },
  btn: {
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  btnText: { fontFamily: "Inter_700Bold", fontSize: 15 },
});
