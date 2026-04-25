import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import Animated, {
  FadeIn,
  FadeInDown,
  FadeOut,
  Layout,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AddTaskForm } from "@/components/AddTaskForm";
import { AnimatedGradient, GradientBg } from "@/components/AnimatedGradient";
import { ConfirmModal } from "@/components/ConfirmModal";
import { PressableScale } from "@/components/PressableScale";
import { SettingsModal } from "@/components/SettingsModal";
import { TaskCard } from "@/components/TaskCard";
import { useColors } from "@/hooks/useColors";
import { useStore } from "@/lib/store";

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const {
    state,
    ready,
    setPassphrase,
    visibleTodayTasks,
    essentialsRemaining,
    completeTask,
    startTask,
    toggleStar,
  } = useStore();

  const [phrase, setPhrase] = useState("");
  const [confirm, setConfirm] = useState("");
  const [pError, setPError] = useState<string | null>(null);

  const [adding, setAdding] = useState(false);
  const [confirmTaskId, setConfirmTaskId] = useState<string | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2200);
  };

  const topPad = Platform.OS === "web" ? 67 : insets.top + 12;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom + 16;

  if (!ready) return null;

  // ===== Onboarding =====
  if (!state.passphrase) {
    const handleSave = async () => {
      if (phrase.trim().length < 3) {
        setPError("اكتب كلمة لا تقل عن 3 حروف");
        return;
      }
      if (phrase.trim() !== confirm.trim()) {
        setPError("النصان غير متطابقين");
        return;
      }
      await setPassphrase(phrase);
    };

    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <ScrollView
          contentContainerStyle={{
            paddingTop: topPad,
            paddingBottom: bottomPad,
            paddingHorizontal: 22,
            gap: 22,
          }}
          keyboardShouldPersistTaps="handled"
        >
          <AnimatedGradient style={styles.heroBox}>
            <View style={styles.heroInner}>
              <View style={styles.logoWrap}>
                <View style={styles.logo}>
                  <Feather name="sun" size={36} color="#1A1306" />
                </View>
              </View>
              <Text style={styles.heroTitle}>نظام حياتي</Text>
              <Text style={styles.heroSub}>
                نظّم يومك. أنجز ما يهم. كافئ نفسك.
              </Text>
            </View>
          </AnimatedGradient>

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
                <Feather name="key" size={20} color={colors.primaryForeground} />
              </LinearGradient>
              <View style={{ flex: 1 }}>
                <Text style={[styles.cardTitle, { color: colors.foreground }]}>
                  اضبط كلمة التأكيد
                </Text>
                <Text style={[styles.cardSub, { color: colors.mutedForeground }]}>
                  هتكتبها كل مرة تأكد فيها إنجاز مهمة
                </Text>
              </View>
            </View>

            <View
              style={[
                styles.warningBox,
                {
                  backgroundColor: colors.warning + "15",
                  borderColor: colors.warning,
                },
              ]}
            >
              <Feather name="alert-triangle" size={14} color={colors.warning} />
              <Text style={[styles.warningText, { color: colors.warning }]}>
                التغيير مرة واحدة شهريًا، يوم 1 الساعة 4:00 صباحًا
              </Text>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={[styles.label, { color: colors.mutedForeground }]}>
                كلمة التأكيد
              </Text>
              <TextInput
                value={phrase}
                onChangeText={(t) => {
                  setPhrase(t);
                  if (pError) setPError(null);
                }}
                placeholder="مثال: أنا قوي ومنضبط"
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

            <View style={styles.fieldGroup}>
              <Text style={[styles.label, { color: colors.mutedForeground }]}>
                أعد كتابتها للتأكيد
              </Text>
              <TextInput
                value={confirm}
                onChangeText={(t) => {
                  setConfirm(t);
                  if (pError) setPError(null);
                }}
                placeholder="نفس النص بالضبط"
                placeholderTextColor={colors.mutedForeground}
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.background,
                    color: colors.foreground,
                    borderColor: pError ? colors.destructive : colors.border,
                  },
                ]}
                textAlign="right"
              />
            </View>

            {pError ? (
              <Text
                style={{
                  color: colors.destructive,
                  textAlign: "right",
                  fontFamily: "Inter_500Medium",
                }}
              >
                {pError}
              </Text>
            ) : null}

            <PressableScale onPress={handleSave} style={{ width: "100%" }}>
              <LinearGradient
                colors={[colors.gradientA, colors.gradientB]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.cta}
              >
                <Text style={[styles.ctaText, { color: colors.primaryForeground }]}>
                  ابدأ نظامي
                </Text>
                <Feather name="arrow-left" size={18} color={colors.primaryForeground} />
              </LinearGradient>
            </PressableScale>
          </View>
        </ScrollView>
      </View>
    );
  }

  // ===== Main single page =====
  const tasks = visibleTodayTasks();
  const essentials = tasks.filter((t) => t.category === "essential");
  const optionals = tasks.filter((t) => t.category === "optional");
  const essentialsLeft = essentialsRemaining().length;
  const totalEssentials = state.tasks.filter(
    (t) => t.category === "essential"
  ).length;
  const completedToday = state.tasks.filter((t) => t.completedAt).length;
  const progress =
    totalEssentials > 0
      ? Math.round(((totalEssentials - essentialsLeft) / totalEssentials) * 100)
      : 0;

  const handleStart = async (taskId: string, isOptional: boolean) => {
    if (isOptional && essentialsLeft > 0) {
      showToast("لازم تخلص الضرورية الأول");
      return;
    }
    await startTask(taskId);
  };

  const handleConfirmComplete = async () => {
    if (!confirmTaskId) return;
    const res = await completeTask(confirmTaskId, state.passphrase || "");
    if (!res.ok) {
      showToast(res.reason || "فشل التأكيد");
      return;
    }
    setConfirmTaskId(null);
  };

  const handleToggleStar = async (taskId: string) => {
    const res = await toggleStar(taskId);
    if (!res.ok && res.reason) showToast(res.reason);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <GradientBg />
      <ScrollView
        contentContainerStyle={{
          paddingTop: topPad,
          paddingBottom: bottomPad + 30,
          paddingHorizontal: 18,
          gap: 16,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.headerRow}>
          <PressableScale
            onPress={() => setSettingsOpen(true)}
            style={[styles.iconBtn, { backgroundColor: colors.card }]}
          >
            <Feather name="settings" size={20} color={colors.foreground} />
          </PressableScale>
          <View style={{ flex: 1, alignItems: "flex-end" }}>
            <Text style={[styles.heading, { color: colors.foreground }]}>
              نظام حياتي
            </Text>
          </View>
          <View style={styles.logoSmallWrap}>
            <LinearGradient
              colors={[colors.gradientA, colors.gradientD]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.logoSmall}
            >
              <Feather name="sun" size={20} color="#1A1306" />
            </LinearGradient>
          </View>
        </View>

        {/* Animated gradient progress card */}
        <AnimatedGradient style={styles.progressCard}>
          <View style={styles.progressTop}>
            <View style={{ flex: 1, alignItems: "flex-end" }}>
              <Text style={styles.progressLabel}>التزامك اليوم</Text>
              <Text style={styles.progressPct}>{progress}%</Text>
            </View>
            <View style={styles.progressIconWrap}>
              <Feather
                name={
                  essentialsLeft === 0 && totalEssentials > 0
                    ? "award"
                    : "target"
                }
                size={28}
                color="#1A1306"
              />
            </View>
          </View>
          <View style={styles.progressBarBg}>
            <View
              style={[styles.progressBarFill, { width: `${progress}%` }]}
            />
          </View>
          <View style={styles.progressMeta}>
            <Text style={styles.progressMetaText}>{completedToday} مكتملة</Text>
            <Text style={styles.progressMetaText}>
              {essentialsLeft} ضرورية متبقية
            </Text>
          </View>
        </AnimatedGradient>

        {/* Add task button or form */}
        {!adding ? (
          <Animated.View
            entering={FadeIn.duration(250)}
            exiting={FadeOut.duration(150)}
            layout={Layout.springify()}
          >
            <PressableScale onPress={() => setAdding(true)}>
              <LinearGradient
                colors={[colors.gradientA, colors.gradientB, colors.gradientD]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.addBtn}
              >
                <Feather name="plus-circle" size={22} color="#1A1306" />
                <Text style={styles.addBtnText}>إضافة مهمة</Text>
              </LinearGradient>
            </PressableScale>
          </Animated.View>
        ) : (
          <Animated.View
            entering={FadeInDown.duration(300)}
            exiting={FadeOut.duration(150)}
            layout={Layout.springify()}
          >
            <AddTaskForm
              onCancel={() => setAdding(false)}
              onSaved={() => setAdding(false)}
            />
          </Animated.View>
        )}

        {/* Lock notice */}
        {essentialsLeft > 0 && optionals.length > 0 ? (
          <View
            style={[
              styles.noticeCard,
              {
                backgroundColor: colors.warning + "15",
                borderColor: colors.warning,
              },
            ]}
          >
            <Feather name="lock" size={16} color={colors.warning} />
            <Text style={[styles.noticeText, { color: colors.warning }]}>
              المهام الاختيارية مقفلة حتى تخلص الضرورية
            </Text>
          </View>
        ) : null}

        {/* Empty state */}
        {tasks.length === 0 && !adding ? (
          <View
            style={[
              styles.empty,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <LinearGradient
              colors={[colors.gradientA + "30", colors.gradientB + "10"]}
              style={styles.emptyIcon}
            >
              <Feather name="sun" size={28} color={colors.primary} />
            </LinearGradient>
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
              ابدأ يومك بمهمة
            </Text>
            <Text style={[styles.emptyDesc, { color: colors.mutedForeground }]}>
              دوس على زرار "إضافة مهمة" واختار خياراتك
            </Text>
          </View>
        ) : null}

        {/* Essentials */}
        {essentials.length > 0 ? (
          <View style={{ gap: 10 }}>
            <View style={styles.sectionHeader}>
              <View style={[styles.dot, { backgroundColor: colors.primary }]} />
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
                المهام الضرورية
              </Text>
            </View>
            {essentials.map((task) => {
              const timerEnds =
                state.activeTimerTaskId === task.id &&
                state.timerStartAt &&
                task.durationMinutes
                  ? state.timerStartAt + task.durationMinutes * 60_000
                  : null;
              return (
                <Animated.View
                  key={task.id}
                  entering={FadeInDown.duration(200)}
                  layout={Layout.springify()}
                >
                  <TaskCard
                    task={task}
                    locked={false}
                    timerEndsAt={timerEnds}
                    onStart={() => handleStart(task.id, false)}
                    onComplete={() => setConfirmTaskId(task.id)}
                    onToggleStar={() => handleToggleStar(task.id)}
                  />
                </Animated.View>
              );
            })}
          </View>
        ) : null}

        {/* Optionals */}
        {optionals.length > 0 ? (
          <View style={{ gap: 10 }}>
            <View style={styles.sectionHeader}>
              <View style={[styles.dot, { backgroundColor: colors.accent }]} />
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
                المهام الاختيارية
              </Text>
            </View>
            {optionals.map((task) => {
              const locked = essentialsLeft > 0;
              const timerEnds =
                state.activeTimerTaskId === task.id &&
                state.timerStartAt &&
                task.durationMinutes
                  ? state.timerStartAt + task.durationMinutes * 60_000
                  : null;
              return (
                <Animated.View
                  key={task.id}
                  entering={FadeInDown.duration(200)}
                  layout={Layout.springify()}
                >
                  <TaskCard
                    task={task}
                    locked={locked}
                    lockReason={locked ? "خلص الضرورية الأول" : undefined}
                    timerEndsAt={timerEnds}
                    onStart={() => handleStart(task.id, true)}
                    onComplete={() => setConfirmTaskId(task.id)}
                    onToggleStar={() => handleToggleStar(task.id)}
                  />
                </Animated.View>
              );
            })}
          </View>
        ) : null}
      </ScrollView>

      <ConfirmModal
        visible={!!confirmTaskId}
        title="تأكيد إنجاز المهمة"
        description="اكتب كلمة التأكيد بالضبط لتأكيد إنجاز المهمة فعلًا."
        expectedPhrase={state.passphrase || ""}
        onCancel={() => setConfirmTaskId(null)}
        onConfirm={handleConfirmComplete}
      />

      <SettingsModal
        visible={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />

      {toast ? (
        <Animated.View
          entering={FadeInDown.duration(200)}
          exiting={FadeOut.duration(200)}
          style={[
            styles.toast,
            {
              bottom: bottomPad + 12,
              backgroundColor: colors.cardElevated,
              borderColor: colors.warning,
            },
          ]}
        >
          <Feather name="info" size={14} color={colors.warning} />
          <Text style={[styles.toastText, { color: colors.foreground }]}>
            {toast}
          </Text>
        </Animated.View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  // Onboarding
  heroBox: {
    height: 240,
    borderRadius: 28,
    overflow: "hidden",
    justifyContent: "flex-end",
  },
  heroInner: { padding: 24, gap: 8, alignItems: "flex-end" },
  logoWrap: { marginBottom: 12 },
  logo: {
    width: 72,
    height: 72,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.85)",
  },
  heroTitle: {
    color: "#1A1306",
    fontSize: 36,
    fontFamily: "Inter_700Bold",
    textAlign: "right",
  },
  heroSub: {
    color: "rgba(26,19,6,0.85)",
    fontSize: 15,
    fontFamily: "Inter_500Medium",
    textAlign: "right",
  },
  card: { borderRadius: 24, borderWidth: 1, padding: 20, gap: 14 },
  cardHeader: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 12,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  cardTitle: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
    textAlign: "right",
  },
  cardSub: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    textAlign: "right",
    marginTop: 2,
  },
  warningBox: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 8,
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  warningText: {
    fontFamily: "Inter_500Medium",
    fontSize: 12,
    flex: 1,
    textAlign: "right",
  },
  fieldGroup: { gap: 6 },
  label: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    textAlign: "right",
  },
  input: {
    borderWidth: 1.5,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 16,
    fontFamily: "Inter_500Medium",
  },
  cta: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
    borderRadius: 16,
  },
  ctaText: { fontSize: 16, fontFamily: "Inter_700Bold" },

  // Home
  headerRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 12,
  },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  heading: {
    fontSize: 26,
    fontFamily: "Inter_700Bold",
  },
  logoSmallWrap: {},
  logoSmall: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  progressCard: {
    borderRadius: 22,
    padding: 18,
    gap: 12,
    minHeight: 130,
  },
  progressTop: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 12,
  },
  progressLabel: {
    color: "rgba(26,19,6,0.85)",
    fontSize: 13,
    fontFamily: "Inter_700Bold",
  },
  progressPct: {
    color: "#1A1306",
    fontSize: 36,
    fontFamily: "Inter_700Bold",
    letterSpacing: -1,
  },
  progressIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(255,255,255,0.45)",
    alignItems: "center",
    justifyContent: "center",
  },
  progressBarBg: {
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(26,19,6,0.25)",
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#1A1306",
    borderRadius: 4,
  },
  progressMeta: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
  },
  progressMetaText: {
    color: "#1A1306",
    fontFamily: "Inter_700Bold",
    fontSize: 12,
  },
  addBtn: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 18,
    borderRadius: 18,
  },
  addBtnText: {
    color: "#1A1306",
    fontFamily: "Inter_700Bold",
    fontSize: 16,
  },
  noticeCard: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 10,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  noticeText: {
    flex: 1,
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    textAlign: "right",
  },
  sectionHeader: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 4,
  },
  dot: { width: 8, height: 8, borderRadius: 4 },
  sectionTitle: { fontSize: 14, fontFamily: "Inter_700Bold" },
  empty: {
    alignItems: "center",
    padding: 28,
    borderRadius: 22,
    borderWidth: 1,
    gap: 10,
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  emptyTitle: { fontSize: 18, fontFamily: "Inter_700Bold" },
  emptyDesc: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 20,
  },
  toast: {
    position: "absolute",
    left: 18,
    right: 18,
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  toastText: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
    flex: 1,
    textAlign: "right",
  },
});
