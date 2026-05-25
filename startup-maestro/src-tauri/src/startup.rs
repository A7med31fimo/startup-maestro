use anyhow::{Context, Result};

const APP_NAME: &str = "StartupMaestro";
const REGISTRY_KEY: &str = "SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Run";

pub struct StartupManager;

impl StartupManager {
    /// Register app to run at Windows startup
    pub fn register_startup(exe_path: &str, start_minimized: bool) -> Result<()> {
        #[cfg(target_os = "windows")]
        {
            use winreg::enums::*;
            use winreg::RegKey;

            let hkcu = RegKey::predef(HKEY_CURRENT_USER);
            let run_key = hkcu
                .open_subkey_with_flags(REGISTRY_KEY, KEY_WRITE)
                .context("Failed to open Windows startup registry key")?;

            let value = if start_minimized {
                format!("\"{}\" --minimized", exe_path)
            } else {
                format!("\"{}\"", exe_path)
            };

            run_key
                .set_value(APP_NAME, &value)
                .context("Failed to write startup registry value")?;

            log::info!("Registered {} for startup: {}", APP_NAME, value);
        }

        #[cfg(not(target_os = "windows"))]
        {
            log::warn!("Startup registration is only supported on Windows");
        }

        Ok(())
    }

    /// Remove app from Windows startup
    pub fn unregister_startup() -> Result<()> {
        #[cfg(target_os = "windows")]
        {
            use winreg::enums::*;
            use winreg::RegKey;

            let hkcu = RegKey::predef(HKEY_CURRENT_USER);
            let run_key = hkcu
                .open_subkey_with_flags(REGISTRY_KEY, KEY_WRITE)
                .context("Failed to open Windows startup registry key")?;

            // Ignore error if key doesn't exist
            let _ = run_key.delete_value(APP_NAME);
            log::info!("Unregistered {} from startup", APP_NAME);
        }

        #[cfg(not(target_os = "windows"))]
        {
            log::warn!("Startup registration is only supported on Windows");
        }

        Ok(())
    }

    /// Check if app is currently registered for startup
    pub fn is_registered() -> bool {
        #[cfg(target_os = "windows")]
        {
            use winreg::enums::*;
            use winreg::RegKey;

            if let Ok(hkcu) = RegKey::predef(HKEY_CURRENT_USER).open_subkey(REGISTRY_KEY) {
                hkcu.get_value::<String, _>(APP_NAME).is_ok()
            } else {
                false
            }
        }

        #[cfg(not(target_os = "windows"))]
        {
            false
        }
    }

    /// Get the current executable path
    pub fn get_exe_path() -> Result<String> {
        let exe = std::env::current_exe()
            .context("Failed to get current executable path")?;
        Ok(exe.to_string_lossy().to_string())
    }
}
