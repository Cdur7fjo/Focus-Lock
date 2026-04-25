export type AppItem = {
  id: string;
  name: string;
  icon: string;
  color: string;
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
  createdAt: number;
  startedAt: number | null;
  completedAt: number | null;
  lastResetDate: string | null;
  starLockedDate: string | null;
};

export type AppState = {
  passphrase: string | null;
  passphraseSetAt: number | null;
  passphraseLastChangedAt: number | null;
  tasks: Task[];
  activeTimerTaskId: string | null;
  timerStartAt: number | null;
};
