use serde::{Deserialize, Serialize};
use chrono::{DateTime, Utc};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ChromeProfile {
    pub id: String,
    pub name: String,
    pub profile_directory: String, // e.g. "Default", "Profile 1", "Profile 2"
    pub urls: Vec<ProfileUrl>,
    pub launch_delay_ms: u64,
    pub enabled: bool,
    pub chrome_path: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProfileUrl {
    pub id: String,
    pub url: String,
    pub label: String,
    pub enabled: bool,
    pub order: u32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DesktopApp {
    pub id: String,
    pub name: String,
    pub exe_path: String,
    pub args: Vec<String>,
    pub launch_delay_ms: u64,
    pub enabled: bool,
    pub launch_mode: LaunchMode,
    pub launch_after_browser: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum LaunchMode {
    Normal,
    Minimized,
    Hidden,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StartupSettings {
    pub auto_start_with_windows: bool,
    pub start_minimized: bool,
    pub minimize_to_tray: bool,
    pub show_notifications: bool,
    pub theme: Theme,
    pub chrome_path: String,
    pub delay_between_profiles_ms: u64,
    pub delay_before_apps_ms: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum Theme {
    Dark,
    Light,
}

impl Default for StartupSettings {
    fn default() -> Self {
        Self {
            auto_start_with_windows: false,
            start_minimized: false,
            minimize_to_tray: true,
            show_notifications: true,
            theme: Theme::Dark,
            chrome_path: r"C:\Program Files\Google\Chrome\Application\chrome.exe".to_string(),
            delay_between_profiles_ms: 1500,
            delay_before_apps_ms: 3000,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AppConfig {
    pub version: String,
    pub chrome_profiles: Vec<ChromeProfile>,
    pub desktop_apps: Vec<DesktopApp>,
    pub settings: StartupSettings,
    pub last_run: Option<DateTime<Utc>>,
}

impl Default for AppConfig {
    fn default() -> Self {
        Self {
            version: "1.0.0".to_string(),
            chrome_profiles: vec![
                ChromeProfile {
                    id: uuid::Uuid::new_v4().to_string(),
                    name: "Personal".to_string(),
                    profile_directory: "Default".to_string(),
                    urls: vec![
                        ProfileUrl {
                            id: uuid::Uuid::new_v4().to_string(),
                            url: "https://gmail.com".to_string(),
                            label: "Gmail".to_string(),
                            enabled: true,
                            order: 0,
                        },
                        ProfileUrl {
                            id: uuid::Uuid::new_v4().to_string(),
                            url: "https://drive.google.com".to_string(),
                            label: "Google Drive".to_string(),
                            enabled: true,
                            order: 1,
                        },
                        ProfileUrl {
                            id: uuid::Uuid::new_v4().to_string(),
                            url: "https://web.whatsapp.com".to_string(),
                            label: "WhatsApp Web".to_string(),
                            enabled: true,
                            order: 2,
                        },
                    ],
                    launch_delay_ms: 0,
                    enabled: true,
                    chrome_path: None,
                },
                ChromeProfile {
                    id: uuid::Uuid::new_v4().to_string(),
                    name: "Work".to_string(),
                    profile_directory: "Profile 1".to_string(),
                    urls: vec![
                        ProfileUrl {
                            id: uuid::Uuid::new_v4().to_string(),
                            url: "https://slack.com".to_string(),
                            label: "Slack".to_string(),
                            enabled: true,
                            order: 0,
                        },
                        ProfileUrl {
                            id: uuid::Uuid::new_v4().to_string(),
                            url: "https://github.com".to_string(),
                            label: "GitHub".to_string(),
                            enabled: true,
                            order: 1,
                        },
                        ProfileUrl {
                            id: uuid::Uuid::new_v4().to_string(),
                            url: "https://jira.atlassian.com".to_string(),
                            label: "Jira".to_string(),
                            enabled: true,
                            order: 2,
                        },
                    ],
                    launch_delay_ms: 2000,
                    enabled: true,
                    chrome_path: None,
                },
                ChromeProfile {
                    id: uuid::Uuid::new_v4().to_string(),
                    name: "Research".to_string(),
                    profile_directory: "Profile 2".to_string(),
                    urls: vec![
                        ProfileUrl {
                            id: uuid::Uuid::new_v4().to_string(),
                            url: "https://chat.openai.com".to_string(),
                            label: "ChatGPT".to_string(),
                            enabled: true,
                            order: 0,
                        },
                        ProfileUrl {
                            id: uuid::Uuid::new_v4().to_string(),
                            url: "https://docs.google.com".to_string(),
                            label: "Google Docs".to_string(),
                            enabled: true,
                            order: 1,
                        },
                        ProfileUrl {
                            id: uuid::Uuid::new_v4().to_string(),
                            url: "https://youtube.com".to_string(),
                            label: "YouTube".to_string(),
                            enabled: true,
                            order: 2,
                        },
                    ],
                    launch_delay_ms: 4000,
                    enabled: true,
                    chrome_path: None,
                },
            ],
            desktop_apps: vec![
                DesktopApp {
                    id: uuid::Uuid::new_v4().to_string(),
                    name: "VS Code".to_string(),
                    exe_path: r"C:\Program Files\Microsoft VS Code\Code.exe".to_string(),
                    args: vec![],
                    launch_delay_ms: 1000,
                    enabled: true,
                    launch_mode: LaunchMode::Normal,
                    launch_after_browser: true,
                },
                DesktopApp {
                    id: uuid::Uuid::new_v4().to_string(),
                    name: "Telegram".to_string(),
                    exe_path: r"C:\Users\%USERNAME%\AppData\Roaming\Telegram Desktop\Telegram.exe".to_string(),
                    args: vec![],
                    launch_delay_ms: 2000,
                    enabled: false,
                    launch_mode: LaunchMode::Minimized,
                    launch_after_browser: true,
                },
            ],
            settings: StartupSettings::default(),
            last_run: None,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LogEntry {
    pub id: String,
    pub timestamp: DateTime<Utc>,
    pub level: LogLevel,
    pub category: String,
    pub message: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum LogLevel {
    Info,
    Success,
    Warning,
    Error,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WorkflowStatus {
    pub is_running: bool,
    pub is_paused: bool,
    pub current_task: Option<String>,
    pub completed_tasks: Vec<String>,
    pub failed_tasks: Vec<String>,
    pub started_at: Option<DateTime<Utc>>,
}

impl Default for WorkflowStatus {
    fn default() -> Self {
        Self {
            is_running: false,
            is_paused: false,
            current_task: None,
            completed_tasks: vec![],
            failed_tasks: vec![],
            started_at: None,
        }
    }
}
