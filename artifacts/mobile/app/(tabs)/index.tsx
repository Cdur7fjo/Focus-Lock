import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ConfirmModal } from "@/components/ConfirmModal";
import { PressableScale } from "@/components/PressableScale";
import { TaskCard } from "@/components/TaskCard";
import { useColors } from "@/hooks/useColors";
import { useStore } from "@/lib/store";

export default function TodayScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const {
    state,
    visibleTodayTasks,
    essentialsRemaining,
    completeTask,
    startTask,
    toggleStar,
  } = useStore();

  const [confirmTaskId, setConfirmTaskId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const tasks = visibleTodayTasks();
  const essentials = tasks.filter((t) => t.category === "essential");
  const optionals = tasks.filter((t) => t.category === "optional");
  const essentialsLeft = essentialsRemaining().length;
  const totalEssentials = state.tasks.filter((t) => t.category === "essential").length;
  const completedToday = state.tasks.filter((t) => t.completedAt).length;

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2200);
  };

  const handleStart = async (taskId: string, isOptional: boolean) => {
    if (isOptional && essentialsLeft > 0) {
      showToast("لا يمكن بدء المهام الاختيارية قبل إنهاء الضرورية");
      return;
    }
    await startTask(taskId);
  };

  const handleConfirmComplete = async (phrase: string) => {
    if (!confirmTaskId) return;
    const res = await completeTask(confirmTaskId, phrase);
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

  const topPad = Platform.OS === "web" ? 67 : insets.top + 12;
  const bottomPad = Platform.OS === "web" ? 110 : 100;

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return "صباح الإنجاز";
    if (h < 18) return "مساء الإنتاجية";
    return "مساء الالتزام";
  })();

  const progress =
    totalEssentials > 0
      ? Math.round(((totalEssentials - essentialsLeft) / totalEssentials) * 100)
      : 0;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: topPad,
          paddingBottom: bottomPad,
          paddingHorizontal: 18,
          gap: 18,
        }}
      >
        {/* Header */}
        <View style={styles.headerRow}>
          <View style={{ flex: 1, alignItems: "flex-end" }}>
            <Text style={[styles.greeting, { color: colors.mutedForeground }]}>
              {greeting}
            </Text>
            <Text style={[styles.heading, { color: colors.foreground }]}>
              مهام اليوم
            </Text>
          </View>
          <PressableScale
            onPress={() => router.push("/new-task")}
            style={[styles.addBtn, { backgroundColor: colors.primary }]}
          >
            <Feather name="plus" size={22} color="#FFFFFF" />
          </PressableScale>
        </View>

        {/* Progress card */}
        <LinearGradient
          colors={[colors.gradientA, colors.gradientB]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.progressCard}
        >
          <View style={styles.progressTop}>
            <View style={{ flex: 1, alignItems: "flex-end" }}>
              <Text style={styles.progressLabel}>التزامك اليوم</Text>
              <Text style={styles.progressPct}>{progress}%</Text>
            </View>
            <View style={styles.progressIconWrap}>
              <Feather
                name={essentialsLeft === 0 && totalEssentials > 0 ? "award" : "target"}
                size={28}
                color="#FFFFFF"
              />
            </View>
          </View>
          <View style={styles.progressBarBg}>
            <View
              style={[
                styles.progressBarFill,
                { width: `${progress}%` },
              ]}
            />
          </View>
          <View style={styles.progressMeta}>
            <Text style={styles.progressMetaText}>
              {completedToday} مكتملة
            </Text>
            <Text style={styles.progressMetaText}>
              {essentialsLeft} ضرورية متبقية
            </Text>
          </View>
        </LinearGradient>

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
            <Feather name="lock" size={18} color={colors.warning} />
            <Text style={[styles.noticeText, { color: colors.warning }]}>
              التطبيقات والمهام الاختيارية مقفلة حتى تنتهي من المهام الضرورية
            </Text>
          </View>
        ) : null}

        {/* Empty state */}
        {tasks.length === 0 ? (
          <View
            style={[
              styles.empty,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <View
              style={[
                styles.emptyIcon,
                { backgroundColor: colors.primary + "20" },
              ]}
            >
              <Feather name="inbox" size={28} color={colors.primary} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
              ابدأ يومك بمهمة
            </Text>
            <Text style={[styles.emptyDesc, { color: colors.mutedForeground }]}>
              أضف مهمة، اختر التطبيقات اللي تحتاجها، وحدد وقتها
            </Text>
            <PressableScale
              onPress={() => router.push("/new-task")}
              style={[styles.emptyBtn, { backgroundColor: colors.primary }]}
            >
              <Feather name="plus" size={18} color="#FFFFFF" />
              <Text style={styles.emptyBtnText}>أضف مهمة جديدة</Text>
            </PressableScale>
          </View>
        ) : null}

        {/* Essential section */}
        {essentials.length > 0 ? (
          <View style={{ gap: 12 }}>
            <View style={styles.sectionHeader}>
              <View
                style={[
                  styles.dot,
                  { backgroundColor: colors.primary },
                ]}
              />
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
                <TaskCard
                  key={task.id}
                  task={task}
                  locked={false}
                  timerEndsAt={timerEnds}
                  onStart={() => handleStart(task.id, false)}
                  onComplete={() => setConfirmTaskId(task.id)}
                  onToggleStar={() => handleToggleStar(task.id)}
                />
              );
            })}
          </View>
        ) : null}

        {/* Optional section */}
        {optionals.length > 0 ? (
          <View style={{ gap: 12 }}>
            <View style={styles.sectionHeader}>
              <View
                style={[styles.dot, { backgroundColor: colors.accent }]}
              />
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
                المهام الاختيارية (مكافأة)
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
                <TaskCard
                  key={task.id}
                  task={task}
                  locked={locked}
                  lockReason={
                    locked ? "أكمل الضرورية أولًا" : undefined
                  }
                  timerEndsAt={timerEnds}
                  onStart={() => handleStart(task.id, true)}
                  onComplete={() => setConfirmTaskId(task.id)}
                  onToggleStar={() => handleToggleStar(task.id)}
                />
              );
            })}
          </View>
        ) : null}
      </ScrollView>

      <ConfirmModal
        visible={!!confirmTaskId}
        title="تأكيد إنجاز المهمة"
        description="اكتب كلمة التأكيد الخاصة بك بالضبط لتأكيد أنك أنجزت المهمة فعلًا."
        expectedPhrase={state.passphrase || ""}
        onCancel={() => setConfirmTaskId(null)}
        onConfirm={() => {
          // ConfirmModal validates locally, but we re-verify via store
          const taskId = confirmTaskId;
          if (!taskId) return;
          // The modal already matched expectedPhrase; pass it through
          handleConfirmComplete(state.passphrase || "");
        }}
      />

      {toast ? (
        <View
          style={[
            styles.toast,
            {
              bottom: bottomPad + 12,
              backgroundColor: colors.cardElevated,
              borderColor: colors.border,
            },
          ]}
        >
          <Feather name="info" size={14} color={colors.warning} />
          <Text style={[styles.toastText, { color: colors.foreground }]}>
            {toast}
          </Text>
        </View>
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
  greeting: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },
  heading: {
    fontSize: 30,
    fontFamily: "Inter_700Bold",
  },
  addBtn: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#7C5CFF",
    shadowOpacity: 0.5,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
    elevation: 6,
  },
  progressCard: {
    borderRadius: 22,
    padding: 18,
    gap: 14,
  },
  progressTop: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 12,
  },
  progressLabel: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },
  progressPct: {
    color: "#FFFFFF",
    fontSize: 36,
    fontFamily: "Inter_700Bold",
    letterSpacing: -1,
  },
  progressIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
  },
  progressBarBg: {
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255,255,255,0.25)",
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 4,
  },
  progressMeta: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
  },
  progressMetaText: {
    color: "rgba(255,255,255,0.95)",
    fontFamily: "Inter_600SemiBold",
    fontSize: 12,
  },
  noticeCard: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 10,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  noticeText: {
    flex: 1,
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    textAlign: "right",
  },
  sectionHeader: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 4,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  sectionTitle: {
    fontSize: 15,
    fontFamily: "Inter_700Bold",
  },
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
  emptyTitle: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
  },
  emptyDesc: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 20,
  },
  emptyBtn: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 14,
    marginTop: 10,
  },
  emptyBtnText: {
    color: "#FFFFFF",
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
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
