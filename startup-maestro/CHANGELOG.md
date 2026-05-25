# Changelog

All notable changes to Startup Maestro will be documented here.

Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).
Versioning follows [Semantic Versioning](https://semver.org/).

---

## [1.0.0] – 2024-01-01

### Added
- **Auto-start with Windows** via HKCU registry key
- **Chrome multi-profile launcher** — opens 3+ independent profiles
- **Per-profile URL tabs** — configurable order, label, enable/disable
- **Desktop app launcher** — any `.exe` with delay, launch mode, args
- **Workflow sequencing** — delay between profiles, delay before apps
- **JSON config persistence** — survives reboots, stored in `%APPDATA%`
- **Dashboard** — stats, launch timeline, last-run timestamp
- **Chrome Profiles CRUD** — add, edit, remove, drag-to-reorder
- **Desktop Apps CRUD** — browse for exe, verify path, set mode
- **Real-time log viewer** — colour-coded by level and category
- **Settings page** — all options in one place with live preview
- **Dark / Light theme** — instant toggle, persisted to config
- **System tray** — Open, Run, Pause, Exit
- **Minimize to tray** on window close (configurable)
- **Path validation** — verify Chrome and exe paths before saving
- **Environment variable expansion** — `%APPDATA%`, `%USERNAME%`, etc.
- **Security by design** — no credentials, no cookies, no login bypass
- **Tauri backend** — ~15 MB RAM at idle, <50ms startup
- **React + Tailwind frontend** — modular component architecture
- **Zustand state management** — clean unidirectional data flow
- **Browser dev mode** — mock API for UI development without Rust
- **GitHub Actions CI** — auto-build MSI + NSIS on tag push
- **VS Code workspace** — tasks, launch config, recommended extensions
- **Integration tests** — 15+ Rust unit tests covering all modules
