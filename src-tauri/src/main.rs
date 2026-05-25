#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod automation;
mod commands;
mod config;
mod logs;
mod models;
mod startup;

#[cfg(test)]
mod tests;

use std::sync::Arc;
use tauri::{
    App, AppHandle, Manager, RunEvent,
    menu::{Menu, MenuItem},
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
};
use tokio::sync::Mutex;

use commands::AppState;
use config::ConfigManager;
use logs::LogManager;
use models::WorkflowStatus;

fn setup_tray(app: &App) -> tauri::Result<()> {
    let open_i  = MenuItem::with_id(app, "open",  "Open Dashboard", true, None::<&str>)?;
    let run_i   = MenuItem::with_id(app, "run",   "▶ Run Workflow Now", true, None::<&str>)?;
    let sep1    = tauri::menu::PredefinedMenuItem::separator(app)?;
    let quit_i  = MenuItem::with_id(app, "quit",  "Exit", true, None::<&str>)?;

    let menu = Menu::with_items(app, &[&open_i, &sep1, &run_i, &quit_i])?;

    let _tray = TrayIconBuilder::new()
        .icon(app.default_window_icon().unwrap().clone())
        .menu(&menu)
        .tooltip("Startup Maestro")
        .on_menu_event(|app, event| match event.id.as_ref() {
            "open" => show_main_window(app),
            "run"  => {
                let app = app.clone();
                tauri::async_runtime::spawn(async move {
                    let state = app.state::<AppState>();
                    let _ = commands::run_workflow(state, app.clone()).await;
                });
            }
            "quit" => std::process::exit(0),
            _ => {}
        })
        .on_tray_icon_event(|tray, event| {
            if let TrayIconEvent::Click {
                button: MouseButton::Left,
                button_state: MouseButtonState::Up,
                ..
            } = event {
                show_main_window(tray.app_handle());
            }
        })
        .build(app)?;

    Ok(())
}

fn show_main_window(app: &AppHandle) {
    if let Some(window) = app.get_webview_window("main") {
        let _ = window.show();
        let _ = window.set_focus();
        let _ = window.unminimize();
    }
}

fn main() {
    env_logger::init();

    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_notification::init())
        .setup(|app| {
            // Init state
            let config_manager = Arc::new(
                ConfigManager::new(&app.handle()).expect("Failed to initialize config"),
            );
            let log_manager = Arc::new(Mutex::new(LogManager::new()));
            let (status_tx, status_rx) =
                tokio::sync::watch::channel(WorkflowStatus::default());

            let state = AppState {
                config_manager: Arc::clone(&config_manager),
                log_manager: Arc::clone(&log_manager),
                workflow_status: Arc::new(status_tx),
                status_rx: Arc::new(tokio::sync::Mutex::new(status_rx)),
            };
            app.manage(state);

            // Setup tray
            setup_tray(app)?;

            // Start minimized if flag passed
            let args: Vec<String> = std::env::args().collect();
            if args.contains(&"--minimized".to_string()) {
                if let Some(window) = app.get_webview_window("main") {
                    let _ = window.hide();
                }
            }

            // Auto-run workflow on startup if configured
            let config = config_manager.get().expect("Failed to load config");
            if config.settings.auto_start_with_windows {
                let app_handle = app.handle().clone();
                tauri::async_runtime::spawn(async move {
                    tokio::time::sleep(std::time::Duration::from_secs(2)).await;
                    let state = app_handle.state::<AppState>();
                    let _ = commands::run_workflow(state, app_handle.clone()).await;
                });
            }

            Ok(())
        })
        .on_window_event(|window, event| {
            if let tauri::WindowEvent::CloseRequested { api, .. } = event {
                let app = window.app_handle();
                let state = app.state::<AppState>();
                if let Ok(config) = state.config_manager.get() {
                    if config.settings.minimize_to_tray {
                        window.hide().unwrap_or(());
                        api.prevent_close();
                    }
                }
            }
        })
        .invoke_handler(tauri::generate_handler![
            commands::get_config,
            commands::save_config,
            commands::run_workflow,
            commands::get_workflow_status,
            commands::get_logs,
            commands::clear_logs,
            commands::set_startup_enabled,
            commands::check_startup_status,
            commands::validate_chrome_path,
            commands::validate_exe_path,
            commands::pick_exe_file,
            commands::minimize_to_tray,
            commands::show_window,
        ])
        .build(tauri::generate_context!())
        .expect("Error building Startup Maestro")
        .run(|app, event| {
            if let RunEvent::ExitRequested { api, .. } = event {
                // Keep app alive when all windows closed (tray mode)
                api.prevent_exit();
            }
        });
}
