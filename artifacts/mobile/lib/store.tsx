import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { SUGGESTED_APPS, getAppFromList } from "./mockApps";
import type {
  AppItem,
  AppPermissionKey,
  AppState,
  RepeatMode,
  Task,
} from "./types";

const STORAGE_KEY = "@hayati/state/v3";

const defaultState: AppState = {
  passphrase: null,
  passphraseSetAt: null,
  passphraseLastChangedAt: null,
  tasks: [],
  customApps: [],
  activeTimerTaskId: null,
  timerStartAt: null,
  lastDailyPlanDate: null,
  lastEveningPromptDate: null,
  permissionsGranted: {},
};

function newId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
}

function todayKey(d = new Date()): string {
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

function dayDiff(a: string, b: string): number {
  const [ay, am, ad] = a.split("-").map(Number);
  const [by, bm, bd] = b.split("-").map(Number);
  const da = new Date(ay, am - 1, ad).getTime();
  const db = new Date(by, bm - 1, bd).getTime();
  return Math.round((db - da) / (24 * 60 * 60 * 1000));
}

type Ctx = {
  state: AppState;
  ready: boolean;
  allApps: () => AppItem[];
  getApp: (id: string) => AppItem | undefined;
  addCustomApp: (
    name: string,
    color: string,
    icon: string
  ) => Promise<AppItem>;
  setPassphrase: (phrase: string) => Promise<void>;
  changePassphrase: (
    oldPhrase: string,
    newPhrase: string
  ) => Promise<{ ok: boolean; reason?: string }>;
  canChangePassphrase: () => { ok: boolean; reason?: string };
  setPermission: (key: AppPermissionKey, value: boolean) => Promise<void>;
  addTask: (input: {
    title: string;
    category: "essential" | "optional";
    appIds: string[];
    durationMinutes: number | null;
    repeatMode: RepeatMode;
    daysCount: number;
  }) => Promise<Task>;
  toggleStar: (taskId: string) => Promise<{ ok: boolean; reason?: string }>;
  startTask: (taskId: string) => Promise<void>;
  completeTask: (
    taskId: string,
    phrase: string
  ) => Promise<{ ok: boolean; reason?: string }>;
  stopTimer: () => Promise<void>;
  visibleTodayTasks: () => Task[];
  essentialsRemaining: () => Task[];
  allEssentialsDone: () => boolean;
  blockedAppIds: () => Set<string>;
  shouldShowDailyPlan: () => boolean;
  markDailyPlanShown: () => Promise<void>;
  shouldShowEveningPrompt: () => boolean;
  markEveningPromptShown: () => Promise<void>;
};

const StoreContext = createContext<Ctx | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(defaultState);
  const [ready, setReady] = useState(false);
  const stateRef = useRef(state);
  stateRef.current = state;

  const persist = useCallback(async (next: AppState) => {
    setState(next);
    stateRef.current = next;
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {}
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as AppState;
          setState({ ...defaultState, ...parsed });
        }
      } catch {}
      setReady(true);
    })();
  }, []);

  // Daily cleanup loop — runs every minute
  // - star: if completed, repeats ONCE the next day, then becomes done permanently
  // - days: counts down each day
  // - non-repeating completed tasks: removed the next day
  // - non-repeating uncompleted tasks: kept (still pending)
  useEffect(() => {
    if (!ready) return;
    const tick = async () => {
      const cur = stateRef.current;
      const today = todayKey();
      let changed = false;
      const tasks: Task[] = [];

      for (const t of cur.tasks) {
        if (t.lastResetDate === today) {
          tasks.push(t);
          continue;
        }

        // Task was created today — initialize lastResetDate
        if (t.createdDate === today && !t.lastResetDate) {
          tasks.push({ ...t, lastResetDate: today });
          changed = true;
          continue;
        }

        if (t.completedAt) {
          if (t.repeatMode === "star" && t.starOn && !t.starRepeatUsed) {
            // Star = ONE-day repeat: revive tomorrow once, mark used
            tasks.push({
              ...t,
              completedAt: null,
              startedAt: null,
              starRepeatUsed: true,
              starLockedDate: null,
              lastResetDate: today,
            });
            changed = true;
            continue;
          }
          if (t.repeatMode === "days" && t.daysRemaining > 1) {
            tasks.push({
              ...t,
              completedAt: null,
              startedAt: null,
              starLockedDate: null,
              daysRemaining: t.daysRemaining - 1,
              lastResetDate: today,
            });
            changed = true;
            continue;
          }
          // Otherwise: completed task is REMOVED the next day
          changed = true;
          continue;
        } else {
          // Not completed: lock star if applicable
          let next = { ...t };
          if (t.repeatMode === "star" && t.starOn && !t.starLockedDate) {
            next.starLockedDate = today;
          }
          next.lastResetDate = today;
          tasks.push(next);
          changed = true;
        }
      }

      if (changed) await persist({ ...cur, tasks });
    };
    tick();
    const id = setInterval(tick, 60_000);
    return () => clearInterval(id);
  }, [ready, persist]);

  // Auto-stop timer when expired
  useEffect(() => {
    if (!state.activeTimerTaskId || !state.timerStartAt) return;
    const task = state.tasks.find((t) => t.id === state.activeTimerTaskId);
    if (!task || !task.durationMinutes) return;
    const endAt = state.timerStartAt + task.durationMinutes * 60_000;
    const remaining = endAt - Date.now();
    if (remaining <= 0) {
      persist({ ...state, activeTimerTaskId: null, timerStartAt: null });
      return;
    }
    const id = setTimeout(() => {
      persist({
        ...stateRef.current,
        activeTimerTaskId: null,
        timerStartAt: null,
      });
    }, remaining);
    return () => clearTimeout(id);
  }, [state.activeTimerTaskId, state.timerStartAt, state.tasks, persist, state]);

  const allApps = useCallback((): AppItem[] => {
    return [...stateRef.current.customApps, ...SUGGESTED_APPS];
  }, []);

  const getApp = useCallback((id: string): AppItem | undefined => {
    return getAppFromList(id, [stateRef.current.customApps, SUGGESTED_APPS]);
  }, []);

  const addCustomApp = useCallback(
    async (name: string, color: string, icon: string) => {
      const app: AppItem = {
        id: "c_" + newId(),
        name: name.trim(),
        color,
        icon,
        custom: true,
      };
      await persist({
        ...stateRef.current,
        customApps: [app, ...stateRef.current.customApps],
      });
      return app;
    },
    [persist]
  );

  const setPassphrase = useCallback(
    async (phrase: string) => {
      const now = Date.now();
      await persist({
        ...stateRef.current,
        passphrase: phrase.trim(),
        passphraseSetAt: now,
        passphraseLastChangedAt: now,
      });
    },
    [persist]
  );

  const canChangePassphrase = useCallback((): {
    ok: boolean;
    reason?: string;
  } => {
    const cur = stateRef.current;
    if (!cur.passphraseLastChangedAt) return { ok: true };
    const now = new Date();
    if (now.getDate() !== 1)
      return { ok: false, reason: "متاح فقط أول يوم في الشهر" };
    if (now.getHours() !== 4)
      return { ok: false, reason: "النافذة الساعة 4 صباحًا" };
    if (now.getMinutes() > 0)
      return { ok: false, reason: "دقيقة واحدة فقط بين 4:00 و 4:01" };
    const last = new Date(cur.passphraseLastChangedAt);
    if (
      last.getFullYear() === now.getFullYear() &&
      last.getMonth() === now.getMonth()
    ) {
      return { ok: false, reason: "تم التغيير هذا الشهر بالفعل" };
    }
    return { ok: true };
  }, []);

  const changePassphrase = useCallback(
    async (oldPhrase: string, newPhrase: string) => {
      const cur = stateRef.current;
      if (!cur.passphrase) return { ok: false, reason: "لم يتم ضبط كلمة بعد" };
      if (cur.passphrase !== oldPhrase.trim())
        return { ok: false, reason: "كلمة التأكيد الحالية غير صحيحة" };
      const allowed = canChangePassphrase();
      if (!allowed.ok) return allowed;
      if (newPhrase.trim().length < 3)
        return { ok: false, reason: "كلمة التأكيد قصيرة جدًا" };
      await persist({
        ...cur,
        passphrase: newPhrase.trim(),
        passphraseLastChangedAt: Date.now(),
      });
      return { ok: true };
    },
    [persist, canChangePassphrase]
  );

  const setPermission = useCallback(
    async (key: AppPermissionKey, value: boolean) => {
      await persist({
        ...stateRef.current,
        permissionsGranted: {
          ...stateRef.current.permissionsGranted,
          [key]: value,
        },
      });
    },
    [persist]
  );

  const addTask = useCallback(
    async (input: {
      title: string;
      category: "essential" | "optional";
      appIds: string[];
      durationMinutes: number | null;
      repeatMode: RepeatMode;
      daysCount: number;
    }) => {
      const now = Date.now();
      const today = todayKey();
      const task: Task = {
        id: newId(),
        title: input.title.trim(),
        category: input.category,
        appIds: input.appIds,
        durationMinutes: input.durationMinutes,
        repeatMode: input.repeatMode,
        starOn: input.repeatMode === "star",
        daysCount: input.repeatMode === "days" ? Math.max(1, input.daysCount) : 0,
        daysRemaining:
          input.repeatMode === "days" ? Math.max(1, input.daysCount) : 0,
        starRepeatUsed: false,
        createdDate: today,
        createdAt: now,
        startedAt: null,
        completedAt: null,
        lastResetDate: today,
        starLockedDate: null,
      };
      await persist({
        ...stateRef.current,
        tasks: [task, ...stateRef.current.tasks],
      });
      return task;
    },
    [persist]
  );

  const toggleStar = useCallback(
    async (taskId: string) => {
      const cur = stateRef.current;
      const task = cur.tasks.find((t) => t.id === taskId);
      if (!task) return { ok: false, reason: "غير موجود" };
      if (task.repeatMode !== "star")
        return { ok: false, reason: "هذه المهمة بنظام عدد أيام" };
      const today = todayKey();
      if (task.starLockedDate === today)
        return { ok: false, reason: "تم قفل النجمة بعد منتصف الليل" };
      const tasks = cur.tasks.map((t) =>
        t.id === taskId ? { ...t, starOn: !t.starOn } : t
      );
      await persist({ ...cur, tasks });
      return { ok: true };
    },
    [persist]
  );

  const startTask = useCallback(
    async (taskId: string) => {
      const cur = stateRef.current;
      const task = cur.tasks.find((t) => t.id === taskId);
      if (!task) return;
      const tasks = cur.tasks.map((t) =>
        t.id === taskId && !t.startedAt ? { ...t, startedAt: Date.now() } : t
      );
      const next: AppState = { ...cur, tasks };
      if (task.durationMinutes && task.durationMinutes > 0) {
        next.activeTimerTaskId = taskId;
        next.timerStartAt = Date.now();
      }
      await persist(next);
    },
    [persist]
  );

  const stopTimer = useCallback(async () => {
    await persist({
      ...stateRef.current,
      activeTimerTaskId: null,
      timerStartAt: null,
    });
  }, [persist]);

  const completeTask = useCallback(
    async (taskId: string, phrase: string) => {
      const cur = stateRef.current;
      if (!cur.passphrase)
        return {
          ok: false,
          reason: "اضبط كلمة التأكيد من الإعدادات أولًا",
        };
      if (cur.passphrase !== phrase.trim())
        return { ok: false, reason: "كلمة التأكيد غير مطابقة" };
      const tasks = cur.tasks.map((t) =>
        t.id === taskId ? { ...t, completedAt: Date.now() } : t
      );
      const next: AppState = { ...cur, tasks };
      if (cur.activeTimerTaskId === taskId) {
        next.activeTimerTaskId = null;
        next.timerStartAt = null;
      }
      await persist(next);
      return { ok: true };
    },
    [persist]
  );

  const visibleTodayTasks = useCallback((): Task[] => {
    return stateRef.current.tasks.filter((t) => {
      if (t.completedAt) return true;
      if (t.repeatMode === "days" && t.daysRemaining <= 0) return false;
      return true;
    });
  }, []);

  const essentialsRemaining = useCallback((): Task[] => {
    return stateRef.current.tasks.filter(
      (t) => t.category === "essential" && !t.completedAt
    );
  }, []);

  const allEssentialsDone = useCallback((): boolean => {
    return essentialsRemaining().length === 0;
  }, [essentialsRemaining]);

  // Apps that are ALLOWED right now (whitelist). The native blocker should
  // block all OTHER apps. If essentials are still pending, only essential-task
  // apps are allowed; once essentials are done, optional-task apps unlock too.
  const blockedAppIds = useCallback((): Set<string> => {
    const cur = stateRef.current;
    const essentialsPending = cur.tasks.some(
      (t) => t.category === "essential" && !t.completedAt
    );
    const allowed = new Set<string>();
    for (const t of cur.tasks) {
      if (t.completedAt) continue;
      if (essentialsPending && t.category !== "essential") continue;
      for (const id of t.appIds) allowed.add(id);
    }
    return allowed;
  }, []);

  const shouldShowDailyPlan = useCallback((): boolean => {
    const cur = stateRef.current;
    const now = new Date();
    const hour = now.getHours();
    const today = todayKey(now);
    if (cur.lastDailyPlanDate === today) return false;
    if (hour < 9) return false;
    return true;
  }, []);

  const markDailyPlanShown = useCallback(async () => {
    await persist({ ...stateRef.current, lastDailyPlanDate: todayKey() });
  }, [persist]);

  const shouldShowEveningPrompt = useCallback((): boolean => {
    const cur = stateRef.current;
    const now = new Date();
    const hour = now.getHours();
    const today = todayKey(now);
    if (cur.lastEveningPromptDate === today) return false;
    if (hour < 19) return false;
    if (cur.tasks.length === 0) return false;
    const allDone = cur.tasks.every((t) => t.completedAt);
    if (!allDone) return false;
    return true;
  }, []);

  const markEveningPromptShown = useCallback(async () => {
    await persist({ ...stateRef.current, lastEveningPromptDate: todayKey() });
  }, [persist]);

  const value = useMemo<Ctx>(
    () => ({
      state,
      ready,
      allApps,
      getApp,
      addCustomApp,
      setPassphrase,
      changePassphrase,
      canChangePassphrase,
      setPermission,
      addTask,
      toggleStar,
      startTask,
      completeTask,
      stopTimer,
      visibleTodayTasks,
      essentialsRemaining,
      allEssentialsDone,
      blockedAppIds,
      shouldShowDailyPlan,
      markDailyPlanShown,
      shouldShowEveningPrompt,
      markEveningPromptShown,
    }),
    [
      state,
      ready,
      allApps,
      getApp,
      addCustomApp,
      setPassphrase,
      changePassphrase,
      canChangePassphrase,
      setPermission,
      addTask,
      toggleStar,
      startTask,
      completeTask,
      stopTimer,
      visibleTodayTasks,
      essentialsRemaining,
      allEssentialsDone,
      blockedAppIds,
      shouldShowDailyPlan,
      markDailyPlanShown,
      shouldShowEveningPrompt,
      markEveningPromptShown,
    ]
  );

  return (
    <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
  );
}

export function useStore(): Ctx {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be inside StoreProvider");
  return ctx;
}

export { todayKey };
