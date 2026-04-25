import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Redirect } from "expo-router";
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

import { AnimatedGradient } from "@/components/AnimatedGradient";
import { PressableScale } from "@/components/PressableScale";
import { useColors } from "@/hooks/useColors";
import { useStore } from "@/lib/store";

export default function OnboardingScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { state, ready, setPassphrase } = useStore();
  const [phrase, setPhrase] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);

  if (!ready) return null;
  if (state.passphrase) return <Redirect href="/(tabs)" />;

  const handleSave = async () => {
    if (phrase.trim().length < 3) {
      setError("اكتب كلمة أو جملة لا تقل عن 3 حروف");
      return;
    }
    if (phrase.trim() !== confirm.trim()) {
      setError("النصان غير متطابقين");
      return;
    }
    await setPassphrase(phrase);
  };

  const topPad = Platform.OS === "web" ? 67 : insets.top + 12;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom + 16;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: topPad,
          paddingBottom: bottomPad,
          paddingHorizontal: 22,
          gap: 22,
          flexGrow: 1,
        }}
        keyboardShouldPersistTaps="handled"
      >
        <AnimatedGradient style={styles.heroBox}>
          <View style={styles.heroOverlay} />
          <View style={styles.heroInner}>
            <View style={styles.logoWrap}>
              <LinearGradient
                colors={["#FFFFFF22", "#FFFFFF08"]}
                style={styles.logo}
              >
                <Feather name="shield" size={36} color="#FFFFFF" />
              </LinearGradient>
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
            <View
              style={[styles.iconCircle, { backgroundColor: colors.primary }]}
            >
              <Feather name="key" size={20} color="#FFFFFF" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.cardTitle, { color: colors.foreground }]}>
                اضبط كلمة التأكيد
              </Text>
              <Text style={[styles.cardSub, { color: colors.mutedForeground }]}>
                ستكتب هذه الكلمة كل مرة تؤكد فيها إنجاز مهمة
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
              يمكنك تغييرها مرة واحدة شهريًا فقط، يوم 1 الساعة 4:00 صباحًا.
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
                if (error) setError(null);
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
                if (error) setError(null);
              }}
              placeholder="نفس النص بالضبط"
              placeholderTextColor={colors.mutedForeground}
              style={[
                styles.input,
                {
                  backgroundColor: colors.background,
                  color: colors.foreground,
                  borderColor: error ? colors.destructive : colors.border,
                },
              ]}
              textAlign="right"
            />
          </View>

          {error ? (
            <Text style={[styles.error, { color: colors.destructive }]}>
              {error}
            </Text>
          ) : null}

          <PressableScale
            onPress={handleSave}
            style={[styles.cta, { backgroundColor: colors.primary }]}
          >
            <Text style={styles.ctaText}>ابدأ نظامي</Text>
            <Feather name="arrow-left" size={18} color="#FFFFFF" />
          </PressableScale>
        </View>

        <View style={styles.featuresRow}>
          {[
            { icon: "check-circle", label: "مهام ضرورية" },
            { icon: "clock", label: "مؤقت دقيق" },
            { icon: "lock", label: "حظر التطبيقات" },
          ].map((f) => (
            <View
              key={f.label}
              style={[
                styles.featureChip,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
            >
              <Feather
                name={f.icon as keyof typeof Feather.glyphMap}
                size={16}
                color={colors.accent}
              />
              <Text style={[styles.featureText, { color: colors.foreground }]}>
                {f.label}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  heroBox: {
    height: 240,
    borderRadius: 28,
    overflow: "hidden",
    justifyContent: "flex-end",
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(11,15,26,0.35)",
  },
  heroInner: {
    padding: 24,
    gap: 8,
    alignItems: "flex-end",
  },
  logoWrap: {
    marginBottom: 12,
  },
  logo: {
    width: 72,
    height: 72,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
  },
  heroTitle: {
    color: "#FFFFFF",
    fontSize: 36,
    fontFamily: "Inter_700Bold",
    textAlign: "right",
  },
  heroSub: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 15,
    fontFamily: "Inter_500Medium",
    textAlign: "right",
  },
  card: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 20,
    gap: 14,
  },
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
  fieldGroup: {
    gap: 6,
  },
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
  error: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    textAlign: "right",
  },
  cta: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
    borderRadius: 16,
  },
  ctaText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: "Inter_700Bold",
  },
  featuresRow: {
    flexDirection: "row-reverse",
    gap: 8,
    flexWrap: "wrap",
  },
  featureChip: {
    flex: 1,
    minWidth: 100,
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  featureText: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
  },
});
