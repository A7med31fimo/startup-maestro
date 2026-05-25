# Contributing to Startup Maestro

## Architecture Overview

```
Frontend (React/TS)  ←→  Tauri IPC bridge  ←→  Backend (Rust)
     Zustand store          invoke()            Tokio async
     Component tree         commands.rs         automation.rs
     Mock API fallback      AppState            config.rs
```

The frontend **never** directly touches the filesystem or spawns processes.
All privileged operations go through Tauri's `invoke()` → Rust commands.

---

## Development Setup

```bash
# Clone and install
git clone https://github.com/yourname/startup-maestro
cd startup-maestro
npm install

# Run in dev mode (hot-reload frontend + Rust backend)
cargo tauri dev

# Frontend only (browser, no Rust needed)
npm run dev
# The mock API kicks in automatically when window.__TAURI__ is absent
```

---

## Project Layers

### 1. `src/types/index.ts`
Single source of truth for TypeScript types.
**Must mirror** the Rust structs in `src-tauri/src/models.rs` exactly.
If you add a field in Rust, add it here too.

### 2. `src/utils/api.ts`
Thin wrapper over `@tauri-apps/api/tauri`'s `invoke()`.
Falls back to `mock.ts` in browser mode.
Add new commands here first, then implement in Rust.

### 3. `src/store/index.ts`
Zustand store — all global state and async actions live here.
Components only call store actions, never `api.*` directly.

### 4. `src/components/`
Each section (dashboard, profiles, apps, logs, settings) is self-contained.
Shared primitives (Button, Card, Toggle, Badge, Toast) are in `shared/`.

### 5. `src-tauri/src/commands.rs`
All Tauri commands. Each `#[tauri::command]` maps to an `api.*` call.
Keep commands thin — delegate logic to `automation.rs` / `config.rs`.

### 6. `src-tauri/src/automation.rs`
The launch engine. `AutomationEngine::run_workflow()` is the main entry point.
Chrome launching: `launch_chrome_profile()`
App launching: `launch_desktop_app()`
Both are synchronous — wrapped in `tokio::spawn` at the command layer.

### 7. `src-tauri/src/config.rs`
Thread-safe config with `Mutex<AppConfig>`.
Always call `.save()` after `.update()`.

---

## Adding a New Feature

### Example: Add a "pre-launch script" to desktop apps

**Step 1** — Add field to Rust model (`models.rs`):
```rust
pub struct DesktopApp {
    // ... existing fields ...
    pub pre_launch_script: Option<String>,
}
```

**Step 2** — Add to TypeScript type (`types/index.ts`):
```typescript
export interface DesktopApp {
  // ... existing fields ...
  pre_launch_script: string | null;
}
```

**Step 3** — Update mock data (`utils/mock.ts`):
```typescript
{ ..., pre_launch_script: null }
```

**Step 4** — Implement in automation engine (`automation.rs`):
```rust
if let Some(script) = &app.pre_launch_script {
    Command::new("powershell").arg("-File").arg(script).spawn()?;
    sleep(Duration::from_millis(500)).await;
}
```

**Step 5** — Add UI in `AppsSection.tsx`:
```tsx
<input type="text" value={app.pre_launch_script ?? ""} 
  onChange={e => onPatch({ pre_launch_script: e.target.value || null })} />
```

**Step 6** — Write a test in `tests.rs`:
```rust
#[test]
fn test_app_with_pre_launch_script_serializes() { ... }
```

---

## Testing

```bash
# Rust unit tests
cargo test --manifest-path src-tauri/Cargo.toml

# TypeScript type check
npx tsc --noEmit

# Lint
npx eslint src --ext ts,tsx

# Full build check
cargo tauri build
```

---

## Code Style

**Rust**: `cargo fmt` + `cargo clippy`. No `unwrap()` in production paths — use `?` or `anyhow`.

**TypeScript**: Prettier + ESLint. No `any` types. Keep components under 300 lines.

**Commits**: `feat:`, `fix:`, `refactor:`, `docs:`, `test:` prefixes.

---

## Security Rules (Non-Negotiable)

- Never store credentials, tokens, or passwords in config
- Never inject into browser processes
- Never bypass OS authentication
- Chrome launch must only use `--profile-directory` flag
- All file paths must be user-provided and validated before use
