import type { AppItem } from "./types";

export const MOCK_APPS: AppItem[] = [
  { id: "whatsapp", name: "واتساب", icon: "message-circle", color: "#25D366" },
  { id: "instagram", name: "إنستجرام", icon: "instagram", color: "#E1306C" },
  { id: "facebook", name: "فيسبوك", icon: "facebook", color: "#1877F2" },
  { id: "twitter", name: "إكس", icon: "twitter", color: "#1DA1F2" },
  { id: "youtube", name: "يوتيوب", icon: "youtube", color: "#FF0000" },
  { id: "tiktok", name: "تيك توك", icon: "music", color: "#000000" },
  { id: "telegram", name: "تيليجرام", icon: "send", color: "#0088CC" },
  { id: "snapchat", name: "سناب شات", icon: "camera", color: "#FFFC00" },
  { id: "spotify", name: "سبوتيفاي", icon: "headphones", color: "#1DB954" },
  { id: "netflix", name: "نتفليكس", icon: "film", color: "#E50914" },
  { id: "chrome", name: "كروم", icon: "globe", color: "#4285F4" },
  { id: "gmail", name: "جيميل", icon: "mail", color: "#EA4335" },
  { id: "maps", name: "خرائط", icon: "map", color: "#34A853" },
  { id: "calendar", name: "التقويم", icon: "calendar", color: "#FBBC04" },
  { id: "notes", name: "الملاحظات", icon: "edit-3", color: "#FFCC00" },
  { id: "calculator", name: "الحاسبة", icon: "hash", color: "#6B7280" },
  { id: "camera", name: "الكاميرا", icon: "camera", color: "#374151" },
  { id: "gallery", name: "المعرض", icon: "image", color: "#A855F7" },
  { id: "phone", name: "الهاتف", icon: "phone", color: "#10B981" },
  { id: "messages", name: "الرسائل", icon: "message-square", color: "#3B82F6" },
  { id: "settings", name: "الإعدادات", icon: "settings", color: "#64748B" },
  { id: "playstore", name: "متجر بلاي", icon: "shopping-bag", color: "#34A853" },
];

export const getAppById = (id: string): AppItem | undefined =>
  MOCK_APPS.find((a) => a.id === id);
