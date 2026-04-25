import { Feather } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
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
import { CyclingGradient } from "@/components/CyclingGradient";
import { DailyPlanModal } from "@/components/DailyPlanModal";
import { EveningPromptModal } from "@/components/EveningPromptModal";
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
    visibleTodayTasks,
    essentialsRemaining,
    completeTask,
    startTask,
    toggleStar,
    shouldShowDailyPlan,
    markDailyPlanShown,
    shouldShowEveningPrompt,
    markEveningPromptShown,
  } = useStore();

  const [adding, setAdding] = useState(false);
  const [confirmTaskId, setConfirmTaskId] = useState<string | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [dailyPlanOpen, setDailyPlanOpen] = useState(false);
  const [eveningOpen, setEveningOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // Daily/evening checks — re-evaluate every minute and on mount
  useEffect(() => {
    if (!ready) return;
    const check = () => {
      if (shouldShowDailyPlan()) setDailyPlanOpen(true);
      if (shouldShowEveningPrompt()) setEveningOpen(true);
    };
    check();
    const id = setInterval(check, 60_000);
    return () => clearInterval(id);
  }, [ready, shouldShowDailyPlan, shouldShowEveningPrompt, state.tasks]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2200);
  };

  const topPad = Platform.OS === "web" ? 67 : insets.top + 12;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom + 16;

  if (!ready) return null;

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
    if (!state.passphrase) {
      showToast("اضبط كلمة التأكيد من الإعدادات أولًا");
      setConfirmTaskId(null);
      setSettingsOpen(true);
      return;
    }
    const res = await completeTask(confirmTaskId, state.passphrase);
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

  const handleTryComplete = (taskId: string) => {
    if (!state.passphrase) {
      showToast("اضبط كلمة التأكيد من الإعدادات أولًا");
      setSettingsOpen(true);
      return;
    }
    setConfirmTaskId(taskId);
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
            {!state.passphrase ? (
              <Text style={{ color: colors.warning, fontSize: 11, fontFamily: "Inter_500Medium" }}>
                اضبط كلمة التأكيد من الإعدادات
              </Text>
            ) : null}
          </View>
          <CyclingGradient duration={3500} style={styles.logoSmall}>
            <Feather name="sun" size={20} color="#1A1306" />
          </CyclingGradient>
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
                  essentialsLeft === 0 && totalEssentials > 0 ? "award" : "target"
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
              <CyclingGradient duration={2800} style={styles.addBtn}>
                <Feather name="plus-circle" size={22} color="#1A1306" />
                <Text style={styles.addBtnText}>إضافة مهمة</Text>
              </CyclingGradient>
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
              المهام الاختيارية وتطبيقاتها مقفلة حتى تخلص الضرورية
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
            <CyclingGradient duration={3500} style={styles.emptyIcon}>
              <Feather name="sun" size={28} color="#1A1306" />
            </CyclingGradient>
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
                    onComplete={() => handleTryComplete(task.id)}
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
                    onComplete={() => handleTryComplete(task.id)}
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

      <DailyPlanModal
        visible={dailyPlanOpen}
        onClose={() => {
          markDailyPlanShown();
          setDailyPlanOpen(false);
        }}
      />

      <EveningPromptModal
        visible={eveningOpen}
        onAddMore={() => {
          markEveningPromptShown();
          setEveningOpen(false);
          setAdding(true);
        }}
        onSkip={() => {
          markEveningPromptShown();
          setEveningOpen(false);
        }}
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
    overflow: "hidden",
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
