import { Platform } from "react-native";

import type { AppItem } from "./types";

// Try to load a native module that exposes the user's installed apps.
// In Expo Go and on web, this module isn't bundled — we return null and the UI
// shows a clear notice telling the user to build the APK natively.
//
// When the app is built as a custom native APK with QUERY_ALL_PACKAGES granted,
// the user (or a developer) can drop in `react-native-installed-apps`-style
// module (or a custom Kotlin module) at module name "InstalledApps" exposing
// `getApps(): Promise<{ packageName, appName, icon? }[]>`.
type NativeApp = {
  packageName: string;
  appName: string;
  iconBase64?: string;
};

let cached: AppItem[] | null = null;

const COLORS = [
  "#EF4444",
  "#F97316",
  "#FACC15",
  "#34D399",
  "#10B981",
  "#06B6D4",
  "#3B82F6",
  "#6366F1",
  "#8B5CF6",
  "#EC4899",
];

function pickColor(seed: string): string {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0;
  return COLORS[Math.abs(h) % COLORS.length];
}

export async function loadInstalledApps(): Promise<AppItem[] | null> {
  if (cached) return cached;
  if (Platform.OS !== "android") return null;

  try {
    // Native modules at runtime — wrapped in try/catch since they don't exist
    // in Expo Go.
    const RN = await import("react-native");
    const NM = (RN as { NativeModules?: Record<string, unknown> }).NativeModules;
    const mod = NM?.InstalledApps as
      | { getApps?: () => Promise<NativeApp[]> }
      | undefined;
    if (!mod || typeof mod.getApps !== "function") return null;

    const list = await mod.getApps();
    const items: AppItem[] = list.map((a) => ({
      id: a.packageName,
      name: a.appName,
      icon: a.iconBase64 ? "image" : "smartphone",
      color: pickColor(a.packageName),
    }));
    cached = items;
    return items;
  } catch {
    return null;
  }
}

export function isInstalledAppsAvailable(): boolean {
  return cached !== null && cached.length > 0;
}
