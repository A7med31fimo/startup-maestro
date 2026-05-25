import {
  Play,
  Chrome,
  AppWindow,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  Activity,
  Globe,
} from "lucide-react";
import { useStore } from "../../store";
import { AppConfig } from "../../types";
import { Card, CardHeader, CardTitle } from "../shared/Card";
import { Button } from "../shared/Button";
import { Badge } from "../shared/Badge";
import { formatRelativeTime } from "../../utils/helpers";

export function Dashboard() {
  const config        = useStore((s) => s.config);
  const runWorkflow   = useStore((s) => s.runWorkflow);
  const workflowStatus = useStore((s) => s.workflowStatus);
  const setActiveSection = useStore((s) => s.setActiveSection);

  if (!config) return null;

  const enabledProfiles = config.chrome_profiles.filter((p) => p.enabled);
  const enabledApps     = config.desktop_apps.filter((a) => a.enabled);
  const totalUrls       = enabledProfiles.reduce(
    (sum, p) => sum + p.urls.filter((u) => u.enabled).length, 0
  );
  const isRunning       = workflowStatus?.is_running ?? false;

  return (
    <div className="flex-1 overflow-y-auto p-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-2xl font-bold text-[var(--text-primary)]">
            Dashboard
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Your startup workflow at a glance
          </p>
        </div>
        <Button
          variant="primary"
          size="lg"
          icon={isRunning ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} />}
          onClick={runWorkflow}
          loading={isRunning}
          className="font-semibold"
        >
          {isRunning ? "Running…" : "Launch Now"}
        </Button>
      </div>

      {/* Status Bar (visible only when running) */}
      {isRunning && workflowStatus && (
        <div
          className="mb-6 p-4 rounded-2xl border border-accent/30 animate-fade-in"
          style={{ background: "rgba(124,92,252,0.08)" }}
        >
          <div className="flex items-center gap-3">
            <Activity size={16} className="text-accent-glow animate-pulse" />
            <span className="text-sm font-medium text-accent-glow">
              {workflowStatus.current_task ?? "Processing…"}
            </span>
          </div>
          {workflowStatus.completed_tasks.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {workflowStatus.completed_tasks.map((t) => (
                <Badge key={t} variant="success">
                  <CheckCircle2 size={10} /> {t}
                </Badge>
              ))}
              {workflowStatus.failed_tasks.map((t) => (
                <Badge key={t} variant="error">
                  <XCircle size={10} /> {t}
                </Badge>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Stats grid */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Chrome Profiles"
          value={enabledProfiles.length}
          total={config.chrome_profiles.length}
          icon={<Chrome size={18} />}
          color="text-blue-400"
          bg="bg-blue-400/10"
          onClick={() => setActiveSection("profiles")}
        />
        <StatCard
          label="Websites"
          value={totalUrls}
          icon={<Globe size={18} />}
          color="text-emerald-400"
          bg="bg-emerald-400/10"
          onClick={() => setActiveSection("profiles")}
        />
        <StatCard
          label="Desktop Apps"
          value={enabledApps.length}
          total={config.desktop_apps.length}
          icon={<AppWindow size={18} />}
          color="text-amber-400"
          bg="bg-amber-400/10"
          onClick={() => setActiveSection("apps")}
        />
        <StatCard
          label="Last Run"
          value={formatRelativeTime(config.last_run)}
          icon={<Clock size={18} />}
          color="text-[var(--text-secondary)]"
          bg="bg-[var(--bg-elevated)]"
          isText
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Chrome Profiles Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Chrome Profiles</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => setActiveSection("profiles")}>
              Edit
            </Button>
          </CardHeader>
          <div className="flex flex-col gap-2">
            {config.chrome_profiles.map((p) => (
              <div
                key={p.id}
                className="flex items-center gap-3 p-3 rounded-xl"
                style={{ background: "var(--bg-elevated)" }}
              >
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold"
                  style={{
                    background: p.enabled ? "var(--accent)" : "var(--bg-card)",
                    color: p.enabled ? "white" : "var(--text-muted)",
                  }}
                >
                  {p.name[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-medium text-[var(--text-primary)] truncate">
                    {p.name}
                  </div>
                  <div className="text-[11px] text-[var(--text-muted)]">
                    {p.urls.filter((u) => u.enabled).length} URLs · {p.profile_directory}
                  </div>
                </div>
                <Badge variant={p.enabled ? "success" : "muted"}>
                  {p.enabled ? "On" : "Off"}
                </Badge>
              </div>
            ))}
          </div>
        </Card>

        {/* Desktop Apps Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Desktop Apps</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => setActiveSection("apps")}>
              Edit
            </Button>
          </CardHeader>
          <div className="flex flex-col gap-2">
            {config.desktop_apps.length === 0 ? (
              <p className="text-[13px] text-[var(--text-muted)] text-center py-4">
                No apps configured
              </p>
            ) : (
              config.desktop_apps.map((app) => (
                <div
                  key={app.id}
                  className="flex items-center gap-3 p-3 rounded-xl"
                  style={{ background: "var(--bg-elevated)" }}
                >
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold"
                    style={{
                      background: app.enabled ? "rgba(251,191,36,0.15)" : "var(--bg-card)",
                      color: app.enabled ? "#fbbf24" : "var(--text-muted)",
                    }}
                  >
                    {app.name[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-medium text-[var(--text-primary)] truncate">
                      {app.name}
                    </div>
                    <div className="text-[11px] text-[var(--text-muted)] truncate">
                      {app.launch_delay_ms > 0 ? `+${app.launch_delay_ms / 1000}s delay` : "Immediate"} · {app.launch_mode}
                    </div>
                  </div>
                  <Badge variant={app.enabled ? "warning" : "muted"}>
                    {app.enabled ? "On" : "Off"}
                  </Badge>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* Timing overview */}
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Launch Sequence</CardTitle>
          <span className="text-[12px] text-[var(--text-muted)]">Estimated startup time</span>
        </CardHeader>
        <LaunchTimeline config={config} />
      </Card>
    </div>
  );
}

function StatCard({
  label,
  value,
  total,
  icon,
  color,
  bg,
  onClick,
  isText,
}: {
  label: string;
  value: number | string;
  total?: number;
  icon: React.ReactNode;
  color: string;
  bg: string;
  onClick?: () => void;
  isText?: boolean;
}) {
  return (
    <Card hover={!!onClick} onClick={onClick}>
      <div className="flex items-center justify-between mb-3">
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${bg} ${color}`}>
          {icon}
        </div>
        {total !== undefined && (
          <span className="text-[11px] text-[var(--text-muted)]">of {total}</span>
        )}
      </div>
      <div className={`text-2xl font-display font-bold mb-0.5 ${isText ? "text-lg text-[var(--text-secondary)]" : "text-[var(--text-primary)]"}`}>
        {value}
      </div>
      <div className="text-[12px] text-[var(--text-muted)]">{label}</div>
    </Card>
  );
}

function LaunchTimeline({ config }: { config: AppConfig }) {
  const events: { label: string; time: number; type: "chrome" | "app" }[] = [];
  config.chrome_profiles.filter((p) => p.enabled).forEach((p) => {
    events.push({ label: `Chrome: ${p.name}`, time: p.launch_delay_ms, type: "chrome" });
  });
  config.desktop_apps.filter((a) => a.enabled).forEach((a) => {
    events.push({
      label: a.name,
      time: config.settings.delay_before_apps_ms + a.launch_delay_ms,
      type: "app",
    });
  });
  events.sort((a, b) => a.time - b.time);
  const maxTime = Math.max(...events.map((e) => e.time), 1000);

  return (
    <div className="flex flex-col gap-2">
      {events.map((ev, i) => (
        <div key={i} className="flex items-center gap-3">
          <span className="text-[11px] text-[var(--text-muted)] w-12 text-right flex-shrink-0">
            {(ev.time / 1000).toFixed(1)}s
          </span>
          <div className="flex-1 relative h-6 flex items-center">
            <div
              className="h-full rounded-lg flex items-center px-2"
              style={{
                width: `${Math.max(10, (ev.time / maxTime) * 100)}%`,
                background: ev.type === "chrome"
                  ? "rgba(96,165,250,0.15)"
                  : "rgba(251,191,36,0.12)",
                border: `1px solid ${ev.type === "chrome" ? "rgba(96,165,250,0.25)" : "rgba(251,191,36,0.2)"}`,
                minWidth: 60,
              }}
            >
              <span
                className="text-[11px] truncate"
                style={{ color: ev.type === "chrome" ? "#60a5fa" : "#fbbf24" }}
              >
                {ev.label}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
