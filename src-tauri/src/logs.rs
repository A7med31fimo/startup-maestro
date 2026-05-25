use std::collections::VecDeque;
use crate::models::{LogEntry, LogLevel};
use chrono::Utc;

const MAX_LOGS: usize = 500;

pub struct LogManager {
    entries: VecDeque<LogEntry>,
}

impl LogManager {
    pub fn new() -> Self {
        let mut manager = Self {
            entries: VecDeque::new(),
        };
        manager.add(LogEntry {
            id: uuid::Uuid::new_v4().to_string(),
            timestamp: Utc::now(),
            level: LogLevel::Info,
            category: "System".to_string(),
            message: "🟢 Startup Maestro initialized".to_string(),
        });
        manager
    }

    pub fn add(&mut self, entry: LogEntry) {
        if self.entries.len() >= MAX_LOGS {
            self.entries.pop_front();
        }
        self.entries.push_back(entry);
    }

    pub fn get_all(&self) -> Vec<LogEntry> {
        self.entries.iter().cloned().collect()
    }

    pub fn clear(&mut self) {
        self.entries.clear();
    }
}
