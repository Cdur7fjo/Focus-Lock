import { Feather } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { AppIcon } from "@/components/AppIcon";
import { PressableScale } from "@/components/PressableScale";
import { useColors } from "@/hooks/useColors";
import { getAppById } from "@/lib/mockApps";
import type { Task } from "@/lib/types";

type Props = {
  task: Task;
  onStart: () => void;
  onComplete: () => void;
  onToggleStar: () => void;
  locked: boolean;
  lockReason?: string;
  timerEndsAt: number | null;
};

function formatRemaining(ms: number): string {
  if (ms <= 0) return "00:00";
  const total = Math.floor(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

export function TaskCard({
  task,
  onStart,
  onComplete,
  onToggleStar,
  locked,
  lockReason,
  timerEndsAt,
}: Props) {
  const colors = useColors();
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (!timerEndsAt) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [timerEndsAt]);

  const apps = task.appIds.map(getAppById).filter(Boolean).slice(0, 5);
  const more = task.appIds.length - apps.length;
  const isCompleted = !!task.completedAt;
  const isStarted = !!task.startedAt && !isCompleted;
  const isEssential = task.category === "essential";

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: isCompleted ? colors.muted : colors.card,
          borderColor: isEssential ? colors.primary : colors.border,
          borderWidth: isEssential ? 1.5 : 1,
          opacity: locked ? 0.6 : 1,
        },
      ]}
    >
      <View style={styles.headerRow}>
        <View style={styles.titleCol}>
          <View style={styles.badgeRow}>
            <View
              style={[
                styles.badge,
                {
                  backgroundColor: isEssential
                    ? colors.primary + "33"
                    : colors.accent + "22",
                  borderColor: isEssential ? colors.primary : colors.accent,
                },
              ]}
            >
              <Text
                style={[
                  styles.badgeText,
                  { color: isEssential ? colors.primary : colors.accent },
                ]}
              >
                {isEssential ? "ضرورية" : "اختيارية"}
              </Text>
            </View>
            {task.repeatMode === "days" && task.daysCount > 0 ? (
              <View
                style={[styles.badge, { backgroundColor: colors.secondary }]}
              >
                <Text
                  style={[styles.badgeText, { color: colors.foreground }]}
                >
                  {task.daysRemaining}/{task.daysCount} يوم
                </Text>
              </View>
            ) : null}
            {task.durationMinutes ? (
              <View
                style={[styles.badge, { backgroundColor: colors.secondary }]}
              >
                <Feather
                  name="clock"
                  size={11}
                  color={colors.mutedForeground}
                />
                <Text
                  style={[styles.badgeText, { color: colors.foreground }]}
                >
                  {task.durationMinutes} دقيقة
                </Text>
              </View>
            ) : null}
          </View>
          <Text
            style={[
              styles.title,
              {
                color: colors.foreground,
                textDecorationLine: isCompleted ? "line-through" : "none",
                opacity: isCompleted ? 0.6 : 1,
              },
            ]}
          >
            {task.title}
          </Text>
        </View>

        {task.repeatMode === "star" ? (
          <PressableScale
            onPress={onToggleStar}
            style={[
              styles.starBtn,
              {
                backgroundColor: task.starOn
                  ? colors.warning + "22"
                  : colors.secondary,
                borderColor: task.starOn ? colors.warning : colors.border,
              },
            ]}
          >
            <Feather
              name="star"
              size={20}
              color={task.starOn ? colors.warning : colors.mutedForeground}
            />
          </PressableScale>
        ) : null}
      </View>

      {apps.length > 0 ? (
        <View style={styles.appsRow}>
          <Text style={[styles.appsLabel, { color: colors.mutedForeground }]}>
            التطبيقات المسموحة
          </Text>
          <View style={styles.appsChips}>
            {more > 0 ? (
              <View
                style={[
                  styles.moreChip,
                  { backgroundColor: colors.secondary, borderColor: colors.border },
                ]}
              >
                <Text style={[styles.moreText, { color: colors.foreground }]}>
                  +{more}
                </Text>
              </View>
            ) : null}
            {apps.map((a) => (
              <AppIcon key={a!.id} app={a!} size={36} />
            ))}
          </View>
        </View>
      ) : null}

      {isStarted && timerEndsAt ? (
        <View
          style={[
            styles.timerBanner,
            { backgroundColor: colors.accent + "18", borderColor: colors.accent },
          ]}
        >
          <Feather name="zap" size={16} color={colors.accent} />
          <Text style={[styles.timerText, { color: colors.accent }]}>
            متبقي {formatRemaining(timerEndsAt - now)}
          </Text>
        </View>
      ) : null}

      {locked && !isCompleted ? (
        <View
          style={[
            styles.lockBanner,
            { backgroundColor: colors.muted, borderColor: colors.border },
          ]}
        >
          <Feather name="lock" size={14} color={colors.mutedForeground} />
          <Text style={[styles.lockText, { color: colors.mutedForeground }]}>
            {lockReason || "أكمل المهام الضرورية أولًا"}
          </Text>
        </View>
      ) : null}

      {!isCompleted ? (
        <View style={styles.actions}>
          {!isStarted ? (
            <PressableScale
              onPress={onStart}
              disabled={locked}
              style={[
                styles.actionBtn,
                {
                  backgroundColor: locked ? colors.secondary : colors.primary,
                },
              ]}
            >
              <Feather
                name="play"
                size={16}
                color={locked ? colors.mutedForeground : "#FFFFFF"}
              />
              <Text
                style={[
                  styles.actionText,
                  { color: locked ? colors.mutedForeground : "#FFFFFF" },
                ]}
              >
                ابدأ المهمة
              </Text>
            </PressableScale>
          ) : (
            <PressableScale
              onPress={onComplete}
              style={[
                styles.actionBtn,
                { backgroundColor: colors.success },
              ]}
            >
              <Feather name="check" size={16} color="#FFFFFF" />
              <Text style={[styles.actionText, { color: "#FFFFFF" }]}>
                أكدت الإنجاز
              </Text>
            </PressableScale>
          )}
        </View>
      ) : (
        <View
          style={[
            styles.doneBanner,
            { backgroundColor: colors.success + "1A", borderColor: colors.success },
          ]}
        >
          <Feather name="check-circle" size={16} color={colors.success} />
          <Text style={[styles.doneText, { color: colors.success }]}>
            مكتملة اليوم
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 22,
    padding: 16,
    gap: 14,
  },
  headerRow: {
    flexDirection: "row-reverse",
    alignItems: "flex-start",
    gap: 12,
  },
  titleCol: {
    flex: 1,
    gap: 8,
  },
  badgeRow: {
    flexDirection: "row-reverse",
    flexWrap: "wrap",
    gap: 6,
  },
  badge: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "transparent",
  },
  badgeText: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
  },
  title: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
    textAlign: "right",
    lineHeight: 26,
  },
  starBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  appsRow: {
    gap: 8,
  },
  appsLabel: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
    textAlign: "right",
  },
  appsChips: {
    flexDirection: "row-reverse",
    gap: 6,
    flexWrap: "wrap",
  },
  moreChip: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  moreText: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
  },
  timerBanner: {
    flexDirection: "row-reverse",
    gap: 8,
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  timerText: {
    fontFamily: "Inter_700Bold",
    fontSize: 14,
  },
  lockBanner: {
    flexDirection: "row-reverse",
    gap: 6,
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  lockText: {
    fontFamily: "Inter_500Medium",
    fontSize: 12,
  },
  actions: {
    flexDirection: "row-reverse",
    gap: 8,
  },
  actionBtn: {
    flex: 1,
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    borderRadius: 14,
  },
  actionText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
  },
  doneBanner: {
    flexDirection: "row-reverse",
    gap: 8,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  doneText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
  },
});
