import { AppConfig, LogEntry, WorkflowStatus } from "../types";

export const mockConfig: AppConfig = {
  version: "1.0.0",
  last_run: new Date(Date.now() - 3600000).toISOString(),
  settings: {
    auto_start_with_windows: false,
    start_minimized: false,
    minimize_to_tray: true,
    show_notifications: true,
    theme: "dark",
    chrome_path: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    delay_between_profiles_ms: 1500,
    delay_before_apps_ms: 3000,
  },
  chrome_profiles: [
    {
      id: "p1",
      name: "Personal",
      profile_directory: "Default",
      enabled: true,
      launch_delay_ms: 0,
      chrome_path: null,
      urls: [
        { id: "u1", url: "https://gmail.com",        label: "Gmail",        enabled: true,  order: 0 },
        { id: "u2", url: "https://drive.google.com", label: "Google Drive", enabled: true,  order: 1 },
        { id: "u3", url: "https://web.whatsapp.com", label: "WhatsApp Web", enabled: true,  order: 2 },
      ],
    },
    {
      id: "p2",
      name: "Work",
      profile_directory: "Profile 1",
      enabled: true,
      launch_delay_ms: 2000,
      chrome_path: null,
      urls: [
        { id: "u4", url: "https://slack.com",            label: "Slack",  enabled: true,  order: 0 },
        { id: "u5", url: "https://github.com",           label: "GitHub", enabled: true,  order: 1 },
        { id: "u6", url: "https://jira.atlassian.com",   label: "Jira",   enabled: false, order: 2 },
      ],
    },
    {
      id: "p3",
      name: "Research",
      profile_directory: "Profile 2",
      enabled: true,
      launch_delay_ms: 4000,
      chrome_path: null,
      urls: [
        { id: "u7", url: "https://chat.openai.com",  label: "ChatGPT",     enabled: true, order: 0 },
        { id: "u8", url: "https://docs.google.com",  label: "Google Docs", enabled: true, order: 1 },
        { id: "u9", url: "https://youtube.com",      label: "YouTube",     enabled: true, order: 2 },
      ],
    },
  ],
  desktop_apps: [
    {
      id: "a1",
      name: "VS Code",
      exe_path: "C:\\Program Files\\Microsoft VS Code\\Code.exe",
      args: [],
      launch_delay_ms: 1000,
      enabled: true,
      launch_mode: "normal",
      launch_after_browser: true,
    },
    {
      id: "a2",
      name: "Telegram",
      exe_path: "C:\\Users\\%USERNAME%\\AppData\\Roaming\\Telegram Desktop\\Telegram.exe",
      args: [],
      launch_delay_ms: 2000,
      enabled: false,
      launch_mode: "minimized",
      launch_after_browser: true,
    },
    {
      id: "a3",
      name: "Spotify",
      exe_path: "C:\\Users\\%USERNAME%\\AppData\\Roaming\\Spotify\\Spotify.exe",
      args: [],
      launch_delay_ms: 3000,
      enabled: true,
      launch_mode: "minimized",
      launch_after_browser: true,
    },
  ],
};

export const mockLogs: LogEntry[] = [
  { id: "l1", timestamp: new Date(Date.now() - 5000).toISOString(),  level: "info",    category: "System",   message: "🟢 Startup Maestro initialized" },
  { id: "l2", timestamp: new Date(Date.now() - 4500).toISOString(),  level: "info",    category: "Workflow", message: "🚀 Startup Maestro workflow started" },
  { id: "l3", timestamp: new Date(Date.now() - 4000).toISOString(),  level: "success", category: "Chrome",   message: "✅ Launched Chrome profile 'Personal' with 3 URLs" },
  { id: "l4", timestamp: new Date(Date.now() - 3000).toISOString(),  level: "success", category: "Chrome",   message: "✅ Launched Chrome profile 'Work' with 2 URLs" },
  { id: "l5", timestamp: new Date(Date.now() - 2000).toISOString(),  level: "success", category: "Chrome",   message: "✅ Launched Chrome profile 'Research' with 3 URLs" },
  { id: "l6", timestamp: new Date(Date.now() - 1500).toISOString(),  level: "info",    category: "Apps",     message: "⏱ Waiting 3000ms before launching desktop apps" },
  { id: "l7", timestamp: new Date(Date.now() - 1000).toISOString(),  level: "success", category: "Apps",     message: "✅ Launched VS Code" },
  { id: "l8", timestamp: new Date(Date.now() - 500).toISOString(),   level: "warning", category: "Apps",     message: "⚠ Telegram is disabled — skipping" },
  { id: "l9", timestamp: new Date(Date.now() - 200).toISOString(),   level: "success", category: "Workflow", message: "🎉 Workflow complete — 5 succeeded, 0 failed" },
];

export const mockStatus: WorkflowStatus = {
  is_running: false,
  is_paused: false,
  current_task: null,
  completed_tasks: ["Chrome: Personal", "Chrome: Work", "Chrome: Research", "App: VS Code", "App: Spotify"],
  failed_tasks: [],
  started_at: new Date(Date.now() - 5000).toISOString(),
};
