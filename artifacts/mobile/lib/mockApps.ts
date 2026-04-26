import type { AppItem } from "./types";

// A curated list of common apps shown in WEB PREVIEW so the user can pick
// without typing. On a real Android APK, the list is replaced by the actual
// installed apps from the device.
export const SUGGESTED_APPS: AppItem[] = [
  { id: "whatsapp", name: "واتساب", icon: "message-circle", color: "#25D366" },
  { id: "instagram", name: "إنستجرام", icon: "instagram", color: "#E1306C" },
  { id: "youtube", name: "يوتيوب", icon: "youtube", color: "#FF0000" },
  { id: "tiktok", name: "تيك توك", icon: "music", color: "#111111" },
  { id: "facebook", name: "فيسبوك", icon: "facebook", color: "#1877F2" },
  { id: "twitter", name: "إكس", icon: "twitter", color: "#1DA1F2" },
  { id: "snapchat", name: "سناب شات", icon: "camera", color: "#FFFC00" },
  { id: "telegram", name: "تليجرام", icon: "send", color: "#0088CC" },
  { id: "messenger", name: "ماسنجر", icon: "message-square", color: "#0084FF" },
  { id: "chrome", name: "كروم", icon: "globe", color: "#4285F4" },
  { id: "gmail", name: "جيميل", icon: "mail", color: "#D44638" },
  { id: "maps", name: "خرائط", icon: "map", color: "#34A853" },
  { id: "spotify", name: "سبوتيفاي", icon: "headphones", color: "#1DB954" },
  { id: "anghami", name: "أنغامي", icon: "music", color: "#7B1FA2" },
  { id: "netflix", name: "نتفلكس", icon: "video", color: "#E50914" },
  { id: "shahid", name: "شاهد", icon: "play-circle", color: "#FF3D00" },
  { id: "watchit", name: "WatchIt", icon: "play-circle", color: "#FFB300" },
  { id: "amazon", name: "أمازون", icon: "shopping-bag", color: "#FF9900" },
  { id: "noon", name: "نون", icon: "shopping-bag", color: "#FEEE00" },
  { id: "talabat", name: "طلبات", icon: "coffee", color: "#FF5A00" },
  { id: "uber", name: "أوبر", icon: "map", color: "#000000" },
  { id: "careem", name: "كريم", icon: "map", color: "#0CAF60" },
  { id: "instapay", name: "InstaPay", icon: "send", color: "#9C27B0" },
  { id: "vodafone", name: "Ana Vodafone", icon: "phone", color: "#E60000" },
  { id: "we", name: "My WE", icon: "phone", color: "#7B1FA2" },
  { id: "orange", name: "Orange", icon: "phone", color: "#FF7900" },
  { id: "etisalat", name: "Etisalat", icon: "phone", color: "#E2BD00" },
  { id: "linkedin", name: "لينكدإن", icon: "briefcase", color: "#0A66C2" },
  { id: "discord", name: "ديسكورد", icon: "headphones", color: "#5865F2" },
  { id: "twitch", name: "تويتش", icon: "video", color: "#9146FF" },
  { id: "reddit", name: "ريديت", icon: "globe", color: "#FF4500" },
  { id: "pinterest", name: "بينترست", icon: "image", color: "#E60023" },
  { id: "calendar", name: "تقويم", icon: "calendar", color: "#4285F4" },
  { id: "camera", name: "الكاميرا", icon: "camera", color: "#607D8B" },
  { id: "phone", name: "الهاتف", icon: "phone", color: "#34A853" },
  { id: "settings", name: "الإعدادات", icon: "smartphone", color: "#9E9E9E" },
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
