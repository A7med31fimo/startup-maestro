import { AppConfig, LogEntry, WorkflowStatus } from "../types";

// Tauri v2 detection
const isTauri = () => typeof (window as any).__TAURI_INTERNALS__ !== "undefined";

async function invoke<T>(cmd: string, args?: Record<string, unknown>): Promise<T> {
  if (isTauri()) {
    // @tauri-apps/api v2 exposes invoke directly from the root package
    const { invoke: tauriInvoke } = await import("@tauri-apps/api/core" as string) as any;
    return tauriInvoke(cmd, args) as T;
  }
  return mockInvoke<T>(cmd, args);
}

import { mockConfig, mockLogs, mockStatus } from "./mock";

async function mockInvoke<T>(cmd: string, _args?: Record<string, unknown>): Promise<T> {
  await new Promise((r) => setTimeout(r, 80));
  switch (cmd) {
    case "get_config":           return mockConfig as unknown as T;
    case "save_config":          return undefined as unknown as T;
    case "run_workflow":         return undefined as unknown as T;
    case "get_workflow_status":  return mockStatus as unknown as T;
    case "get_logs":             return mockLogs as unknown as T;
    case "clear_logs":           return undefined as unknown as T;
    case "check_startup_status": return false as unknown as T;
    case "validate_chrome_path": return true as unknown as T;
    case "validate_exe_path":    return true as unknown as T;
    case "set_startup_enabled":  return undefined as unknown as T;
    case "minimize_to_tray":     return undefined as unknown as T;
    default:                     return undefined as unknown as T;
  }
}

export const api = {
  getConfig:          ()                                          => invoke<AppConfig>("get_config"),
  saveConfig:         (config: AppConfig)                         => invoke<void>("save_config", { config }),
  runWorkflow:        ()                                          => invoke<void>("run_workflow"),
  getWorkflowStatus:  ()                                          => invoke<WorkflowStatus>("get_workflow_status"),
  getLogs:            ()                                          => invoke<LogEntry[]>("get_logs"),
  clearLogs:          ()                                          => invoke<void>("clear_logs"),
  checkStartupStatus: ()                                          => invoke<boolean>("check_startup_status"),
  setStartupEnabled:  (enabled: boolean, startMinimized: boolean) =>
                        invoke<void>("set_startup_enabled", { enabled, startMinimized }),
  validateChromePath: (path: string)                              => invoke<boolean>("validate_chrome_path", { path }),
  validateExePath:    (path: string)                              => invoke<boolean>("validate_exe_path", { path }),
  pickExeFile:        ()                                          => invoke<string | null>("pick_exe_file"),
  minimizeToTray:     ()                                          => invoke<void>("minimize_to_tray"),
  showWindow:         ()                                          => invoke<void>("show_window"),
};
