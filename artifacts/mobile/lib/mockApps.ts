import type { AppItem } from "./types";

// A short list of common Egyptian/Arabic-region apps as STARTING SUGGESTIONS only.
// The user adds their own apps from their phone via the picker.
export const SUGGESTED_APPS: AppItem[] = [
  { id: "whatsapp", name: "واتساب", icon: "message-circle", color: "#25D366" },
  { id: "instagram", name: "إنستجرام", icon: "instagram", color: "#E1306C" },
  { id: "youtube", name: "يوتيوب", icon: "youtube", color: "#FF0000" },
  { id: "tiktok", name: "تيك توك", icon: "music", color: "#111111" },
  { id: "facebook", name: "فيسبوك", icon: "facebook", color: "#1877F2" },
  { id: "twitter", name: "إكس", icon: "twitter", color: "#1DA1F2" },
];

// Color palette to auto-assign to user's custom apps
export const APP_COLORS = [
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
  "#F472B6",
  "#A855F7",
];

export const APP_ICONS = [
  "smartphone",
  "globe",
  "book",
  "play-circle",
  "music",
  "video",
  "image",
  "shopping-bag",
  "coffee",
  "heart",
  "star",
  "zap",
  "send",
  "mail",
  "phone",
  "camera",
  "headphones",
  "map",
  "calendar",
  "briefcase",
];

export function getAppFromList(id: string, lists: AppItem[][]): AppItem | undefined {
  for (const list of lists) {
    const found = list.find((a) => a.id === id);
    if (found) return found;
  }
  return undefined;
}
