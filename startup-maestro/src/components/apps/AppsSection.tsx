import { useState } from "react";
import {
  Plus, Trash2, GripVertical, AppWindow, FolderOpen,
  CheckCircle, XCircle,
} from "lucide-react";
import { useStore } from "../../store";
import { DesktopApp, LaunchMode } from "../../types";
import { Card } from "../shared/Card";
import { Button } from "../shared/Button";
import { Toggle } from "../shared/Toggle";
import { Badge } from "../shared/Badge";
import { api } from "../../utils/api";

let idCounter = 2000;
const uid = () => `app-${++idCounter}`;

const LAUNCH_MODES: { value: LaunchMode; label: string }[] = [
  { value: "normal",    label: "Normal" },
  { value: "minimized", label: "Minimized" },
  { value: "hidden",    label: "Hidden" },
];

export function AppsSection() {
  const config       = useStore((s) => s.config);
  const updateConfig = useStore((s) => s.updateConfig);
  const saveConfig   = useStore((s) => s.saveConfig);
  const [saving, setSaving] = useState(false);

  if (!config) return null;

  const update = (apps: DesktopApp[]) =>
    updateConfig((c) => ({ ...c, desktop_apps: apps }));

  const addApp = () => {
    const newApp: DesktopApp = {
      id: uid(),
      name: "New App",
      exe_path: "",
      args: [],
      launch_delay_ms: 0,
      enabled: true,
      launch_mode: "normal",
      launch_after_browser: true,
    };
    update([...config.desktop_apps, newApp]);
  };

  const removeApp = (id: string) =>
    update(config.desktop_apps.filter((a) => a.id !== id));

  const patchApp = (id: string, patch: Partial<DesktopApp>) =>
    update(config.desktop_apps.map((a) => (a.id === id ? { ...a, ...patch } : a)));

  const handleSave = async () => {
    setSaving(true);
    await saveConfig(config);
    setSaving(false);
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-[var(--text-primary)]">
            Desktop Apps
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Configure local applications to launch at startup
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" icon={<Plus size={14} />} onClick={addApp}>
            Add App
          </Button>
          <Button variant="primary" size="sm" loading={saving} onClick={handleSave}>
            Save Changes
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {config.desktop_apps.map((app) => (
          <AppCard
            key={app.id}
            app={app}
            onPatch={(patch) => patchApp(app.id, patch)}
            onRemove={() => removeApp(app.id)}
          />
        ))}
        {config.desktop_apps.length === 0 && (
          <div className="text-center py-16 rounded-2xl border border-dashed border-[var(--border)] text-[var(--text-muted)]">
            <AppWindow size={32} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">No apps configured</p>
            <Button variant="secondary" size="sm" className="mt-4" onClick={addApp}>
              <Plus size={14} /> Add First App
            </Button>
          </div>
        )}
      </div>

      {/* Tips */}
      <div
        className="mt-4 p-4 rounded-2xl border border-accent/20"
        style={{ background: "rgba(124,92,252,0.06)" }}
      >
        <div className="text-[12px] font-semibold text-accent-glow mb-2">💡 Tips</div>
        <ul className="text-[12px] text-[var(--text-secondary)] flex flex-col gap-1">
          <li>• Use <code className="font-mono text-[11px] px-1 py-0.5 rounded bg-[var(--bg-elevated)]">%USERNAME%</code>, <code className="font-mono text-[11px] px-1 py-0.5 rounded bg-[var(--bg-elevated)]">%APPDATA%</code>, <code className="font-mono text-[11px] px-1 py-0.5 rounded bg-[var(--bg-elevated)]">%LOCALAPPDATA%</code> in paths</li>
          <li>• "After browser" adds extra delay after all Chrome profiles launch</li>
          <li>• Minimized mode starts the app in the taskbar without stealing focus</li>
        </ul>
      </div>
    </div>
  );
}

function AppCard({
  app, onPatch, onRemove,
}: {
  app: DesktopApp;
  onPatch: (p: Partial<DesktopApp>) => void;
  onRemove: () => void;
}) {
  const [validating, setValidating] = useState(false);
  const [pathValid, setPathValid]   = useState<boolean | null>(null);

  const handleBrowse = async () => {
    try {
      const path = await api.pickExeFile();
      if (path) {
        onPatch({ exe_path: path });
        setPathValid(true);
      }
    } catch {}
  };

  const handleValidate = async () => {
    if (!app.exe_path) return;
    setValidating(true);
    const valid = await api.validateExePath(app.exe_path);
    setPathValid(valid);
    setValidating(false);
  };

  return (
    <Card padding="none" className={app.enabled ? "" : "opacity-60"}>
      <div className="p-4 flex flex-col gap-4">
        {/* Top row */}
        <div className="flex items-center gap-3">
          <GripVertical size={16} className="text-[var(--text-muted)] drag-handle flex-shrink-0" />
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0"
            style={{
              background: app.enabled ? "rgba(251,191,36,0.15)" : "var(--bg-elevated)",
              color: app.enabled ? "#fbbf24" : "var(--text-muted)",
            }}
          >
            {app.name[0]?.toUpperCase() ?? "A"}
          </div>
          <div className="flex-1">
            <input
              type="text"
              value={app.name}
              onChange={(e) => onPatch({ name: e.target.value })}
              placeholder="App name"
              className="font-semibold text-[13px]"
              style={{ background: "transparent", border: "none", padding: "0", boxShadow: "none" }}
            />
          </div>
          <div className="flex items-center gap-2">
            {app.launch_delay_ms > 0 && (
              <Badge variant="accent">+{app.launch_delay_ms / 1000}s</Badge>
            )}
            <Badge variant={app.launch_mode === "normal" ? "default" : "warning"}>
              {app.launch_mode}
            </Badge>
            <Toggle checked={app.enabled} onChange={(v) => onPatch({ enabled: v })} />
            <button
              onClick={onRemove}
              className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-rose-400 hover:bg-rose-400/10 transition-colors"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>

        {/* Exe path */}
        <div>
          <label className="block text-[11px] text-[var(--text-muted)] mb-1.5">Executable Path</label>
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <input
                type="text"
                value={app.exe_path}
                onChange={(e) => { onPatch({ exe_path: e.target.value }); setPathValid(null); }}
                placeholder="C:\Program Files\App\app.exe"
                className={
                  pathValid === false ? "border-rose-400/50" :
                  pathValid === true  ? "border-emerald-400/50" : ""
                }
              />
              {pathValid !== null && (
                <div className="absolute right-2 top-1/2 -translate-y-1/2">
                  {pathValid
                    ? <CheckCircle size={14} className="text-emerald-400" />
                    : <XCircle    size={14} className="text-rose-400" />
                  }
                </div>
              )}
            </div>
            <Button variant="secondary" size="sm" icon={<FolderOpen size={13} />} onClick={handleBrowse}>
              Browse
            </Button>
            <Button variant="ghost" size="sm" loading={validating} onClick={handleValidate}>
              Verify
            </Button>
          </div>
          {pathValid === false && (
            <p className="text-[11px] text-rose-400 mt-1">
              File not found. Check the path or use environment variables like %APPDATA%.
            </p>
          )}
        </div>

        {/* Options grid */}
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-[11px] text-[var(--text-muted)] mb-1.5">Launch Mode</label>
            <select
              value={app.launch_mode}
              onChange={(e) => onPatch({ launch_mode: e.target.value as LaunchMode })}
              className="w-full rounded-xl border border-[var(--border)] text-[13px] px-3 py-2"
              style={{ background: "var(--bg-elevated)", color: "var(--text-primary)", outline: "none" }}
            >
              {LAUNCH_MODES.map((m) => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[11px] text-[var(--text-muted)] mb-1.5">Launch Delay (seconds)</label>
            <input
              type="number"
              min={0}
              max={120}
              step={0.5}
              value={app.launch_delay_ms / 1000}
              onChange={(e) => onPatch({ launch_delay_ms: parseFloat(e.target.value) * 1000 })}
            />
          </div>
          <div>
            <label className="block text-[11px] text-[var(--text-muted)] mb-1.5">Launch After Browser</label>
            <div className="flex items-center gap-2 mt-2">
              <Toggle
                checked={app.launch_after_browser}
                onChange={(v) => onPatch({ launch_after_browser: v })}
              />
              <span className="text-[12px] text-[var(--text-secondary)]">
                {app.launch_after_browser ? "Yes (after Chrome)" : "Immediate"}
              </span>
            </div>
          </div>
        </div>

        {/* Args */}
        <div>
          <label className="block text-[11px] text-[var(--text-muted)] mb-1.5">
            Command Arguments{" "}
            <span className="opacity-60">(optional, comma separated)</span>
          </label>
          <input
            type="text"
            value={app.args.join(",")}
            onChange={(e) =>
              onPatch({ args: e.target.value ? e.target.value.split(",").map((s) => s.trim()) : [] })
            }
            placeholder="--no-sandbox, --disable-gpu"
          />
        </div>
      </div>
    </Card>
  );
}
