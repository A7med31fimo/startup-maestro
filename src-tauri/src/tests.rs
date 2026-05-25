// src-tauri/src/tests.rs
// Run with: cargo test --manifest-path src-tauri/Cargo.toml

#[cfg(test)]
mod tests {
    use crate::models::*;
    use crate::automation::AutomationEngine;
    use crate::logs::LogManager;

    // ── Model serialization ──────────────────────────────────────────────────

    #[test]
    fn test_default_config_serializes() {
        let config = AppConfig::default();
        let json = serde_json::to_string_pretty(&config).expect("serialization failed");
        assert!(json.contains("chrome_profiles"));
        assert!(json.contains("desktop_apps"));
        assert!(json.contains("settings"));
    }

    #[test]
    fn test_default_config_has_three_profiles() {
        let config = AppConfig::default();
        assert_eq!(config.chrome_profiles.len(), 3);
        assert_eq!(config.chrome_profiles[0].name, "Personal");
        assert_eq!(config.chrome_profiles[1].name, "Work");
        assert_eq!(config.chrome_profiles[2].name, "Research");
    }

    #[test]
    fn test_all_default_profiles_enabled() {
        let config = AppConfig::default();
        for profile in &config.chrome_profiles {
            assert!(profile.enabled, "Profile '{}' should be enabled by default", profile.name);
        }
    }

    #[test]
    fn test_profile_urls_have_valid_order() {
        let config = AppConfig::default();
        for profile in &config.chrome_profiles {
            let mut orders: Vec<u32> = profile.urls.iter().map(|u| u.order).collect();
            orders.sort();
            for (i, &order) in orders.iter().enumerate() {
                assert_eq!(order, i as u32, "URL orders should be 0-indexed sequential");
            }
        }
    }

    #[test]
    fn test_config_roundtrip() {
        let original = AppConfig::default();
        let json = serde_json::to_string(&original).unwrap();
        let deserialized: AppConfig = serde_json::from_str(&json).unwrap();
        assert_eq!(original.chrome_profiles.len(), deserialized.chrome_profiles.len());
        assert_eq!(original.desktop_apps.len(), deserialized.desktop_apps.len());
    }

    #[test]
    fn test_launch_mode_serialization() {
        let mode = LaunchMode::Minimized;
        let s = serde_json::to_string(&mode).unwrap();
        assert_eq!(s, "\"minimized\"");

        let back: LaunchMode = serde_json::from_str(&s).unwrap();
        matches!(back, LaunchMode::Minimized);
    }

    #[test]
    fn test_theme_serialization() {
        let dark = serde_json::to_string(&crate::models::Theme::Dark).unwrap();
        assert_eq!(dark, "\"dark\"");
    }

    // ── Validation ───────────────────────────────────────────────────────────

    #[test]
    fn test_validate_nonexistent_chrome_path() {
        let result = AutomationEngine::validate_chrome_path(
            r"C:\Does\Not\Exist\chrome.exe"
        );
        assert!(!result, "Non-existent path should return false");
    }

    #[test]
    fn test_validate_nonexistent_exe_path() {
        let result = AutomationEngine::validate_exe_path(
            r"C:\Does\Not\Exist\app.exe"
        );
        assert!(!result);
    }

    #[test]
    fn test_validate_existing_path() {
        // Use a path that always exists on Windows
        #[cfg(target_os = "windows")]
        {
            let result = AutomationEngine::validate_exe_path(r"C:\Windows\System32\notepad.exe");
            assert!(result, "notepad.exe should exist");
        }
        // On non-Windows, just test the logic doesn't panic
        #[cfg(not(target_os = "windows"))]
        {
            let result = AutomationEngine::validate_exe_path("/bin/sh");
            // /bin/sh exists on Linux/Mac
            assert!(result);
        }
    }

    // ── Log Manager ──────────────────────────────────────────────────────────

    #[test]
    fn test_log_manager_initializes_with_one_entry() {
        let manager = LogManager::new();
        let logs = manager.get_all();
        assert_eq!(logs.len(), 1);
        assert!(logs[0].message.contains("initialized"));
    }

    #[test]
    fn test_log_manager_add_and_retrieve() {
        use chrono::Utc;
        let mut manager = LogManager::new();
        manager.add(LogEntry {
            id: "test-1".to_string(),
            timestamp: Utc::now(),
            level: LogLevel::Info,
            category: "Test".to_string(),
            message: "test message".to_string(),
        });
        let logs = manager.get_all();
        assert_eq!(logs.len(), 2);
        assert_eq!(logs[1].message, "test message");
    }

    #[test]
    fn test_log_manager_clear() {
        let mut manager = LogManager::new();
        manager.clear();
        assert_eq!(manager.get_all().len(), 0);
    }

    #[test]
    fn test_log_manager_respects_max_size() {
        use chrono::Utc;
        let mut manager = LogManager::new();
        manager.clear();
        // Add more than MAX_LOGS (500) entries
        for i in 0..520 {
            manager.add(LogEntry {
                id: format!("id-{}", i),
                timestamp: Utc::now(),
                level: LogLevel::Info,
                category: "Test".to_string(),
                message: format!("message {}", i),
            });
        }
        let logs = manager.get_all();
        assert!(logs.len() <= 500, "Log manager should cap at 500 entries");
    }

    // ── WorkflowStatus ───────────────────────────────────────────────────────

    #[test]
    fn test_workflow_status_default() {
        let status = WorkflowStatus::default();
        assert!(!status.is_running);
        assert!(!status.is_paused);
        assert!(status.current_task.is_none());
        assert!(status.completed_tasks.is_empty());
        assert!(status.failed_tasks.is_empty());
    }

    // ── Startup Settings ─────────────────────────────────────────────────────

    #[test]
    fn test_startup_settings_defaults() {
        let settings = StartupSettings::default();
        assert!(!settings.auto_start_with_windows);
        assert!(!settings.start_minimized);
        assert!(settings.minimize_to_tray);
        assert!(settings.show_notifications);
        assert_eq!(settings.delay_between_profiles_ms, 1500);
        assert_eq!(settings.delay_before_apps_ms, 3000);
    }

    // ── Profile URL ordering ─────────────────────────────────────────────────

    #[test]
    fn test_enabled_url_filter() {
        let config = AppConfig::default();
        let personal = &config.chrome_profiles[0];
        let enabled_count = personal.urls.iter().filter(|u| u.enabled).count();
        assert_eq!(enabled_count, 3, "All default Personal URLs should be enabled");
    }
}
