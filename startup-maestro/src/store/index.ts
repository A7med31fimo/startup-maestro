import { create } from "zustand";
import { AppConfig, LogEntry, NavSection, WorkflowStatus } from "../types";
import { api } from "../utils/api";

interface AppStore {
  // Navigation
  activeSection: NavSection;
  setActiveSection: (s: NavSection) => void;

  // Config
  config: AppConfig | null;
  configLoading: boolean;
  configDirty: boolean;
  loadConfig: () => Promise<void>;
  saveConfig: (config: AppConfig) => Promise<void>;
  updateConfig: (updater: (c: AppConfig) => AppConfig) => void;

  // Workflow
  workflowStatus: WorkflowStatus | null;
  workflowPolling: ReturnType<typeof setInterval> | null;
  runWorkflow: () => Promise<void>;
  startStatusPolling: () => void;
  stopStatusPolling: () => void;

  // Logs
  logs: LogEntry[];
  logsLoading: boolean;
  loadLogs: () => Promise<void>;
  clearLogs: () => Promise<void>;
  startLogPolling: () => void;

  // Startup
  startupRegistered: boolean;
  checkStartup: () => Promise<void>;
  setStartupEnabled: (enabled: boolean, minimized: boolean) => Promise<void>;

  // Toast/notifications
  toasts: Toast[];
  addToast: (toast: Omit<Toast, "id">) => void;
  removeToast: (id: string) => void;
}

export interface Toast {
  id: string;
  type: "success" | "error" | "info" | "warning";
  title: string;
  message?: string;
}

let logPollInterval: ReturnType<typeof setInterval> | null = null;

export const useStore = create<AppStore>((set, get) => ({
  // Navigation
  activeSection: "dashboard",
  setActiveSection: (s) => set({ activeSection: s }),

  // Config
  config: null,
  configLoading: false,
  configDirty: false,
  loadConfig: async () => {
    set({ configLoading: true });
    try {
      const config = await api.getConfig();
      set({ config, configLoading: false, configDirty: false });
    } catch (e) {
      set({ configLoading: false });
      get().addToast({ type: "error", title: "Failed to load config", message: String(e) });
    }
  },
  saveConfig: async (config) => {
    try {
      await api.saveConfig(config);
      set({ config, configDirty: false });
      get().addToast({ type: "success", title: "Configuration saved" });
    } catch (e) {
      get().addToast({ type: "error", title: "Failed to save config", message: String(e) });
    }
  },
  updateConfig: (updater) => {
    const config = get().config;
    if (!config) return;
    set({ config: updater(config), configDirty: true });
  },

  // Workflow
  workflowStatus: null,
  workflowPolling: null,
  runWorkflow: async () => {
    try {
      await api.runWorkflow();
      get().addToast({ type: "info", title: "Workflow started", message: "Launching your startup sequence..." });
      get().startStatusPolling();
      get().startLogPolling();
    } catch (e) {
      get().addToast({ type: "error", title: "Workflow failed to start", message: String(e) });
    }
  },
  startStatusPolling: () => {
    const existing = get().workflowPolling;
    if (existing) clearInterval(existing);
    const poll = setInterval(async () => {
      try {
        const status = await api.getWorkflowStatus();
        set({ workflowStatus: status });
        if (!status.is_running) {
          get().stopStatusPolling();
          // Reload config to update last_run
          get().loadConfig();
        }
      } catch {}
    }, 500);
    set({ workflowPolling: poll });
  },
  stopStatusPolling: () => {
    const poll = get().workflowPolling;
    if (poll) clearInterval(poll);
    set({ workflowPolling: null });
  },

  // Logs
  logs: [],
  logsLoading: false,
  loadLogs: async () => {
    set({ logsLoading: true });
    try {
      const logs = await api.getLogs();
      set({ logs: [...logs].reverse(), logsLoading: false });
    } catch {
      set({ logsLoading: false });
    }
  },
  clearLogs: async () => {
    await api.clearLogs();
    set({ logs: [] });
    get().addToast({ type: "info", title: "Logs cleared" });
  },
  startLogPolling: () => {
    if (logPollInterval) clearInterval(logPollInterval);
    logPollInterval = setInterval(() => {
      get().loadLogs();
    }, 1000);
    setTimeout(() => {
      if (logPollInterval) clearInterval(logPollInterval);
    }, 60000);
  },

  // Startup
  startupRegistered: false,
  checkStartup: async () => {
    try {
      const registered = await api.checkStartupStatus();
      set({ startupRegistered: registered });
    } catch {}
  },
  setStartupEnabled: async (enabled, minimized) => {
    try {
      await api.setStartupEnabled(enabled, minimized);
      set({ startupRegistered: enabled });
      get().updateConfig((c) => ({
        ...c,
        settings: { ...c.settings, auto_start_with_windows: enabled, start_minimized: minimized },
      }));
      get().addToast({
        type: "success",
        title: enabled ? "Auto-start enabled" : "Auto-start disabled",
      });
    } catch (e) {
      get().addToast({ type: "error", title: "Failed to update startup setting", message: String(e) });
    }
  },

  // Toasts
  toasts: [],
  addToast: (toast) => {
    const id = Math.random().toString(36).slice(2);
    set((s) => ({ toasts: [...s.toasts, { ...toast, id }] }));
    setTimeout(() => get().removeToast(id), 4000);
  },
  removeToast: (id) =>
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));
