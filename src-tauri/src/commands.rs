use std::sync::Arc;
use tauri::{State, AppHandle, Manager};
use tokio::sync::Mutex;

use crate::models::{AppConfig, LogEntry, WorkflowStatus};
use crate::config::ConfigManager;
use crate::logs::LogManager;
use crate::automation::AutomationEngine;
use crate::startup::StartupManager;

pub struct AppState {
    pub config_manager: Arc<ConfigManager>,
    pub log_manager: Arc<Mutex<LogManager>>,
    pub workflow_status: Arc<tokio::sync::watch::Sender<WorkflowStatus>>,
    pub status_rx: Arc<tokio::sync::Mutex<tokio::sync::watch::Receiver<WorkflowStatus>>>,
}

// ── Config ───────────────────────────────────────────────────────────────────

#[tauri::command]
pub async fn get_config(state: State<'_, AppState>) -> Result<AppConfig, String> {
    state.config_manager.get().map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn save_config(
    state: State<'_, AppState>,
    config: AppConfig,
) -> Result<(), String> {
    state.config_manager.update(config).map_err(|e| e.to_string())
}

// ── Workflow ─────────────────────────────────────────────────────────────────

#[tauri::command]
pub async fn run_workflow(
    state: State<'_, AppState>,
    _app: AppHandle,
) -> Result<(), String> {
    let config = state.config_manager.get().map_err(|e| e.to_string())?;
    let log_manager = Arc::clone(&state.log_manager);
    let status_tx = Arc::clone(&state.workflow_status);

    {
        let mut cfg = state.config_manager.config.lock()
            .map_err(|_| "Lock error".to_string())?;
        cfg.last_run = Some(chrono::Utc::now());
        drop(cfg);
        state.config_manager.save().map_err(|e| e.to_string())?;
    }

    tokio::spawn(async move {
        let _ = AutomationEngine::run_workflow(config, log_manager, (*status_tx).clone()).await;
    });

    Ok(())
}

#[tauri::command]
pub async fn get_workflow_status(state: State<'_, AppState>) -> Result<WorkflowStatus, String> {
    let rx = state.status_rx.lock().await;
    let status = rx.borrow().clone();  // ← split into separate line
    Ok(status)
}

// ── Logs ─────────────────────────────────────────────────────────────────────

#[tauri::command]
pub async fn get_logs(state: State<'_, AppState>) -> Result<Vec<LogEntry>, String> {
    let log = state.log_manager.lock().await;
    Ok(log.get_all())
}

#[tauri::command]
pub async fn clear_logs(state: State<'_, AppState>) -> Result<(), String> {
    let mut log = state.log_manager.lock().await;
    log.clear();
    Ok(())
}

// ── Startup ──────────────────────────────────────────────────────────────────

#[tauri::command]
pub async fn set_startup_enabled(
    state: State<'_, AppState>,
    enabled: bool,
    start_minimized: bool,
) -> Result<(), String> {
    if enabled {
        let exe_path = StartupManager::get_exe_path().map_err(|e| e.to_string())?;
        StartupManager::register_startup(&exe_path, start_minimized)
            .map_err(|e| e.to_string())?;
    } else {
        StartupManager::unregister_startup().map_err(|e| e.to_string())?;
    }

    let mut config = state.config_manager.get().map_err(|e| e.to_string())?;
    config.settings.auto_start_with_windows = enabled;
    config.settings.start_minimized = start_minimized;
    state.config_manager.update(config).map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub async fn check_startup_status() -> Result<bool, String> {
    Ok(StartupManager::is_registered())
}

// ── Validation ───────────────────────────────────────────────────────────────

#[tauri::command]
pub async fn validate_chrome_path(path: String) -> Result<bool, String> {
    Ok(AutomationEngine::validate_chrome_path(&path))
}

#[tauri::command]
pub async fn validate_exe_path(path: String) -> Result<bool, String> {
    Ok(AutomationEngine::validate_exe_path(&path))
}

#[tauri::command]
pub async fn pick_exe_file(app: AppHandle) -> Result<Option<String>, String> {
    use tauri_plugin_dialog::DialogExt;
    let path = app.dialog()
        .file()
        .set_title("Select Executable")
        .add_filter("Executables", &["exe"])
        .blocking_pick_file();
    Ok(path.map(|p| p.to_string()))
}

// ── Window ───────────────────────────────────────────────────────────────────

#[tauri::command]
pub async fn minimize_to_tray(app: AppHandle) -> Result<(), String> {
    if let Some(window) = app.get_webview_window("main") {
        window.hide().map_err(|e| e.to_string())?;
    }
    Ok(())
}

#[tauri::command]
pub async fn show_window(app: AppHandle) -> Result<(), String> {
    if let Some(window) = app.get_webview_window("main") {
        window.show().map_err(|e| e.to_string())?;
        window.set_focus().map_err(|e| e.to_string())?;
    }
    Ok(())
}
