use std::path::PathBuf;
use std::sync::Mutex;
use anyhow::{Context, Result};
use tauri::AppHandle;
use tauri::Manager;

use crate::models::AppConfig;

pub struct ConfigManager {
    config_path: PathBuf,
    pub config: Mutex<AppConfig>,
}

impl ConfigManager {
    pub fn new(app: &AppHandle) -> Result<Self> {
        // Tauri v2: use app.path().app_config_dir()
        let config_dir = app
            .path()
            .app_config_dir()
            .context("Failed to get app config directory")?;

        std::fs::create_dir_all(&config_dir)
            .context("Failed to create config directory")?;

        let config_path = config_dir.join("config.json");

        let config = if config_path.exists() {
            let content = std::fs::read_to_string(&config_path)
                .context("Failed to read config file")?;
            serde_json::from_str(&content).unwrap_or_else(|_| AppConfig::default())
        } else {
            let default = AppConfig::default();
            let json = serde_json::to_string_pretty(&default)?;
            std::fs::write(&config_path, json)?;
            default
        };

        Ok(Self {
            config_path,
            config: Mutex::new(config),
        })
    }

    pub fn save(&self) -> Result<()> {
        let config = self.config.lock().map_err(|_| anyhow::anyhow!("Lock poisoned"))?;
        let json = serde_json::to_string_pretty(&*config)?;
        std::fs::write(&self.config_path, json).context("Failed to write config")?;
        Ok(())
    }

    pub fn get(&self) -> Result<AppConfig> {
        let config = self.config.lock().map_err(|_| anyhow::anyhow!("Lock poisoned"))?;
        Ok(config.clone())
    }

    pub fn update(&self, new_config: AppConfig) -> Result<()> {
        let mut config = self.config.lock().map_err(|_| anyhow::anyhow!("Lock poisoned"))?;
        *config = new_config;
        drop(config);
        self.save()
    }
}
