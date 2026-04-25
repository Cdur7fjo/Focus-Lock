export type AppItem = {
  id: string;
  name: string;
  icon: string;
  color: string;
  custom?: boolean;
};

export type RepeatMode = "none" | "star" | "days";

export type Task = {
  id: string;
  title: string;
  category: "essential" | "optional";
  appIds: string[];
  durationMinutes: number | null;
  repeatMode: RepeatMode;
  starOn: boolean;
  daysCount: number;
  daysRemaining: number;
  starRepeatUsed: boolean;
  createdDate: string;
  createdAt: number;
  startedAt: number | null;
  completedAt: number | null;
  lastResetDate: string | null;
  starLockedDate: string | null;
};

export type AppPermissionKey =
  | "deviceAdmin"
  | "accessibility"
  | "overlay"
  | "usageStats"
  | "bootCompleted"
  | "ignoreBattery"
  | "queryPackages"
  | "notifications";

export type AppState = {
  passphrase: string | null;
  passphraseSetAt: number | null;
  passphraseLastChangedAt: number | null;
  tasks: Task[];
  customApps: AppItem[];
  activeTimerTaskId: string | null;
  timerStartAt: number | null;
  lastDailyPlanDate: string | null;
  lastEveningPromptDate: string | null;
  permissionsGranted: Partial<Record<AppPermissionKey, boolean>>;
};
