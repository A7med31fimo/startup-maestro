use std::process::{Command, Stdio};
use std::time::Duration;
use anyhow::{Context, Result};
use chrono::Utc;
use tokio::time::sleep;


use crate::models::{
    AppConfig, ChromeProfile, DesktopApp, LaunchMode, LogEntry, LogLevel, WorkflowStatus,
};
use crate::logs::LogManager;

pub struct AutomationEngine;

impl AutomationEngine {
    /// Run the full startup workflow
    pub async fn run_workflow(
        config: AppConfig,
        log_manager: std::sync::Arc<tokio::sync::Mutex<LogManager>>,
        status_tx: tokio::sync::watch::Sender<WorkflowStatus>,
    ) -> Result<()> {
        let mut status = WorkflowStatus {
            is_running: true,
            is_paused: false,
            current_task: Some("Starting workflow...".to_string()),
            completed_tasks: vec![],
            failed_tasks: vec![],
            started_at: Some(Utc::now()),
        };
        let _ = status_tx.send(status.clone());

        // Log start
        {
            let mut log = log_manager.lock().await;
            log.add(LogEntry {
                id: uuid::Uuid::new_v4().to_string(),
                timestamp: Utc::now(),
                level: LogLevel::Info,
                category: "Workflow".to_string(),
                message: "🚀 Startup Maestro workflow started".to_string(),
            });
        }

        // Sort Chrome profiles by delay
        let mut profiles = config.chrome_profiles.clone();
        profiles.sort_by_key(|p| p.launch_delay_ms);
        let enabled_profiles: Vec<_> = profiles.iter().filter(|p| p.enabled).collect();

        // Launch Chrome profiles
        for profile in &enabled_profiles {
            status.current_task = Some(format!("Launching Chrome: {}", profile.name));
            let _ = status_tx.send(status.clone());

            if profile.launch_delay_ms > 0 {
                let mut log = log_manager.lock().await;
                log.add(LogEntry {
                    id: uuid::Uuid::new_v4().to_string(),
                    timestamp: Utc::now(),
                    level: LogLevel::Info,
                    category: "Chrome".to_string(),
                    message: format!(
                        "⏱ Waiting {}ms before launching {} profile",
                        profile.launch_delay_ms, profile.name
                    ),
                });
                drop(log);
                sleep(Duration::from_millis(profile.launch_delay_ms)).await;
            }

            let chrome_path = profile.chrome_path.as_deref()
                .unwrap_or(&config.settings.chrome_path);

            match Self::launch_chrome_profile(profile, chrome_path) {
                Ok(_) => {
                    status.completed_tasks.push(format!("Chrome: {}", profile.name));
                    let mut log = log_manager.lock().await;
                    log.add(LogEntry {
                        id: uuid::Uuid::new_v4().to_string(),
                        timestamp: Utc::now(),
                        level: LogLevel::Success,
                        category: "Chrome".to_string(),
                        message: format!(
                            "✅ Launched Chrome profile '{}' with {} URLs",
                            profile.name,
                            profile.urls.iter().filter(|u| u.enabled).count()
                        ),
                    });
                }
                Err(e) => {
                    status.failed_tasks.push(format!("Chrome: {}", profile.name));
                    let mut log = log_manager.lock().await;
                    log.add(LogEntry {
                        id: uuid::Uuid::new_v4().to_string(),
                        timestamp: Utc::now(),
                        level: LogLevel::Error,
                        category: "Chrome".to_string(),
                        message: format!(
                            "❌ Failed to launch Chrome profile '{}': {}",
                            profile.name, e
                        ),
                    });
                }
            }

            // Delay between profiles
            if enabled_profiles.len() > 1 && config.settings.delay_between_profiles_ms > 0 {
                sleep(Duration::from_millis(config.settings.delay_between_profiles_ms)).await;
            }
        }

        // Delay before launching apps
        if !config.desktop_apps.is_empty() && config.settings.delay_before_apps_ms > 0 {
            status.current_task = Some("Waiting before launching apps...".to_string());
            let _ = status_tx.send(status.clone());
            {
                let mut log = log_manager.lock().await;
                log.add(LogEntry {
                    id: uuid::Uuid::new_v4().to_string(),
                    timestamp: Utc::now(),
                    level: LogLevel::Info,
                    category: "Apps".to_string(),
                    message: format!(
                        "⏱ Waiting {}ms before launching desktop apps",
                        config.settings.delay_before_apps_ms
                    ),
                });
            }
            sleep(Duration::from_millis(config.settings.delay_before_apps_ms)).await;
        }

        // Sort apps by delay
        let mut apps = config.desktop_apps.clone();
        apps.sort_by_key(|a| a.launch_delay_ms);
        let enabled_apps: Vec<_> = apps.iter().filter(|a| a.enabled).collect();

        // Launch desktop apps
        for app in &enabled_apps {
            status.current_task = Some(format!("Launching app: {}", app.name));
            let _ = status_tx.send(status.clone());

            if app.launch_delay_ms > 0 {
                sleep(Duration::from_millis(app.launch_delay_ms)).await;
            }

            match Self::launch_desktop_app(app) {
                Ok(_) => {
                    status.completed_tasks.push(format!("App: {}", app.name));
                    let mut log = log_manager.lock().await;
                    log.add(LogEntry {
                        id: uuid::Uuid::new_v4().to_string(),
                        timestamp: Utc::now(),
                        level: LogLevel::Success,
                        category: "Apps".to_string(),
                        message: format!("✅ Launched {}", app.name),
                    });
                }
                Err(e) => {
                    status.failed_tasks.push(format!("App: {}", app.name));
                    let mut log = log_manager.lock().await;
                    log.add(LogEntry {
                        id: uuid::Uuid::new_v4().to_string(),
                        timestamp: Utc::now(),
                        level: LogLevel::Error,
                        category: "Apps".to_string(),
                        message: format!("❌ Failed to launch {}: {}", app.name, e),
                    });
                }
            }
        }

        // Mark complete
        status.is_running = false;
        status.current_task = None;
        let _ = status_tx.send(status.clone());

        {
            let mut log = log_manager.lock().await;
            log.add(LogEntry {
                id: uuid::Uuid::new_v4().to_string(),
                timestamp: Utc::now(),
                level: LogLevel::Success,
                category: "Workflow".to_string(),
                message: format!(
                    "🎉 Workflow complete — {} succeeded, {} failed",
                    status.completed_tasks.len(),
                    status.failed_tasks.len()
                ),
            });
        }

        Ok(())
    }

    fn launch_chrome_profile(profile: &ChromeProfile, chrome_exe: &str) -> Result<()> {
        // Validate Chrome exists
        if !std::path::Path::new(chrome_exe).exists() {
            // Try to find Chrome in common locations
            let common_paths = [
                r"C:\Program Files\Google\Chrome\Application\chrome.exe",
                r"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe",
                r"C:\Users\%USERNAME%\AppData\Local\Google\Chrome\Application\chrome.exe",
            ];
            let found = common_paths.iter().any(|p| std::path::Path::new(p).exists());
            if !found {
                return Err(anyhow::anyhow!(
                    "Chrome not found at '{}'. Please update Chrome path in Settings.",
                    chrome_exe
                ));
            }
        }

        // Get enabled URLs in order
        let mut urls: Vec<_> = profile.urls.iter().filter(|u| u.enabled).collect();
        urls.sort_by_key(|u| u.order);
        let url_args: Vec<&str> = urls.iter().map(|u| u.url.as_str()).collect();

        let mut cmd = Command::new(chrome_exe);
        cmd.arg(format!("--profile-directory={}", profile.profile_directory));
        cmd.arg("--no-first-run");
        cmd.arg("--no-default-browser-check");

        // Add all URLs — Chrome opens them as tabs
        for url in &url_args {
            cmd.arg(url);
        }

        cmd.stdin(Stdio::null())
            .stdout(Stdio::null())
            .stderr(Stdio::null());

        #[cfg(target_os = "windows")]
        {
            use std::os::windows::process::CommandExt;
            cmd.creation_flags(0x00000008); // DETACHED_PROCESS
        }

        cmd.spawn().context("Failed to spawn Chrome process")?;
        Ok(())
    }

    fn launch_desktop_app(app: &DesktopApp) -> Result<()> {
        // Expand environment variables in path
        let exe_path = expand_env_vars(&app.exe_path);

        if !std::path::Path::new(&exe_path).exists() {
            return Err(anyhow::anyhow!(
                "Executable not found: '{}'. Please verify the path.",
                exe_path
            ));
        }

        let mut cmd = Command::new(&exe_path);

        for arg in &app.args {
            cmd.arg(expand_env_vars(arg));
        }

        match app.launch_mode {
            LaunchMode::Minimized => {
                #[cfg(target_os = "windows")]
                {
                    use std::os::windows::process::CommandExt;
                    cmd.creation_flags(0x00000020); // CREATE_NEW_CONSOLE with SW_SHOWMINIMIZED
                }
            }
            LaunchMode::Hidden => {
                #[cfg(target_os = "windows")]
                {
                    use std::os::windows::process::CommandExt;
                    cmd.creation_flags(0x08000000); // CREATE_NO_WINDOW
                }
            }
            LaunchMode::Normal => {}
        }

        cmd.stdin(Stdio::null())
            .stdout(Stdio::null())
            .stderr(Stdio::null());

    

        cmd.spawn().context(format!("Failed to spawn process: {}", exe_path))?;
        Ok(())
    }

    pub fn validate_chrome_path(path: &str) -> bool {
        std::path::Path::new(path).exists()
    }

    pub fn validate_exe_path(path: &str) -> bool {
        let expanded = expand_env_vars(path);
        std::path::Path::new(&expanded).exists()
    }
}

fn expand_env_vars(input: &str) -> String {
    let mut result = input.to_string();
    // Simple %VAR% expansion
    if let Ok(username) = std::env::var("USERNAME") {
        result = result.replace("%USERNAME%", &username);
    }
    if let Ok(appdata) = std::env::var("APPDATA") {
        result = result.replace("%APPDATA%", &appdata);
    }
    if let Ok(localappdata) = std::env::var("LOCALAPPDATA") {
        result = result.replace("%LOCALAPPDATA%", &localappdata);
    }
    if let Ok(programfiles) = std::env::var("PROGRAMFILES") {
        result = result.replace("%PROGRAMFILES%", &programfiles);
    }
    result
}
