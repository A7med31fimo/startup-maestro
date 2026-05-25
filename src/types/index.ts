export interface ChromeProfile {
  id: string;
  name: string;
  profile_directory: string;
  urls: ProfileUrl[];
  launch_delay_ms: number;
  enabled: boolean;
  chrome_path: string | null;
}

export interface ProfileUrl {
  id: string;
  url: string;
  label: string;
  enabled: boolean;
  order: number;
}

export interface DesktopApp {
  id: string;
  name: string;
  exe_path: string;
  args: string[];
  launch_delay_ms: number;
  enabled: boolean;
  launch_mode: LaunchMode;
  launch_after_browser: boolean;
}

export type LaunchMode = "normal" | "minimized" | "hidden";

export interface StartupSettings {
  auto_start_with_windows: boolean;
  start_minimized: boolean;
  minimize_to_tray: boolean;
  show_notifications: boolean;
  theme: "dark" | "light";
  chrome_path: string;
  delay_between_profiles_ms: number;
  delay_before_apps_ms: number;
}

export interface AppConfig {
  version: string;
  chrome_profiles: ChromeProfile[];
  desktop_apps: DesktopApp[];
  settings: StartupSettings;
  last_run: string | null;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  level: "info" | "success" | "warning" | "error";
  category: string;
  message: string;
}

export interface WorkflowStatus {
  is_running: boolean;
  is_paused: boolean;
  current_task: string | null;
  completed_tasks: string[];
  failed_tasks: string[];
  started_at: string | null;
}

export type NavSection = "dashboard" | "profiles" | "apps" | "logs" | "settings";
