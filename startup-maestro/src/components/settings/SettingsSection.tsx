import { useState } from "react";
import {
  Power, Bell, Moon, Sun, Chrome,
  Clock, Shield, CheckCircle, XCircle,
} from "lucide-react";
import { useStore } from "../../store";
import { Card, CardHeader, CardTitle } from "../shared/Card";
import { Toggle } from "../shared/Toggle";
import { Button } from "../shared/Button";
import { Badge } from "../shared/Badge";
import { api } from "../../utils/api";

export function SettingsSection() {
  const config            = useStore((s) => s.config);
  const updateConfig      = useStore((s) => s.updateConfig);
  const saveConfig        = useStore((s) => s.saveConfig);
  const startupRegistered = useStore((s) => s.startupRegistered);
  const setStartupEnabled = useStore((s) => s.setStartupEnabled);
  const addToast          = useStore((s) => s.addToast);

  const [saving, setSaving]           = useState(false);
  const [validatingChrome, setValidatingChrome] = useState(false);
  const [chromeValid, setChromeValid] = useState<boolean | null>(null);

  if (!config) return null;
  const s = config.settings;

  const patch = (partial: Partial<typeof s>) =>
    updateConfig((c) => ({ ...c, settings: { ...c.settings, ...partial } }));

  const handleSave = async () => {
    setSaving(true);
    await saveConfig(config);
    setSaving(false);
  };

  const handleStartupToggle = async (enabled: boolean) => {
    await setStartupEnabled(enabled, s.start_minimized);
    patch({ auto_start_with_windows: enabled });
  };

  const handleTheme = (theme: "dark" | "light") => {
    patch({ theme });
    document.documentElement.classList.toggle("light", theme === "light");
  };

  const validateChrome = async () => {
    setValidatingChrome(true);
    const valid = await api.validateChromePath(s.chrome_path);
    setChromeValid(valid);
    setValidatingChrome(false);
    if (valid) {
      addToast({ type: "success", title: "Chrome path is valid" });
    } else {
      addToast({ type: "error", title: "Chrome not found at that path" });
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-[var(--text-primary)]">Settings</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">Configure app behaviour and system integration</p>
        </div>
        <Button variant="primary" size="sm" loading={saving} onClick={handleSave}>
          Save Changes
        </Button>
      </div>

      <div className="flex flex-col gap-4 max-w-2xl">
        {/* Startup */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Power size={16} className="text-accent-glow" />
              <CardTitle>Windows Startup</CardTitle>
            </div>
            <Badge variant={startupRegistered ? "success" : "muted"}>
              {startupRegistered ? "Registered" : "Not registered"}
            </Badge>
          </CardHeader>
          <div className="flex flex-col gap-4">
            <SettingRow
              label="Auto-start with Windows"
              description="Register app in Windows startup registry (HKCU Run)"
            >
              <Toggle
                checked={s.auto_start_with_windows}
                onChange={handleStartupToggle}
              />
            </SettingRow>
            <SettingRow
              label="Start minimized"
              description="Hide window on startup, show only in system tray"
            >
              <Toggle
                checked={s.start_minimized}
                onChange={(v) => {
                  patch({ start_minimized: v });
                  if (s.auto_start_with_windows) {
                    setStartupEnabled(s.auto_start_with_windows, v);
                  }
                }}
                disabled={!s.auto_start_with_windows}
              />
            </SettingRow>
            <SettingRow
              label="Minimize to tray on close"
              description="Pressing X hides the window instead of quitting"
            >
              <Toggle checked={s.minimize_to_tray} onChange={(v) => patch({ minimize_to_tray: v })} />
            </SettingRow>
          </div>
        </Card>

        {/* Chrome */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Chrome size={16} className="text-blue-400" />
              <CardTitle>Chrome Configuration</CardTitle>
            </div>
          </CardHeader>
          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-[11px] text-[var(--text-muted)] mb-1.5">
                Default Chrome Executable Path
              </label>
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={s.chrome_path}
                    onChange={(e) => { patch({ chrome_path: e.target.value }); setChromeValid(null); }}
                    placeholder="C:\Program Files\Google\Chrome\Application\chrome.exe"
                  />
                  {chromeValid !== null && (
                    <div className="absolute right-2 top-1/2 -translate-y-1/2">
                      {chromeValid
                        ? <CheckCircle size={14} className="text-emerald-400" />
                        : <XCircle    size={14} className="text-rose-400" />
                      }
                    </div>
                  )}
                </div>
                <Button variant="ghost" size="sm" loading={validatingChrome} onClick={validateChrome}>
                  Verify
                </Button>
              </div>
              <p className="text-[11px] text-[var(--text-muted)] mt-1">
                Each profile can override this with a custom path.
              </p>
            </div>
          </div>
        </Card>

        {/* Timing */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-amber-400" />
              <CardTitle>Launch Timing</CardTitle>
            </div>
          </CardHeader>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] text-[var(--text-muted)] mb-1.5">
                Delay Between Profiles (ms)
              </label>
              <input
                type="number"
                min={0}
                max={10000}
                step={500}
                value={s.delay_between_profiles_ms}
                onChange={(e) => patch({ delay_between_profiles_ms: parseInt(e.target.value) })}
              />
              <p className="text-[11px] text-[var(--text-muted)] mt-1">
                Currently: {s.delay_between_profiles_ms / 1000}s
              </p>
            </div>
            <div>
              <label className="block text-[11px] text-[var(--text-muted)] mb-1.5">
                Delay Before Apps (ms)
              </label>
              <input
                type="number"
                min={0}
                max={30000}
                step={500}
                value={s.delay_before_apps_ms}
                onChange={(e) => patch({ delay_before_apps_ms: parseInt(e.target.value) })}
              />
              <p className="text-[11px] text-[var(--text-muted)] mt-1">
                Currently: {s.delay_before_apps_ms / 1000}s
              </p>
            </div>
          </div>
        </Card>

        {/* Appearance */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Moon size={16} className="text-accent-glow" />
              <CardTitle>Appearance</CardTitle>
            </div>
          </CardHeader>
          <div className="flex gap-3">
            <button
              onClick={() => handleTheme("dark")}
              className={`flex-1 p-4 rounded-xl border text-center transition-all ${
                s.theme === "dark"
                  ? "border-accent bg-accent/10 text-accent-glow"
                  : "border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--border-hover)]"
              }`}
            >
              <Moon size={20} className="mx-auto mb-2" />
              <div className="text-[13px] font-medium">Dark Mode</div>
            </button>
            <button
              onClick={() => handleTheme("light")}
              className={`flex-1 p-4 rounded-xl border text-center transition-all ${
                s.theme === "light"
                  ? "border-accent bg-accent/10 text-accent-glow"
                  : "border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--border-hover)]"
              }`}
            >
              <Sun size={20} className="mx-auto mb-2" />
              <div className="text-[13px] font-medium">Light Mode</div>
            </button>
          </div>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell size={16} className="text-emerald-400" />
              <CardTitle>Notifications</CardTitle>
            </div>
          </CardHeader>
          <SettingRow
            label="Show system notifications"
            description="Display Windows notifications when workflow starts/completes"
          >
            <Toggle
              checked={s.show_notifications}
              onChange={(v) => patch({ show_notifications: v })}
            />
          </SettingRow>
        </Card>

        {/* Security notice */}
        <div
          className="p-4 rounded-2xl border border-emerald-400/20"
          style={{ background: "rgba(52,211,153,0.05)" }}
        >
          <div className="flex items-center gap-2 mb-2">
            <Shield size={14} className="text-emerald-400" />
            <span className="text-[12px] font-semibold text-emerald-400">Security</span>
          </div>
          <p className="text-[12px] text-[var(--text-secondary)]">
            Startup Maestro never stores passwords, injects cookies, or bypasses authentication.
            It only launches Chrome with your existing signed-in profiles using command-line arguments.
            No credentials are handled or stored.
          </p>
        </div>
      </div>
    </div>
  );
}

function SettingRow({
  label, description, children,
}: {
  label: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex-1">
        <div className="text-[13px] font-medium text-[var(--text-primary)]">{label}</div>
        <div className="text-[11px] text-[var(--text-muted)] mt-0.5">{description}</div>
      </div>
      {children}
    </div>
  );
}
